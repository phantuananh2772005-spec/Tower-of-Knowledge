const { createHash, randomInt, randomUUID } = require('node:crypto');
const db = require('../database/db');
const { deriveUserLevel } = require('../core/rules/economy.rules');
const { MAX_LIVES, replayExtreme, extremeSummary, extremeRewards, extremeBadge, extremePrompt } =
  require('../core/rules/extreme.rules');
const { awardRepeatXpInTransaction } = require('./economy.service');
const { correctAnswer, gradeQuestion, presentQuestion } = require('./study-questions');
const { mutateCoinsInTransaction } = require('./wallet.service');

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_SESSIONS = 1000;
const MAX_ATTEMPTS = 1000;
const SECONDS_PER_QUESTION = 25;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const answerFields = new Set(['session_id', 'attempt_no', 'position', 'selected_option_position', 'submitted_text', 'response']);
const guestSessions = new Map();
const receipts = new Map();
const pendingFinishes = new Map();

const validIndex = value => Number.isInteger(value) && value > 0 && value <= 2147483647;
const requireSessionId = id => {
  if (typeof id !== 'string' || !UUID.test(id)) throw new Error('Phiên Cực Hạn không hợp lệ.');
};

function expireEntries(entries, now) {
  for (const [key, item] of entries) {
    if (item.expires <= now) entries.delete(key);
  }
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const target = randomInt(index + 1);
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function quickChoices(question, sessionId) {
  const { type, payload } = question;
  let texts;
  if (type === 'FILL_BLANK') {
    texts = payload.options;
  } else if (type === 'MATCHING') {
    texts = payload.pairs.map(pair => pair.right);
  } else {
    const tokens = payload.correct_order;
    const rotated = [...tokens.slice(1), tokens[0]];
    const swapped = tokens.length > 1 ? [tokens[1], tokens[0], ...tokens.slice(2)] : tokens;
    const variants = [tokens, [...tokens].reverse(), rotated, swapped];
    variants.push(...payload.distractors.map(token => [token, ...tokens.slice(1)]));
    texts = variants.map(variant => variant.join(' → '));
  }

  return [...new Set(texts)]
    .map(text => ({
      text,
      order: createHash('sha256').update(JSON.stringify([sessionId, question.id, text])).digest('hex')
    }))
    .sort((a, b) => a.order.localeCompare(b.order))
    .map(({ text }) => ({ text }));
}

function publicQuestion(question, sessionId) {
  if (question.type === 'MULTIPLE_CHOICE') return presentQuestion(question, sessionId);
  const { id, position, type, bloom_level, difficulty } = question;
  return {
    id, position, type, bloom_level, difficulty,
    stem: extremePrompt(question),
    options: quickChoices(question, sessionId)
  };
}

async function resolveSubject(tx, selector = null) {
  if (selector != null && (typeof selector !== 'string' || !selector.trim())) {
    throw new Error('Môn học không hợp lệ.');
  }
  const value = selector?.trim() ?? null;
  const subject = await tx.queryOne(`
    SELECT id, name FROM subjects
    WHERE status = 'ACTIVE' AND (id = $1::uuid OR slug = $2::text OR ($1 IS NULL AND $2 IS NULL))
    ORDER BY sort_order, id LIMIT 1 FOR SHARE
  `, value && UUID.test(value) ? [value, null] : [null, value]);
  if (!subject) throw new Error('Không tìm thấy môn Cực Hạn đang mở.');
  return subject;
}

const QUESTION_COLUMNS = "q.id, q.type, q.stem, q.bloom_level, q.difficulty, q.payload, q.explanation,"
  + " COALESCE((SELECT jsonb_agg(jsonb_build_object('position', o.position, 'text', o.text,"
  + " 'is_correct', o.is_correct) ORDER BY o.position) FROM question_options o WHERE o.question_id = q.id),"
  + " '[]'::jsonb) AS options";

async function activeQuestions(tx, subjectId) {
  const rows = await tx.query(
    'SELECT ' + QUESTION_COLUMNS + ' FROM chapters c JOIN milestones m ON m.chapter_id = c.id'
      + ' JOIN questions q ON q.milestone_id = m.id'
      + " WHERE c.subject_id = $1 AND c.status = 'ACTIVE' AND m.status = 'ACTIVE' AND q.status = 'ACTIVE'"
      + ' ORDER BY c.id, m.id, q.id FOR SHARE OF c, m, q',
    [subjectId]
  );
  return shuffle(rows).map((question, index) => ({ ...question, position: index + 1 }));
}

async function lockUser(tx, userId) {
  const user = await tx.queryOne(
    "SELECT id, coin_balance, xp FROM users WHERE id = $1 AND disabled_at IS NULL"
      + " AND role IN ('LEARNER', 'ADMIN') FOR UPDATE",
    [userId]
  );
  if (!user) throw new Error('Không tìm thấy người chơi Cực Hạn đang hoạt động.');
  return user;
}

async function openDurableSession(tx, userId, subject, questions) {
  const session = await tx.queryOne(
    "INSERT INTO study_sessions (user_id, kind, subject_id, started_at)"
      + " VALUES ($1, 'EXTREME', $2, clock_timestamp()) RETURNING id",
    [userId, subject.id]
  );
  await tx.execute(
    'INSERT INTO study_session_questions (session_id, position, question_id)'
      + ' SELECT $1, seq::integer, question_id FROM unnest($2::uuid[]) WITH ORDINALITY AS issued(question_id, seq)',
    [session.id, questions.map(question => question.id)]
  );
  return session.id;
}

function openGuestSession(id, questions) {
  const now = Date.now();
  expireEntries(guestSessions, now);
  if (guestSessions.size >= MAX_SESSIONS) throw new Error('Đấu trường đang bận. Hãy thử lại sau.');
  guestSessions.set(id, {
    started_at: now, expires: now + SESSION_TTL_MS, questions, attempts: [], result: null
  });
}

async function startSession(subjectSelector, userId = null) {
  const { subject, questions, publicQuestions, id } = await db.transaction(async tx => {
    if (userId) {
      await lockUser(tx, userId);
      await tx.queryOne("SELECT pg_advisory_xact_lock(hashtext('thap-tri-thuc-v1:extreme-open'))");
      const { at_capacity } = await tx.queryOne(`
        SELECT count(*) >= $1 AS at_capacity FROM study_sessions
        WHERE kind = 'EXTREME' AND finished_at IS NULL
          AND started_at > clock_timestamp() - $2 * interval '1 millisecond'
      `, [MAX_SESSIONS, SESSION_TTL_MS]);
      if (at_capacity) throw new Error('Đấu trường đang bận. Hãy thử lại sau.');
    }
    const subject = await resolveSubject(tx, subjectSelector);
    const questions = await activeQuestions(tx, subject.id);
    let id = null;
    if (questions.length) id = userId ? await openDurableSession(tx, userId, subject, questions) : randomUUID();
    return { subject, questions, publicQuestions: questions.map(question => publicQuestion(question, id)), id };
  });
  if (!userId && id) openGuestSession(id, questions);
  return {
    session_id: id, subject_id: subject.id, subject_name: subject.name, pool_count: questions.length,
    max_lives: MAX_LIVES, seconds_per_question: SECONDS_PER_QUESTION,
    questions: publicQuestions
  };
}

function requireGuest(id) {
  const session = guestSessions.get(id);
  if (!session || Date.now() >= session.expires) throw new Error('Phiên Cực Hạn đã hết hạn. Hãy bắt đầu lượt mới.');
  return session;
}

async function lockSession(tx, id, userId) {
  const session = await tx.queryOne(
    "SELECT s.id, s.started_at, s.finished_at, (SELECT count(*)::integer FROM study_session_questions q"
      + " WHERE q.session_id = s.id) AS pool_size FROM study_sessions s"
      + " WHERE id = $1 AND user_id = $2 AND kind = 'EXTREME' FOR UPDATE",
    [id, userId]
  );
  if (!session) throw new Error('Không tìm thấy phiên Cực Hạn.');
  return session;
}

async function databaseNow(tx, session, { allowFinished = false } = {}) {
  const { now } = await tx.queryOne('SELECT clock_timestamp() AS now');
  if ((!allowFinished || !session.finished_at) && now - session.started_at >= SESSION_TTL_MS) {
    throw new Error('Phiên Cực Hạn đã hết hạn. Hãy bắt đầu lượt mới.');
  }
  return now;
}

async function issuedQuestions(tx, sessionId, position = null, exclude = []) {
  return tx.query(
    'SELECT issued.position, ' + QUESTION_COLUMNS
      + ' FROM study_session_questions issued JOIN questions q ON q.id = issued.question_id'
      + ' WHERE issued.session_id = $1 AND ($2::integer IS NULL OR issued.position = $2)'
      + ' AND NOT (issued.position = ANY($3::integer[])) ORDER BY issued.position',
    [sessionId, position, exclude]
  );
}

async function getNextBatch(userId, { session_id, exclude_positions = [] } = {}) {
  requireSessionId(session_id);
  if (!Array.isArray(exclude_positions) || !exclude_positions.every(validIndex)) {
    throw new Error('Danh sách vị trí câu hỏi không hợp lệ.');
  }
  const excluded = new Set(exclude_positions);
  let questions;
  if (userId) {
    questions = await db.transaction(async tx => {
      await lockUser(tx, userId);
      const session = await lockSession(tx, session_id, userId);
      if (session.finished_at) throw new Error('Phiên Cực Hạn đã kết thúc.');
      await databaseNow(tx, session);
      return issuedQuestions(tx, session.id, null, [...excluded]);
    });
  } else {
    const session = requireGuest(session_id);
    if (session.result) throw new Error('Phiên Cực Hạn đã kết thúc.');
    questions = session.questions.filter(question => !excluded.has(question.position));
  }
  return { session_id, exhausted: !questions.length, questions: questions.map(q => publicQuestion(q, session_id)) };
}

function gradeExtreme(question, sessionId, submission) {
  const { selected_option_position, submitted_text, response } = submission;
  if (question.type === 'MULTIPLE_CHOICE' || question.type === 'FILL_BLANK' || response != null) {
    const graded = gradeQuestion(question, submission);
    if (graded.response && graded.response.kind !== 'TIMEOUT') {
      throw new Error('Cực Hạn nhận đáp án dạng lựa chọn nhanh.');
    }
    return graded;
  }

  if (selected_option_position != null || typeof submitted_text !== 'string'
    || !quickChoices(question, sessionId).some(choice => choice.text === submitted_text)) {
    throw new Error('Phương án không thuộc câu hỏi Cực Hạn.');
  }
  const correct = correctAnswer(question);
  const expected = question.type === 'MATCHING' ? correct[0].right : correct.join(' → ');
  return { selected_option_position: null, submitted_text, response: null, is_correct: submitted_text === expected };
}

function sameSubmission(previous, position, graded) {
  return previous.question_position === position
    && previous.selected_option_position === graded.selected_option_position
    && previous.submitted_text === graded.submitted_text
    && (previous.response?.kind ?? null) === (graded.response?.kind ?? null);
}

function answerResult(question, attempts, poolSize) {
  const attempt = attempts.at(-1);
  const key = correctAnswer(question);
  let text = key;
  if (question.type === 'MULTIPLE_CHOICE') text = question.options.find(option => option.position === key).text;
  if (question.type === 'MATCHING') text = key[0].right;
  if (question.type === 'ORDERING') text = key.join(' → ');
  return {
    attempt_no: attempt.attempt_no, position: attempt.question_position, is_correct: attempt.is_correct,
    correct_option_position: question.type === 'MULTIPLE_CHOICE' ? key : null,
    correct_answer: text, explanation: question.explanation,
    stats: replayExtreme(attempts, poolSize)
  };
}

function submitAttempt(sessionId, question, attempts, poolSize, submission, finished) {
  const { attempt_no, position } = submission;
  const graded = gradeExtreme(question, sessionId, submission);
  const previous = attempts[attempt_no - 1];
  if (previous) {
    if (!sameSubmission(previous, position, graded)) throw new Error('Lượt này đã lưu với câu trả lời khác.');
    return { feedback: answerResult(question, attempts.slice(0, attempt_no), poolSize), saved: null };
  }
  if (finished) throw new Error('Phiên Cực Hạn đã kết thúc.');
  const stats = replayExtreme(attempts, poolSize);
  if (attempt_no !== attempts.length + 1 || stats.lives <= 0) throw new Error('Lượt trả lời không hợp lệ.');
  const roundStart = attempts.length - attempts.length % poolSize;
  if (attempts.slice(roundStart).some(attempt => attempt.question_position === position)) {
    throw new Error('Câu hỏi đã được trả lời trong vòng này.');
  }
  const saved = { attempt_no, question_position: position, ...graded };
  return { feedback: answerResult(question, [...attempts, saved], poolSize), saved };
}

async function readAttempts(tx, sessionId) {
  return tx.query(
    'SELECT attempt_no, question_position, is_correct, selected_option_position, submitted_text, response'
      + ' FROM session_answers WHERE session_id = $1 ORDER BY attempt_no',
    [sessionId]
  );
}

function gradeSession(userId, submission = {}) {
  const { session_id, position, attempt_no } = submission;
  requireSessionId(session_id);
  if (Object.keys(submission).some(key => !answerFields.has(key))
    || !validIndex(position) || !validIndex(attempt_no) || attempt_no > MAX_ATTEMPTS) {
    throw new Error('Lượt trả lời không hợp lệ.');
  }
  if (!userId) {
    const session = requireGuest(session_id);
    const question = session.questions[position - 1];
    if (!question) throw new Error('Câu hỏi không thuộc phiên Cực Hạn.');
    const { feedback, saved } = submitAttempt(
      session_id, question, session.attempts, session.questions.length, submission, Boolean(session.result)
    );
    if (saved) session.attempts.push(saved);
    return feedback;
  }
  return db.transaction(async tx => {
    await lockUser(tx, userId);
    const session = await lockSession(tx, session_id, userId);
    await databaseNow(tx, session);
    const [question] = await issuedQuestions(tx, session.id, position);
    if (!question) throw new Error('Câu hỏi không thuộc phiên Cực Hạn.');
    const attempts = await readAttempts(tx, session.id);
    const { feedback, saved } = submitAttempt(
      session.id, question, attempts, session.pool_size, submission, Boolean(session.finished_at)
    );
    if (saved) {
      await tx.execute(
        'INSERT INTO session_answers (session_id, attempt_no, question_position, is_correct,'
          + ' selected_option_position, submitted_text, response) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [session.id, saved.attempt_no, saved.question_position, saved.is_correct,
          saved.selected_option_position, saved.submitted_text, saved.response]
      );
    }
    return feedback;
  });
}

function finishResult(summary, coins, xp, user, alreadyFinished = false) {
  return {
    badge: extremeBadge(summary.correct_count),
    coins_awarded: coins,
    xp_awarded: xp,
    already_finished: alreadyFinished,
    summary,
    wallet: user ? { coin_balance: user.coin_balance, total_xp: user.xp, level: deriveUserLevel(user.xp) } : null
  };
}

async function finalizeDurable(userId, id) {
  return db.transaction(async tx => {
    const user = await lockUser(tx, userId);
    const session = await lockSession(tx, id, userId);
    const now = await databaseNow(tx, session, { allowFinished: true });
    const attempts = await readAttempts(tx, session.id);
    const stats = replayExtreme(attempts, session.pool_size);
    const summary = extremeSummary(stats, (session.finished_at ?? now) - session.started_at);
    const rewards = extremeRewards(stats);
    if (session.finished_at) {
      return { result: finishResult(summary, rewards.coins, rewards.xp ? null : 0, user, true) };
    }

    await tx.execute(
      "UPDATE study_sessions SET finished_at = $2, finish_kind = 'SUBMITTED' WHERE id = $1",
      [session.id, now]
    );
    if (rewards.coins) {
      const wallet = await mutateCoinsInTransaction(tx, userId, rewards.coins, 'EXTREME_REWARD', {
        note: 'Thưởng Cực Hạn', occurred_at: now
      });
      user.coin_balance = wallet.coin_balance;
    }
    let xpAwarded = 0;
    if (rewards.xp) {
      const xp = await awardRepeatXpInTransaction(tx, userId, rewards.xp, { occurred_at: now });
      xpAwarded = xp.xp_awarded;
      user.xp = xp.total_xp;
    }
    return {
      result: finishResult(summary, rewards.coins, xpAwarded, user),
      expires: session.started_at.getTime() + SESSION_TTL_MS
    };
  });
}

async function finishSession(userId, { session_id } = {}) {
  requireSessionId(session_id);
  if (!userId) {
    const session = requireGuest(session_id);
    if (session.result) return { ...session.result, already_finished: true };
    const stats = replayExtreme(session.attempts, session.questions.length);
    const summary = extremeSummary(stats, Date.now() - session.started_at);
    session.result = finishResult(summary, 0, 0, null);
    return session.result;
  }

  const key = userId + ':' + session_id.toLowerCase();
  const now = Date.now();
  const cached = receipts.get(key);
  if (cached?.expires > now) return { ...cached.result, already_finished: true };
  const pending = pendingFinishes.get(key);
  if (pending) return { ...await pending, already_finished: true };

  const finished = finalizeDurable(userId, session_id).then(({ result, expires }) => {
    const committedAt = Date.now();
    if (expires > committedAt) {
      expireEntries(receipts, committedAt);
      if (receipts.size >= MAX_SESSIONS) receipts.delete(receipts.keys().next().value);
      receipts.set(key, { result, expires });
    }
    return result;
  });
  pendingFinishes.set(key, finished);
  try {
    return await finished;
  } finally {
    pendingFinishes.delete(key);
  }
}

module.exports = { startSession, getNextBatch, gradeSession, finishSession };
