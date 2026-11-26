const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { after, test } = require('node:test');
const express = require('express');
const db = require('../database/db');
const auth = require('../services/auth.service');
const courseRoutes = require('../routes/course.routes');
const profileRoutes = require('../routes/profile.routes');
const { responseFormatter } = require('../middlewares/response.middleware');

after(() => db.close());

const discardFixtures = new Error('Rollback course V1 fixtures');

async function withRolledBackDatabase(work) {
  await db.verifyRuntime();
  const original = { ...db };
  let savepoint = 0;
  await assert.rejects(original.transaction(async tx => {
    Object.assign(db, tx, {
      async transaction(operation) {
        const name = 'course_test_' + (++savepoint);
        await tx.execute('SAVEPOINT ' + name);
        try {
          const result = await operation(tx);
          await tx.execute('RELEASE SAVEPOINT ' + name);
          return result;
        } catch (error) {
          await tx.execute('ROLLBACK TO SAVEPOINT ' + name);
          await tx.execute('RELEASE SAVEPOINT ' + name);
          throw error;
        }
      }
    });
    try {
      await work(tx);
    } finally {
      Object.assign(db, original);
    }
    throw discardFixtures;
  }), error => error === discardFixtures);
}

async function withStudyApi(work) {
  const app = express();
  app.use(express.json(), responseFormatter);
  app.use('/api', courseRoutes, profileRoutes);
  app.use((req, res) => res.apiError('Endpoint not found', 'NOT_FOUND', 404));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  async function send(method, path, { token, body } = {}) {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(token && { Authorization: 'Bearer ' + token }),
        ...(body !== undefined && { 'Content-Type': 'application/json' })
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
  }
  try {
    await work(send);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

function success(result) {
  assert.ok(result.status >= 200 && result.status < 300, JSON.stringify(result.body));
  assert.equal(result.body.success, true);
  return result.body.data;
}

function rejected(result, status) {
  assert.equal(result.status, status, JSON.stringify(result.body));
  assert.equal(result.body.success, false);
}

async function seedCourse(tx, slug) {
  const subject = await tx.queryOne(
    "INSERT INTO subjects (slug, name, description, sort_order, status) VALUES ($1, 'Kho V1', 'Nội dung kiểm thử', 99, 'ACTIVE') RETURNING id",
    [slug]
  );
  const chapter = await tx.queryOne(
    "INSERT INTO chapters (subject_id, title, sort_order, status) VALUES ($1, 'Chương 1', 1, 'ACTIVE') RETURNING id",
    [subject.id]
  );
  const nextChapter = await tx.queryOne(
    "INSERT INTO chapters (subject_id, title, sort_order, status) VALUES ($1, 'Chương 2', 2, 'ACTIVE') RETURNING id",
    [subject.id]
  );
  const theory = await tx.queryOne(
    "INSERT INTO milestones (chapter_id, title, kind, theory_markdown, status, sort_order, reward_xp, reward_coins,"
    + " step_count, questions_per_step) VALUES ($1, 'Đọc trước', 'THEORY', '## Lý thuyết', 'ACTIVE', 1, 14, 6, 0, 0) RETURNING id",
    [chapter.id]
  );
  const quiz = await tx.queryOne(
    "INSERT INTO milestones (chapter_id, title, kind, theory_markdown, status, sort_order, reward_xp, reward_coins,"
    + " step_count, questions_per_step) VALUES ($1, 'Luyện tập', 'QUIZ', '## Lý thuyết kèm theo', 'ACTIVE', 2, 26, 12, 2, 1) RETURNING id",
    [chapter.id]
  );
  const next = await tx.queryOne(
    "INSERT INTO milestones (chapter_id, title, kind, status, sort_order, reward_xp, reward_coins, step_count,"
    + " questions_per_step) VALUES ($1, 'Mốc cuối', 'THEORY', 'ACTIVE', 1, 0, 0, 0, 0) RETURNING id",
    [nextChapter.id]
  );
  const question = await tx.queryOne(
    "INSERT INTO questions (milestone_id, type, bloom_level, step_no, difficulty, stem, explanation, status)"
    + " VALUES ($1, 'MULTIPLE_CHOICE', 'REMEMBER', 1, 1, 'Chọn số chẵn', 'Hai là số chẵn.', 'ACTIVE') RETURNING id",
    [quiz.id]
  );
  await tx.execute(
    "INSERT INTO question_options (question_id, position, text, is_correct) VALUES"
    + " ($1, 0, '1', false), ($1, 1, '3', false), ($1, 2, '2', true), ($1, 3, '5', false)",
    [question.id]
  );
  await tx.execute('SET CONSTRAINTS ALL IMMEDIATE');
  return { subjectId: subject.id, theoryId: theory.id, quizId: quiz.id, nextId: next.id, questionId: question.id };
}

async function startStep(send, id, token, stepNo) {
  return success(await send('POST', '/checkpoints/' + id + '/sessions', {
    token, body: { kind: 'STEP', step_no: stepNo }
  }));
}

async function answer(send, path, token, attemptNo, option, lookups) {
  return success(await send('POST', path + '/answer', {
    token,
    body: { position: 1, attempt_no: attemptNo, selected_option_position: option, seconds: 8, lookups }
  }));
}

async function finish(send, path, token, finishKind = 'SUBMITTED') {
  return success(await send('POST', path + '/finish', { token, body: { finish_kind: finishKind } }));
}

function withoutAnswerKeys(value) {
  for (const field of ['correct_answer', 'is_correct', 'explanation', 'blank_answer', 'correct_order']) {
    assert.ok(!JSON.stringify(value).includes('"' + field + '"'), 'Leaked pre-answer field ' + field);
  }
}

test('course enrollment, theory-only completion, ordered quiz rewards, durable attempts, and profile journey', async () => {
  const key = randomUUID().slice(0, 8);
  const slug = 'v1-course-' + key;
  const learnerName = 'course_v1_' + key;
  await withRolledBackDatabase(async tx => {
    const { theoryId, quizId, nextId, questionId } = await seedCourse(tx, slug);
    const learner = await auth.register({ username: learnerName, password: 'cerulean' });
    const outsider = await auth.register({ username: learnerName + '_other', password: 'cedarwalk' });
    const token = learner.token;
    await withStudyApi(async send => {
      const catalog = success(await send('GET', '/courses'));
      assert.ok(catalog.some(subject => subject.slug === slug));
      const guestRoadmap = success(await send('GET', '/courses/' + slug));
      assert.equal(guestRoadmap.chapters.length, 2);
      assert.deepEqual(success(await send('GET', '/my-courses', { token })), []);
      const unregistered = success(await send('GET', '/courses/' + slug, { token }));
      assert.equal(unregistered.enrolled_at, null);
      assert.deepEqual(success(await send('GET', '/my-courses', { token })), []);
      success(await send('POST', '/courses/' + slug + '/enroll', { token }));
      const enrolled = success(await send('GET', '/courses/' + slug, { token }));
      assert.equal(enrolled.enrolled_at != null, true);
      assert.deepEqual(enrolled.chapters.flatMap(chapter => chapter.milestones.map(milestone => milestone.status)),
        ['OPEN', 'LOCKED', 'LOCKED']);
      assert.equal(success(await send('POST', '/courses/' + slug + '/enroll', { token })).slug, slug);
      assert.equal(success(await send('GET', '/my-courses', { token })).length, 1);
      rejected(await send('GET', '/checkpoints/' + quizId, { token }), 403);
      rejected(await send('POST', '/checkpoints/' + theoryId + '/sessions', {
        token, body: { kind: 'STEP', step_no: 1 }
      }), 400);

      const completeTheory = () => send('POST', '/checkpoints/' + theoryId + '/complete-theory', { token });
      const theory = success(await completeTheory());
      assert.equal(theory.coins_awarded, 6);
      assert.equal(theory.xp_awarded, 14);
      assert.equal(theory.next_milestone_id, quizId);
      assert.equal(success(await completeTheory()).coins_awarded, 0);
      assert.equal(success(await send('GET', '/checkpoints/' + theoryId, { token })).record.stars, 1);

      const preview = success(await send('GET', '/checkpoints/' + quizId + '?step=1', { token }));
      assert.equal(preview.theory_markdown, '## Lý thuyết kèm theo');
      assert.equal(preview.record, null);
      assert.equal(preview.questions, undefined, 'Preview must not issue a session');
      withoutAnswerKeys(preview);
      const { count } = await tx.queryOne('SELECT count(*)::int FROM study_sessions WHERE user_id = $1', [learner.user.id]);
      assert.equal(count, 0);
      rejected(await send('POST', '/checkpoints/' + quizId + '/complete-theory', { token }), 400);
      rejected(await send('POST', '/checkpoints/' + quizId + '/sessions', {
        token, body: { kind: 'STEP', step_no: 2 }
      }), 400);
      rejected(await send('POST', '/checkpoints/' + quizId + '/check-answer', { token }), 404);

      const step1 = await startStep(send, quizId, token, 1);
      const firstPath = '/checkpoints/' + quizId + '/sessions/' + step1.id;
      assert.equal(step1.questions.length, 1);
      assert.equal(step1.questions[0].id, questionId);
      assert.deepEqual(step1.questions[0].options.map(item => item.position).sort(), [0, 1, 2, 3]);
      withoutAnswerKeys(step1);
      rejected(await send('GET', firstPath, { token: outsider.token }), 403);
      rejected(await send('POST', firstPath + '/answer', {
        token: outsider.token, body: { position: 1, attempt_no: 1, selected_option_position: 2 }
      }), 400);
      rejected(await send('POST', firstPath + '/answer', {
        token, body: { position: 2, attempt_no: 1, selected_option_position: 2 }
      }), 400);

      const lookup = { opened_at: new Date().toISOString(), duration_seconds: 2, offset_seconds: 0, context: 'BEFORE_ANSWER' };
      const wrong = await answer(send, firstPath, token, 1, 0, [lookup]);
      assert.equal(wrong.is_correct, false);
      assert.equal(wrong.correct_answer, 2);
      assert.equal(wrong.explanation, 'Hai là số chẵn.');
      const replay = await answer(send, firstPath, token, 1, 0, [lookup]);
      assert.equal(replay.attempt_no, 1);
      const afterLookup = { ...lookup, offset_seconds: 8, context: 'AFTER_ANSWER' };
      success(await send('POST', firstPath + '/lookups', {
        token, body: { attempt_no: 1, lookups: [afterLookup] }
      }));
      assert.equal((await answer(send, firstPath, token, 2, 2)).is_correct, true);
      const resumed = success(await send('GET', firstPath, { token }));
      assert.equal(resumed.id, step1.id);
      assert.equal(resumed.attempts.length, 2);
      assert.deepEqual(resumed.attempts[0].lookups.map(event => event.context), ['BEFORE_ANSWER', 'AFTER_ANSWER']);

      const firstGrade = await finish(send, firstPath, token);
      assert.equal(firstGrade.passed, true);
      assert.equal(firstGrade.completed, false);
      assert.equal(firstGrade.current_step, 2);
      assert.equal(firstGrade.coins_awarded, 6);
      assert.equal(firstGrade.xp_awarded, 13);
      assert.equal((await finish(send, firstPath, token)).coins_awarded, 0);
      assert.equal(success(await send('GET', '/checkpoints/' + quizId, { token })).record.accuracy_percent, 0);

      const retry = await startStep(send, quizId, token, 1);
      const retryPath = '/checkpoints/' + quizId + '/sessions/' + retry.id;
      await answer(send, retryPath, token, 1, 2);
      assert.equal((await finish(send, retryPath, token, 'ABANDONED')).coins_awarded, 0);

      const step2 = await startStep(send, quizId, token, 2);
      const secondPath = '/checkpoints/' + quizId + '/sessions/' + step2.id;
      await answer(send, secondPath, token, 1, 2);
      const secondGrade = await finish(send, secondPath, token);
      assert.equal(secondGrade.completed, true);
      assert.equal(secondGrade.next_milestone_id, nextId);
      assert.equal(secondGrade.coins_awarded, 6);
      assert.equal(success(await send('GET', '/checkpoints/' + nextId, { token })).status, 'OPEN');

      const final = success(await send('GET', '/courses/' + slug, { token }));
      assert.equal(final.completed_milestones, 2);
      assert.equal(final.total_milestones, 3);
      assert.equal(final.completion_percent, 66.7);
      assert.equal(final.chapters[0].milestones[1].record.recorded_steps, 2);
      const journey = success(await send('GET', '/profile/journey', { token }));
      assert.equal(journey.courses[0].slug, slug);
      assert.equal(journey.courses[0].completed_milestones, 2);
      assert.deepEqual(journey.season_awards, []);
      const totalSessions = journey.activity.reduce((sum, day) => sum + day.sessions, 0);
      assert.equal(totalSessions, 3, 'Both submitted sessions and a stored abandoned session count');

      const wallet = await tx.queryOne(
        'SELECT u.coin_balance, u.xp,'
        + ' (SELECT COALESCE(sum(delta), 0)::int FROM coin_ledger WHERE user_id = u.id) AS ledger_balance,'
        + ' (SELECT count(*)::int FROM coin_ledger WHERE user_id = u.id) AS ledger_entries'
        + ' FROM users u WHERE u.id = $1',
        [learner.user.id]
      );
      assert.deepEqual(wallet, { coin_balance: 18, ledger_balance: 18, xp: 40, ledger_entries: 3 });
    });
  });
  assert.equal(await db.queryOne('SELECT id FROM subjects WHERE slug = $1', [slug]), null);
  assert.equal(await db.queryOne('SELECT id FROM users WHERE username = $1', [learnerName]), null);
});

test('matching, ordering, and fill responses are graded by the server and keep their native stored forms', async () => {
  const key = randomUUID().slice(0, 8);
  const slug = 'v1-course-types-' + key;
  const learnerName = 'course_types_' + key;
  await withRolledBackDatabase(async tx => {
    const { theoryId, quizId } = await seedCourse(tx, slug);
    await tx.execute('UPDATE milestones SET questions_per_step = 4 WHERE id = $1', [quizId]);
    const pairs = [{ left: 'Dữ liệu', right: 'Thông tin thô' }, { left: 'Bảng', right: 'Hàng và cột' }];
    const tokens = ['SELECT', 'name', 'FROM', 'users'];
    const bank = [
      ['MATCHING', { pairs }],
      ['ORDERING', { prompt: 'Sắp xếp truy vấn', correct_order: tokens, distractors: ['DELETE'] }],
      ['FILL_BLANK', { sentence_template: 'Hai là số {blank}.', options: ['lẻ', 'chẵn'], blank_answer: 'chẵn' }]
    ];
    for (const [type, payload] of bank) {
      await tx.execute(
        "INSERT INTO questions (milestone_id, type, bloom_level, step_no, difficulty, stem, status, payload)"
        + " VALUES ($1, $2, 'REMEMBER', 1, 1, $2, 'ACTIVE', $3)",
        [quizId, type, payload]
      );
    }
    const { token } = await auth.register({ username: learnerName, password: 'nebulasky' });
    await withStudyApi(async send => {
      success(await send('POST', '/courses/' + slug + '/enroll', { token }));
      success(await send('POST', '/checkpoints/' + theoryId + '/complete-theory', { token }));
      const session = success(await send('POST', '/checkpoints/' + quizId + '/sessions', {
        token, body: { kind: 'MILESTONE' }
      }));
      const path = '/checkpoints/' + quizId + '/sessions/' + session.id;
      const byType = Object.fromEntries(session.questions.map(question => [question.type, question]));
      assert.deepEqual(Object.keys(byType).sort(), ['FILL_BLANK', 'MATCHING', 'MULTIPLE_CHOICE', 'ORDERING']);
      withoutAnswerKeys(session);
      const matching = byType.MATCHING.position;
      const verifiedPair = success(await send('POST', path + '/pair', {
        token, body: { position: matching, left: pairs[0].left, right: pairs[0].right }
      }));
      const rejectedPair = success(await send('POST', path + '/pair', {
        token, body: { position: matching, left: pairs[0].left, right: pairs[1].right }
      }));
      assert.equal(verifiedPair.matches, true);
      assert.equal(rejectedPair.matches, false);
      assert.deepEqual((await tx.queryOne('SELECT count(*)::int FROM session_answers WHERE session_id = $1', [session.id])).count, 0);

      const submit = (type, attempt_no, response) => send('POST', path + '/answer', {
        token, body: { position: byType[type].position, attempt_no, seconds: 5, ...response }
      });
      rejected(await submit('MATCHING', 1, {
        response: { kind: 'MATCHING', pairs: [{ left: pairs[0].left, right: 'Ngoài ngân hàng' }] }
      }), 400);
      assert.equal(success(await submit('MATCHING', 1, { response: { kind: 'MATCHING', pairs } })).is_correct, true);
      assert.equal(success(await submit('ORDERING', 2, { response: { kind: 'ORDERING', tokens } })).is_correct, true);
      assert.equal(success(await submit('FILL_BLANK', 3, { submitted_text: 'chẵn' })).is_correct, true);
      assert.equal(success(await submit('MULTIPLE_CHOICE', 4, { selected_option_position: 2 })).is_correct, true);

      const attempts = await tx.query(
        'SELECT selected_option_position, submitted_text, response FROM session_answers WHERE session_id = $1 ORDER BY attempt_no',
        [session.id]
      );
      assert.deepEqual(attempts, [
        { selected_option_position: null, submitted_text: null, response: { kind: 'MATCHING', pairs } },
        { selected_option_position: null, submitted_text: null, response: { kind: 'ORDERING', tokens } },
        { selected_option_position: null, submitted_text: 'chẵn', response: null },
        { selected_option_position: 2, submitted_text: null, response: null }
      ]);
      const result = await finish(send, path, token);
      assert.equal(result.score_percent, 100);
      assert.equal(result.completed, true);
      assert.equal(result.coins_awarded, 12);
      assert.equal((await finish(send, path, token)).coins_awarded, 0);
    });
  });
  assert.equal(await db.queryOne('SELECT id FROM subjects WHERE slug = $1', [slug]), null);
  assert.equal(await db.queryOne('SELECT id FROM users WHERE username = $1', [learnerName]), null);
});
