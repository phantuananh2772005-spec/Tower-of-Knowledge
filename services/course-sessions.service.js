const { isDeepStrictEqual } = require('node:util');
const db = require('../database/db');
const { calculateQuestionWeight } = require('../core/rules/adaptive.rules');
const { getStudyQuestionExclusions } = require('../core/rules/seeded-study-content');
const { applyMilestoneProgress, lockCourseUser, lockOpenMilestone } = require('./course.service');
const { correctAnswer, getStepConfig, gradeQuestion, pairMatches, pickStudyQuestions, presentQuestion } = require('./study-questions');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validIndex = value => Number.isInteger(value) && value > 0 && value <= 2147483647;
const LOOKUP_CONTEXTS = ['BEFORE_ANSWER', 'AFTER_ANSWER'];
const STUDY_PASS_PERCENT = 70;

function requirePosition(position) {
  if (!validIndex(position)) throw new Error('Vị trí câu hỏi không hợp lệ.');
}

async function loadSession(tx, milestoneId, userId, sessionId, forUpdate = false) {
  if (![milestoneId, userId, sessionId].every(value => typeof value === 'string' && UUID.test(value))) {
    throw new Error('Phiên học không tồn tại.');
  }
  const session = await tx.queryOne(
    "SELECT id, milestone_id, kind, step_no, finished_at, finish_kind FROM study_sessions"
      + " WHERE id = $1 AND user_id = $2 AND milestone_id = $3 AND kind IN ('STEP', 'MILESTONE')"
      + (forUpdate ? ' FOR UPDATE' : ' FOR SHARE'),
    [sessionId, userId, milestoneId]
  );
  if (!session) throw new Error('Phiên học không tồn tại.');
  return session;
}

async function issuedQuestions(tx, sessionId, position = null) {
  return tx.query(
    "SELECT sq.position, q.id, q.type, q.stem, q.bloom_level, q.difficulty, q.explanation, q.payload,"
      + " COALESCE((SELECT jsonb_agg(jsonb_build_object('position', o.position, 'text', o.text,"
      + " 'is_correct', o.is_correct) ORDER BY o.position) FROM question_options o WHERE o.question_id = q.id),"
      + " '[]'::jsonb) AS options"
      + ' FROM study_session_questions sq JOIN questions q ON q.id = sq.question_id'
      + ' WHERE sq.session_id = $1 AND ($2::integer IS NULL OR sq.position = $2)'
      + ' ORDER BY sq.position',
    [sessionId, position]
  );
}

async function requireIssuedQuestion(tx, sessionId, position) {
  const [question] = await issuedQuestions(tx, sessionId, position);
  if (!question) throw new Error('Câu hỏi không thuộc phiên học.');
  return question;
}

function serializeLookup(row) {
  return {
    lookup_no: row.lookup_no,
    opened_at: new Date(row.opened_at).toISOString(),
    duration_seconds: row.duration_seconds,
    offset_seconds: row.offset_seconds,
    context: row.context
  };
}

function feedback(answerRow, question, lookups) {
  const { attempt_no, question_position, is_correct, seconds, selected_option_position, submitted_text, response } = answerRow;
  return {
    attempt_no, position: question_position, is_correct,
    seconds: seconds === null ? null : Number(seconds),
    selected_option_position, submitted_text, response, lookups,
    explanation: question.explanation,
    correct_answer: correctAnswer(question)
  };
}

async function describeSession(tx, session) {
  const questions = await issuedQuestions(tx, session.id);
  const attempts = await tx.query(
    'SELECT * FROM session_answers WHERE session_id = $1 ORDER BY attempt_no',
    [session.id]
  );
  const allLookups = await tx.query(
    'SELECT * FROM session_answer_lookups WHERE session_id = $1 ORDER BY attempt_no, lookup_no',
    [session.id]
  );
  const lookupsByAttempt = new Map();
  for (const lookup of allLookups) {
    if (!lookupsByAttempt.has(lookup.attempt_no)) lookupsByAttempt.set(lookup.attempt_no, []);
    lookupsByAttempt.get(lookup.attempt_no).push(serializeLookup(lookup));
  }
  const questionsByPosition = new Map(questions.map(question => [question.position, question]));
  return {
    ...session,
    questions: questions.map(question => presentQuestion(question, session.id)),
    attempts: attempts.map(attempt => feedback(
      attempt,
      questionsByPosition.get(attempt.question_position),
      lookupsByAttempt.get(attempt.attempt_no) ?? []
    ))
  };
}

async function startSession(milestoneId, userId, { kind, step_no = null } = {}) {
  if (kind !== 'STEP' && kind !== 'MILESTONE') throw new Error('Loại phiên học không hợp lệ.');
  if ((kind === 'STEP' && !validIndex(step_no)) || (kind === 'MILESTONE' && step_no !== null)) {
    throw new Error('Chặng học không hợp lệ.');
  }

  return db.transaction(async tx => {
    await lockCourseUser(tx, userId);
    const milestone = await lockOpenMilestone(tx, milestoneId, userId);
    if (milestone.kind === 'THEORY') throw new Error('Mốc lý thuyết không có phiên bài tập.');
    if (kind === 'STEP' && (step_no > milestone.step_count
        || (!milestone.progress.completed_at && step_no > milestone.progress.current_step))) {
      throw new Error('Chặng học chưa được mở.');
    }
    const previous = await tx.queryOne(
      'SELECT id, milestone_id, kind, step_no, finished_at, finish_kind FROM study_sessions'
        + ' WHERE user_id = $1 AND milestone_id = $2 AND kind = $3 AND step_no IS NOT DISTINCT FROM $4::smallint'
        + ' AND finished_at IS NULL ORDER BY id LIMIT 1 FOR UPDATE',
      [userId, milestoneId, kind, step_no]
    );
    if (previous) return describeSession(tx, previous);

    const pool = await tx.query(
      "SELECT q.id, q.bloom_level FROM questions q JOIN milestones m ON m.id = q.milestone_id"
        + " WHERE m.status = 'ACTIVE' AND q.status = 'ACTIVE'"
        + ' AND (CASE WHEN $1::boolean THEN m.chapter_id = $2 ELSE m.id = $3 END)'
        + ' AND NOT (q.id = ANY($4::uuid[]))'
        + ' ORDER BY m.id, q.id FOR SHARE OF m, q',
      [milestone.kind === 'BOSS', milestone.chapter_id, milestoneId, getStudyQuestionExclusions(milestoneId)]
    );
    if (!pool.length) throw new Error('Mốc bài học chưa có câu hỏi.');
    const activeStep = step_no ?? (milestone.progress.current_step || 1);
    const selected = pickStudyQuestions(
      pool, milestone.questions_per_step, getStepConfig(milestone, activeStep), milestone.progress.memory ?? {}
    );
    const session = await tx.queryOne(
      'INSERT INTO study_sessions (user_id, kind, milestone_id, step_no) VALUES ($1, $2, $3, $4)'
        + ' RETURNING id, milestone_id, kind, step_no, finished_at, finish_kind',
      [userId, kind, milestoneId, step_no]
    );
    await tx.execute(
      'INSERT INTO study_session_questions (session_id, position, question_id)'
        + ' SELECT $1, seq::integer, question_id FROM unnest($2::uuid[]) WITH ORDINALITY AS questions(question_id, seq)',
      [session.id, selected.map(question => question.id)]
    );
    return describeSession(tx, session);
  });
}

async function getSession(milestoneId, userId, sessionId) {
  return db.transaction(async tx => describeSession(tx, await loadSession(tx, milestoneId, userId, sessionId)));
}

function normalizeLookups(lookups = []) {
  if (!Array.isArray(lookups)) throw new Error('Nhật ký tra cứu không hợp lệ.');
  return lookups.map(entry => {
    const date = typeof entry?.opened_at === 'string' ? new Date(entry.opened_at) : null;
    if (!date || !Number.isFinite(date.getTime()) || !validIndex(entry.duration_seconds)
        || !Number.isInteger(entry.offset_seconds) || entry.offset_seconds < 0 || entry.offset_seconds > 2147483647
        || !LOOKUP_CONTEXTS.includes(entry.context)) {
      throw new Error('Nhật ký tra cứu không hợp lệ.');
    }
    return {
      opened_at: date.toISOString(),
      duration_seconds: entry.duration_seconds,
      offset_seconds: entry.offset_seconds,
      context: entry.context
    };
  });
}

function sameLookup(left, right) {
  return left.opened_at === right.opened_at && left.duration_seconds === right.duration_seconds
    && left.offset_seconds === right.offset_seconds && left.context === right.context;
}

async function saveLookups(tx, session, attemptNo, received) {
  const lookups = (await tx.query(
    'SELECT * FROM session_answer_lookups WHERE session_id = $1 AND attempt_no = $2 ORDER BY lookup_no',
    [session.id, attemptNo]
  )).map(serializeLookup);
  let nextLookup = (lookups.at(-1)?.lookup_no ?? 0) + 1;
  for (const item of received) {
    if (lookups.some(existing => sameLookup(existing, item))) continue;
    if (session.finished_at !== null) throw new Error('Phiên học đã kết thúc.');
    const lookup_no = nextLookup++;
    await tx.execute(
      'INSERT INTO session_answer_lookups'
        + ' (session_id, attempt_no, lookup_no, opened_at, duration_seconds, offset_seconds, context)'
        + ' VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [session.id, attemptNo, lookup_no, item.opened_at, item.duration_seconds, item.offset_seconds, item.context]
    );
    lookups.push({ lookup_no, ...item });
  }
  return lookups;
}

async function answer(milestoneId, userId, sessionId, submission = {}) {
  const { position, attempt_no, seconds = null } = submission;
  requirePosition(position);
  if (!validIndex(attempt_no)) throw new Error('Số lượt trả lời không hợp lệ.');
  if (seconds !== null && (typeof seconds !== 'number' || !Number.isFinite(seconds)
      || seconds < 0 || seconds > 9999999.999)) {
    throw new Error('Thời gian trả lời không hợp lệ.');
  }
  const lookups = normalizeLookups(submission.lookups);

  return db.transaction(async tx => {
    await lockCourseUser(tx, userId);
    const session = await loadSession(tx, milestoneId, userId, sessionId, true);
    const question = await requireIssuedQuestion(tx, session.id, position);
    const graded = gradeQuestion(question, submission);
    const previous = await tx.queryOne(
      'SELECT * FROM session_answers WHERE session_id = $1 AND attempt_no = $2',
      [session.id, attempt_no]
    );

    if (previous) {
      if (previous.question_position !== position || previous.selected_option_position !== graded.selected_option_position
          || previous.submitted_text !== graded.submitted_text || !isDeepStrictEqual(previous.response, graded.response)) {
        throw new Error('Lượt trả lời đã lưu nội dung khác.');
      }
      return feedback(previous, question, await saveLookups(tx, session, attempt_no, lookups));
    }
    if (session.finished_at !== null) throw new Error('Phiên học đã kết thúc.');

    const latest = await tx.queryOne(
      'SELECT COALESCE(max(attempt_no), 0) AS last_attempt FROM session_answers WHERE session_id = $1',
      [session.id]
    );
    if (attempt_no !== latest.last_attempt + 1) throw new Error('Thứ tự lượt trả lời không hợp lệ.');

    const saved = await tx.queryOne(
      'INSERT INTO session_answers (session_id, attempt_no, question_position, is_correct, seconds,'
        + ' selected_option_position, submitted_text, response) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'
        + ' RETURNING *',
      [
        session.id, attempt_no, position, graded.is_correct, seconds,
        graded.selected_option_position, graded.submitted_text, graded.response
      ]
    );
    return feedback(saved, question, await saveLookups(tx, session, attempt_no, lookups));
  });
}

async function attachLookups(milestoneId, userId, sessionId, { attempt_no, lookups } = {}) {
  if (!validIndex(attempt_no)) throw new Error('Số lượt trả lời không hợp lệ.');
  const received = normalizeLookups(lookups);
  return db.transaction(async tx => {
    await lockCourseUser(tx, userId);
    const session = await loadSession(tx, milestoneId, userId, sessionId, true);
    const existing = await tx.queryOne(
      'SELECT 1 FROM session_answers WHERE session_id = $1 AND attempt_no = $2',
      [session.id, attempt_no]
    );
    if (!existing) throw new Error('Lượt trả lời không tồn tại.');
    return { attempt_no, lookups: await saveLookups(tx, session, attempt_no, received) };
  });
}

async function checkPair(milestoneId, userId, sessionId, { position, left, right } = {}) {
  requirePosition(position);
  return db.transaction(async tx => {
    const session = await loadSession(tx, milestoneId, userId, sessionId);
    if (session.finished_at !== null) throw new Error('Phiên học đã kết thúc.');
    const question = await requireIssuedQuestion(tx, session.id, position);
    return { matches: pairMatches(question, left, right) };
  });
}

function memoryAfterAttempts(memory, questionsByPosition, attempts) {
  const next = { ...(memory ?? {}) };
  for (const attempt of attempts) {
    const questionId = questionsByPosition.get(attempt.position);
    // The existing adaptive function receives telemetry; the measured detail remains in session tables.
    next[questionId] = calculateQuestionWeight(next[questionId], {
      la_dung: attempt.is_correct,
      thoi_gian_giay: attempt.seconds,
      so_lan_tra_cuu: attempt.lookups.length
    });
  }
  return next;
}

async function finish(milestoneId, userId, sessionId, { finish_kind } = {}) {
  if (!['SUBMITTED', 'ABANDONED'].includes(finish_kind)) throw new Error('Cách kết thúc phiên không hợp lệ.');

  return db.transaction(async tx => {
    await lockCourseUser(tx, userId);
    const milestone = await lockOpenMilestone(tx, milestoneId, userId, { allowArchived: true });
    const session = await loadSession(tx, milestoneId, userId, sessionId, true);
    if (finish_kind === 'ABANDONED' && session.kind !== 'STEP') {
      throw new Error('Chỉ phiên học theo chặng có thể lưu dở.');
    }
    if (session.finish_kind && session.finish_kind !== finish_kind) throw new Error('Phiên học đã kết thúc.');
    const stats = await tx.queryOne(
      'SELECT answer_count, scored_question_count, scored_correct_count, scored_accuracy_percent'
        + ' FROM v_study_session_stats WHERE session_id = $1',
      [session.id]
    );
    if (Number(stats.answer_count) === 0) throw new Error('Phiên học chưa có lượt trả lời.');
    const score = Number(stats.scored_accuracy_percent ?? 0);
    const passed = finish_kind === 'SUBMITTED' && score >= STUDY_PASS_PERCENT;
    const result = {
      id: session.id, kind: session.kind, step_no: session.step_no,
      finish_kind, finished_at: session.finished_at, score_percent: score,
      correct_count: Number(stats.scored_correct_count), question_count: Number(stats.scored_question_count),
      passed, completed: Boolean(milestone.progress.completed_at), current_step: milestone.progress.current_step,
      coins_awarded: 0, xp_awarded: 0, next_milestone_id: null, already_finished: session.finished_at !== null
    };
    if (result.already_finished) return result;

    const { now } = await tx.queryOne('SELECT clock_timestamp() AS now');
    const { questions, attempts } = await describeSession(tx, session);
    const memory = memoryAfterAttempts(
      milestone.progress.memory, new Map(questions.map(question => [question.position, question.id])), attempts
    );
    await tx.execute(
      'UPDATE milestone_progress SET memory = $1 WHERE user_id = $2 AND milestone_id = $3',
      [memory, userId, milestoneId]
    );

    const isStep = session.kind === 'STEP';
    if (passed && !milestone.progress.completed_at && (!isStep || session.step_no === milestone.progress.current_step)) {
      const completed = !isStep || session.step_no === milestone.step_count;
      const reward = (amount, minimum) => isStep && amount > 0
        ? Math.max(minimum, Math.round(amount / milestone.step_count))
        : amount;
      const advanced = await applyMilestoneProgress(tx, milestone, userId, {
        completed,
        nextStep: completed ? null : session.step_no + 1,
        xp: reward(milestone.reward_xp, 10),
        coins: reward(milestone.reward_coins, 5),
        note: isStep ? 'Hoàn thành chặng ' + session.step_no + ' · ' + milestone.title : 'Hoàn thành mốc · ' + milestone.title,
        at: now
      });
      Object.assign(result, {
        coins_awarded: advanced.coins_awarded,
        xp_awarded: advanced.xp_awarded,
        next_milestone_id: advanced.next_milestone_id,
        current_step: advanced.current_step,
        completed: Boolean(advanced.completed_at)
      });
    }
    await tx.execute('UPDATE study_sessions SET finished_at = $1, finish_kind = $2 WHERE id = $3',
      [now, finish_kind, session.id]);
    return { ...result, finished_at: now };
  });
}

module.exports = { answer, attachLookups, checkPair, finish, getSession, startSession };
