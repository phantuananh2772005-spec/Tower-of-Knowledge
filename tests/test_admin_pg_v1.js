const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { after, test } = require('node:test');
const express = require('express');
const db = require('../database/db');
const auth = require('../services/auth.service');
const adminRoutes = require('../routes/admin.routes');
const courseRoutes = require('../routes/course.routes');
const { responseFormatter } = require('../middlewares/response.middleware');

after(() => db.close());

const discardFixtures = new Error('Rollback Admin V1 fixtures');
const password = 'cerulean';

async function withRolledBackDatabase(work) {
  await db.verifyRuntime();
  const original = { ...db };
  let savepoint = 0;
  await assert.rejects(original.transaction(async tx => {
    let queryQueue = Promise.resolve();
    function serialize(query) {
      return (...args) => {
        const result = queryQueue.then(() => query(...args));
        queryQueue = result.then(() => {}, () => {});
        return result;
      };
    }
    Object.assign(db, {
      query: serialize(tx.query),
      queryOne: serialize(tx.queryOne),
      execute: serialize(tx.execute),
      async transaction(operation) {
        const name = 'admin_test_' + (++savepoint);
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

async function withApi(work) {
  const app = express();
  app.use(express.json(), responseFormatter);
  app.use('/api/admin', adminRoutes);
  app.use('/api', courseRoutes);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  async function send(method, path, token, body) {
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

function ok(result, status = 200) {
  assert.equal(result.status, status, JSON.stringify(result.body));
  assert.equal(result.body.success, true);
  return result.body.data;
}

function rejected(result, status) {
  assert.equal(result.status, status, JSON.stringify(result.body));
  assert.equal(result.body.success, false);
}

async function seedUsers(tx, tag) {
  const username = 'adminv1_' + tag;
  const adminFixture = await auth.register({ username, password });
  await tx.execute("UPDATE users SET role = 'ADMIN' WHERE id = $1", [adminFixture.user.id]);
  const admin = await auth.login({ username, password });
  const learner = await auth.register({ username: 'learner_adminv1_' + tag, password });
  return { admin, learner };
}

function options(answers, correctPosition) {
  return answers.map((text, position) => ({ position, text, is_correct: position === correctPosition }));
}

function assertAdminAttempts(telemetry, { session, original, questionBody }) {
  const recorded = telemetry.sessions.find(entry => entry.id === session.id);
  assert.ok(recorded?.finished_at);
  assert.deepEqual(recorded.attempts.map(attempt => ({
    question_id: attempt.question_id,
    attempt_no: attempt.attempt_no,
    stem: attempt.stem,
    answer_text: attempt.answer_text,
    correct_answer_text: attempt.correct_answer_text,
    is_correct: attempt.is_correct,
    seconds: attempt.seconds
  })), [
    {
      question_id: original.id, attempt_no: 1, stem: questionBody.stem,
      answer_text: 'Một', correct_answer_text: 'Hai', is_correct: false, seconds: 8
    },
    {
      question_id: original.id, attempt_no: 2, stem: questionBody.stem,
      answer_text: 'Hai', correct_answer_text: 'Hai', is_correct: true, seconds: 5
    }
  ]);
  assert.deepEqual(recorded.attempts[0].lookups.map(({ context, duration_seconds, offset_seconds }) => (
    [context, duration_seconds, offset_seconds]
  )), [['BEFORE_ANSWER', 3, 0], ['AFTER_ANSWER', 3, 8]]);
  assert.deepEqual(recorded.attempts[1].lookups, []);
}

test('Admin content paths version immutable questions and preserve archived attempts and lookups', async () => {
  const tag = randomUUID().slice(0, 8);
  const slug = 'admin-v1-' + tag;
  await withRolledBackDatabase(async tx => {
    const { admin, learner } = await seedUsers(tx, tag);
    await withApi(async send => {
      const subject = ok(await send('POST', '/admin/courses', admin.token, {
        slug, name: 'Môn Kiểm thử Admin V1', description: 'Nội dung quản trị', sort_order: 19
      }), 201);
      const chapter = ok(await send('POST', '/admin/chapters', admin.token, {
        subject_id: subject.id, title: 'Chương kiểm thử', sort_order: 1
      }), 201);
      const milestone = ok(await send('POST', '/admin/checkpoints', admin.token, {
        chapter_id: chapter.id, title: 'Bài trắc nghiệm', kind: 'QUIZ', theory_markdown: '# Ôn tập',
        reward_xp: 0, reward_coins: 0, sort_order: 1, step_count: 2, questions_per_step: 1
      }), 201);
      const questionBody = {
        milestone_id: milestone.id,
        type: 'MULTIPLE_CHOICE',
        bloom_level: 'REMEMBER',
        step_no: 1,
        difficulty: 1,
        stem: 'Số nào là số chẵn?',
        explanation: 'Hai chia hết cho hai.',
        options: options(['Một', 'Ba', 'Hai', 'Năm'], 2)
      };
      rejected(await send('POST', '/admin/questions', admin.token, {
        ...questionBody, options: questionBody.options.map(option => ({ ...option, is_correct: false }))
      }), 400);
      const original = ok(await send('POST', '/admin/questions', admin.token, questionBody), 201);
      const bank = '/admin/questions?milestone_id=' + milestone.id;
      rejected(await send('GET', bank, learner.token), 403);
      const active = ok(await send('GET', bank, admin.token));
      assert.deepEqual(active.map(question => question.id), [original.id]);
      assert.deepEqual(active[0].options, questionBody.options);

      ok(await send('POST', '/courses/' + slug + '/enroll', learner.token));
      const path = '/checkpoints/' + milestone.id + '/sessions';
      const session = ok(await send('POST', path, learner.token, { kind: 'STEP', step_no: 1 }));
      assert.equal(session.questions[0].id, original.id);
      assert.ok(session.questions[0].options.every(option => !Object.hasOwn(option, 'is_correct')));
      const sessionPath = path + '/' + session.id;
      const lookup = {
        opened_at: new Date().toISOString(), duration_seconds: 3, offset_seconds: 0, context: 'BEFORE_ANSWER'
      };
      const wrong = ok(await send('POST', sessionPath + '/answer', learner.token, {
        position: 1, attempt_no: 1, selected_option_position: 0, seconds: 8, lookups: [lookup]
      }));
      assert.equal(wrong.is_correct, false);
      ok(await send('POST', sessionPath + '/lookups', learner.token, {
        attempt_no: 1, lookups: [{ ...lookup, offset_seconds: 8, context: 'AFTER_ANSWER' }]
      }));

      const endpoint = '/admin/questions/' + original.id;
      const metadata = ok(await send('PUT', endpoint, admin.token, { step_no: 2, difficulty: 3 }));
      assert.equal(metadata.id, original.id);
      assert.equal(metadata.step_no, 2);
      assert.equal(metadata.difficulty, 3);
      const replacement = ok(await send('PUT', endpoint, admin.token, {
        stem: 'Số nào là số lẻ?',
        explanation: 'Ba là số lẻ.',
        options: options(['Hai', 'Ba', 'Bốn', 'Sáu'], 1)
      }));
      assert.notEqual(replacement.id, original.id);
      assert.equal(replacement.step_no, 2);
      assert.equal(replacement.difficulty, 3);
      assert.deepEqual(ok(await send('GET', bank, admin.token)).map(question => question.id), [replacement.id]);
      const versions = ok(await send('GET', bank + '&status=ALL', admin.token));
      const archived = versions.find(question => question.id === original.id);
      assert.equal(archived.status, 'ARCHIVED');
      assert.equal(archived.stem, questionBody.stem);
      assert.deepEqual(archived.options, questionBody.options);

      const retry = ok(await send('POST', sessionPath + '/answer', learner.token, {
        position: 1, attempt_no: 2, selected_option_position: 2, seconds: 5
      }));
      assert.equal(retry.is_correct, true);
      assert.equal(retry.correct_answer, 2);
      assert.equal(retry.explanation, questionBody.explanation);
      const finish = ok(await send('POST', sessionPath + '/finish', learner.token, { finish_kind: 'SUBMITTED' }));
      assert.equal(finish.passed, true);

      const { milestone_id, ...importable } = questionBody;
      const bulk = '/admin/questions/bulk';
      rejected(await send('POST', bulk, admin.token, {
        default_milestone_id: milestone_id, questions: [importable, { ...importable, options: [] }]
      }), 400);
      assert.equal(ok(await send('GET', bank + '&status=ALL', admin.token)).length, 2);
      const imported = ok(await send('POST', bulk, admin.token, {
        default_milestone_id: milestone_id, questions: [{ ...importable, stem: 'Bản nhập hàng loạt' }]
      }));
      assert.equal(imported.imported_count, 1);
      assert.equal(imported.question_ids.length, 1);

      for (const [collection, id] of [
        ['questions', replacement.id], ['questions', imported.question_ids[0]],
        ['checkpoints', milestone.id], ['chapters', chapter.id], ['courses', subject.id]
      ]) {
        assert.equal(ok(await send('DELETE', '/admin/' + collection + '/' + id, admin.token)).status, 'ARCHIVED');
      }
      rejected(await send('GET', '/courses/' + slug, learner.token), 404);
      assert.deepEqual(ok(await send('GET', bank, admin.token)), []);
      const curriculums = ok(await send('GET', '/admin/courses', admin.token));
      const archivedSubject = curriculums.find(course => course.id === subject.id);
      assert.equal(archivedSubject.status, 'ARCHIVED');
      assert.equal(archivedSubject.chapters[0].status, 'ARCHIVED');
      assert.equal(archivedSubject.chapters[0].milestones[0].status, 'ARCHIVED');
      const linked = await tx.queryOne(
        'SELECT question_id FROM study_session_questions WHERE session_id = $1', [session.id]
      );
      assert.equal(linked.question_id, original.id);

      const deep = ok(await send('GET', '/admin/learners/' + learner.user.id + '/telemetry', admin.token));
      assertAdminAttempts(deep, { session, original, questionBody });
      const feed = ok(await send('GET', '/admin/learning-activity', admin.token));
      assertAdminAttempts({ sessions: feed.recent_activities }, { session, original, questionBody });
      const storedStats = await tx.queryOne(
        'SELECT correct_count::int, answer_count::int, total_lookups::int'
        + ' FROM v_study_session_stats WHERE session_id = $1', [session.id]
      );
      assert.deepEqual(storedStats, { correct_count: 1, answer_count: 2, total_lookups: 2 });
      await tx.execute('SET CONSTRAINTS ALL IMMEDIATE');
    });
  });
  assert.equal(await db.queryOne('SELECT id FROM subjects WHERE slug = $1', [slug]), null);
});

test('Admin APIs reject guests and learners and adjust the wallet through the ledger', async () => {
  const tag = randomUUID().slice(0, 8);
  await withRolledBackDatabase(async tx => {
    const { admin, learner } = await seedUsers(tx, tag);
    await withApi(async send => {
      const walletPath = '/admin/users/' + learner.user.id + '/coins';
      rejected(await send('GET', '/admin/stats'), 401);
      rejected(await send('GET', '/admin/courses', learner.token), 403);
      rejected(await send('GET', '/admin/learners/' + learner.user.id + '/telemetry', learner.token), 403);
      rejected(await send('POST', walletPath, learner.token, { amount: 20, reason: 'Không có quyền' }), 403);
      rejected(await send('POST', walletPath, admin.token, { amount: 0, reason: 'Số xu bằng 0' }), 400);
      ok(await send('POST', walletPath, admin.token, { amount: 20, reason: 'Thưởng thử Admin V1' }));
      ok(await send('POST', walletPath, admin.token, { amount: -4, reason: 'Điều chỉnh thử Admin V1' }));
      rejected(await send('POST', walletPath, admin.token, { amount: -17, reason: 'Vượt quá số dư' }), 400);
      const wallet = await tx.queryOne(
        'SELECT u.coin_balance, (SELECT coalesce(sum(delta), 0)::int FROM coin_ledger WHERE user_id = u.id) AS ledger_total'
        + ' FROM users u WHERE u.id = $1', [learner.user.id]
      );
      assert.deepEqual(wallet, { coin_balance: 16, ledger_total: 16 });
      const history = ok(await send('GET', '/admin/transactions', admin.token));
      assert.deepEqual(history.filter(entry => entry.user_id === learner.user.id).map(entry => [
        entry.kind, entry.delta, entry.balance_after
      ]), [['ADMIN_ADJUSTMENT', -4, 16], ['ADMIN_ADJUSTMENT', 20, 20]]);
      const users = ok(await send('GET', '/admin/users', admin.token));
      assert.equal(users.find(user => user.id === learner.user.id).coin_balance, 16);
      for (const field of ['password_hash', 'google_sub', 'session_version']) {
        assert.ok(users.every(user => !Object.hasOwn(user, field)));
      }
      ok(await send('GET', '/admin/stats', admin.token));

      const userPath = '/admin/users/' + learner.user.id;
      const adminPath = '/admin/users/' + admin.user.id;
      rejected(await send('PUT', adminPath + '/disabled', admin.token, { disabled: true }), 400);
      rejected(await send('PUT', adminPath + '/role', admin.token, { role: 'LEARNER' }), 400);
      rejected(await send('PUT', userPath + '/role', admin.token, { role: 'SYSTEM' }), 400);
      ok(await send('PUT', userPath + '/role', admin.token, { role: 'ADMIN' }));
      rejected(await send('GET', '/admin/stats', learner.token), 401);
      const promoted = await auth.login({ username: learner.user.username, password });
      ok(await send('GET', '/admin/stats', promoted.token));
      ok(await send('PUT', userPath + '/disabled', admin.token, { disabled: true }));
      rejected(await send('GET', '/admin/stats', promoted.token), 401);
      await assert.rejects(auth.login({ username: learner.user.username, password }));
      ok(await send('PUT', userPath + '/disabled', admin.token, { disabled: false }));
      rejected(await send('GET', '/admin/stats', promoted.token), 401);
    });
  });
  assert.equal(await db.queryOne('SELECT id FROM users WHERE username = $1', ['learner_adminv1_' + tag]), null);
});
