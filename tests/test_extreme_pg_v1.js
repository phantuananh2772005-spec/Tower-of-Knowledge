const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { after, test } = require('node:test');
const express = require('express');
const db = require('../database/db');
const auth = require('../services/auth.service');
const adminContent = require('../services/admin-content.service');
const { awardRepeatXpInTransaction } = require('../services/economy.service');
const extremeRoutes = require('../routes/extreme.routes');
const { responseFormatter } = require('../middlewares/response.middleware');

after(() => db.close());

const discardFixtures = new Error('Rollback Extreme V1 fixtures');

function serializer() {
  let tail = Promise.resolve();
  return work => {
    const result = tail.then(work);
    tail = result.then(() => {}, () => {});
    return result;
  };
}

async function withRolledBackDatabase(work) {
  await db.verifyRuntime();
  const original = { ...db };
  await original.transaction(async raw => {
    const queueQuery = serializer();
    const queueTransaction = serializer();
    const tx = {
      query: (sql, values) => queueQuery(() => raw.query(sql, values)),
      queryOne: (sql, values) => queueQuery(() => raw.queryOne(sql, values)),
      execute: (sql, values) => queueQuery(() => raw.execute(sql, values))
    };
    let savepoint = 0;
    Object.assign(db, tx, {
      transaction: operation => queueTransaction(async () => {
        const name = 'extreme_test_' + (++savepoint);
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
      })
    });
    try {
      await work(tx);
    } finally {
      Object.assign(db, original);
    }
    throw discardFixtures;
  }).then(
    () => assert.fail('The test transaction must roll back.'),
    error => { if (error !== discardFixtures) throw error; }
  );
}

async function withExtremeApi(work) {
  const app = express();
  app.use(express.json(), responseFormatter);
  app.use('/api/extreme', extremeRoutes);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port + '/api/extreme';
  async function send(path, body, token) {
    const response = await fetch(base + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: 'Bearer ' + token })
      },
      body: JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
  }
  try {
    await work(send);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

function ok(result) {
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.body.success, true);
  return result.body.data;
}

function reject(result) {
  assert.ok(result.status >= 400 && result.status < 500, JSON.stringify(result));
  assert.equal(result.body.success, false);
}

function verifyNoAnswerKeys(value) {
  const json = JSON.stringify(value);
  for (const field of [
    'correct_answer', 'correct_option_position', 'is_correct', 'explanation', 'blank_answer', 'correct_order', 'payload'
  ]) {
    assert.ok(!json.includes('"' + field + '"'), 'Leaked pre-answer field ' + field);
  }
}

async function bank(slug) {
  const subject = await adminContent.createCourse({ slug, name: 'Môn Cực Hạn V1' });
  const chapter = await adminContent.createChapter({ subject_id: subject.id, title: 'Chương Cực Hạn' });
  const milestone = await adminContent.createCheckpoint({ chapter_id: chapter.id, title: 'Mốc Cực Hạn' });
  const mcq = await adminContent.createQuestion({
    milestone_id: milestone.id, stem: 'Số nào là số chẵn?', explanation: 'Hai chia hết cho hai.',
    options: ['Ba', 'Một', 'Hai', 'Năm'].map((text, position) => ({ position, text, is_correct: position === 2 }))
  });
  return { subject, chapter, milestone, mcq };
}

async function addFill(milestoneId, stem) {
  return adminContent.createQuestion({
    milestone_id: milestoneId,
    type: 'FILL_BLANK',
    stem,
    explanation: 'Đáp án là chẵn.',
    payload: {
      sentence_template: 'Số 2 là số {blank}.',
      options: ['lẻ', 'chẵn'],
      blank_answer: 'chẵn'
    }
  });
}

test('Extreme uses the issued subject pool, records repeated answers, and rewards one concurrent finish', async () => {
  const slug = 'extreme-v1-' + randomUUID().slice(0, 8);
  await withRolledBackDatabase(async tx => {
    const own = await bank(slug);
    const other = await bank(slug + '-other');
    const fill = await addFill(own.milestone.id, 'Hoàn thành câu');
    const archivedMilestone = await adminContent.createCheckpoint({
      chapter_id: own.chapter.id, title: 'Mốc cũ', sort_order: 2
    });
    await addFill(archivedMilestone.id, 'Mốc này không còn hoạt động');
    await adminContent.deleteCheckpoint(archivedMilestone.id);
    await tx.execute('SET CONSTRAINTS ALL IMMEDIATE');

    const learner = await auth.register({ username: slug.replaceAll('-', '_'), password: 'nebulasky' });
    const outsider = await auth.register({ username: slug.replaceAll('-', '_') + '_other', password: 'nebulasky' });
    const prior = await awardRepeatXpInTransaction(tx, learner.user.id, 1497);
    assert.equal(prior.remaining_xp, 3);

    await withExtremeApi(async send => {
      reject(await send('/start', { subject_id: 'khong-ton-tai-' + slug }, learner.token));
      const issued = ok(await send('/start', { subject_id: own.subject.id }, learner.token));
      assert.equal(issued.subject_id, own.subject.id);
      assert.equal(issued.subject_name, own.subject.name);
      assert.equal(issued.pool_count, 2);
      assert.equal(issued.max_lives, 5);
      verifyNoAnswerKeys(issued);
      const first = issued.questions.find(question => question.id === own.mcq.id);
      const second = issued.questions.find(question => question.id === fill.id);
      assert.ok(first && second);
      assert.deepEqual(first.options.map(option => option.position).sort(), [0, 1, 2, 3]);

      const next = ok(await send('/next-batch', {
        session_id: issued.session_id, exclude_positions: [first.position]
      }, learner.token));
      assert.deepEqual(next.questions.map(question => question.id), [fill.id]);
      verifyNoAnswerKeys(next);
      assert.equal(ok(await send('/next-batch', {
        session_id: issued.session_id, exclude_positions: [first.position, second.position]
      }, learner.token)).exhausted, true);
      reject(await send('/next-batch', { session_id: issued.session_id }, outsider.token));
      reject(await send('/finish', { session_id: issued.session_id }, outsider.token));

      const answer = (attempt_no, position, response, token = learner.token) => send('/check-answer', {
        session_id: issued.session_id, attempt_no, position, ...response
      }, token);
      const chooseCorrect = { selected_option_position: first.options.find(option => option.text === 'Hai').position };
      reject(await answer(1, first.position, chooseCorrect, outsider.token));
      reject(await answer(1, 3, chooseCorrect));
      reject(await answer(1, first.position, { ...chooseCorrect, question_id: other.mcq.id }));
      reject(await answer(2, first.position, chooseCorrect));
      assert.equal((await tx.queryOne(
        'SELECT count(*)::int AS count FROM session_answers WHERE session_id = $1', [issued.session_id]
      )).count, 0);
      const firstAnswer = ok(await answer(1, first.position, chooseCorrect));
      assert.equal(firstAnswer.is_correct, true);
      assert.equal(firstAnswer.correct_answer, 'Hai');
      assert.equal(firstAnswer.correct_option_position, 2);
      assert.equal(firstAnswer.explanation, 'Hai chia hết cho hai.');
      assert.deepEqual(ok(await answer(1, first.position, chooseCorrect)), firstAnswer);
      reject(await answer(1, first.position, { selected_option_position: 0 }));
      reject(await answer(2, first.position, chooseCorrect));
      reject(await answer(2, second.position, { submitted_text: 'Ngoài danh sách' }));
      assert.equal(ok(await answer(2, second.position, { submitted_text: 'chẵn' })).is_correct, true);
      assert.equal(ok(await answer(3, first.position, chooseCorrect)).is_correct, true);

      // Exercise overlapping HTTP calls against the rollback fixture. Its savepoints share one connection.
      await tx.queryOne('SELECT pg_sleep(1.1)');
      reject(await send('/finish', { session_id: issued.session_id, score: 999999 }, learner.token));
      const results = (await Promise.all([
        send('/finish', { session_id: issued.session_id }, learner.token),
        send('/finish', { session_id: issued.session_id }, learner.token)
      ])).map(ok);
      assert.equal(results.filter(result => result.already_finished === false).length, 1);
      assert.equal(results.filter(result => result.already_finished === true).length, 1);
      const receipt = results.find(result => !result.already_finished);
      assert.deepEqual(results.find(result => result.already_finished), { ...receipt, already_finished: true });
      assert.equal(receipt.xp_awarded, 3);
      assert.equal(receipt.coins_awarded, 16);
      assert.equal(receipt.wallet.total_xp, 1500);
      assert.equal(receipt.wallet.coin_balance, 16);
      assert.deepEqual({
        answer_count: receipt.summary.answer_count, correct_count: receipt.summary.correct_count,
        best_combo: receipt.summary.best_combo, score: receipt.summary.score, round: receipt.summary.round
      }, { answer_count: 3, correct_count: 3, best_combo: 3, score: 43, round: 2 });
      reject(await answer(4, second.position, { submitted_text: 'chẵn' }));

      const stored = await tx.queryOne(
        'SELECT s.kind, s.subject_id, s.milestone_id, s.started_at, s.finished_at, s.finish_kind,'
        + ' v.duration_seconds::float8, v.average_seconds FROM study_sessions AS s'
        + ' JOIN v_study_session_stats AS v ON v.session_id = s.id WHERE s.id = $1', [issued.session_id]
      );
      assert.equal(stored.kind, 'EXTREME');
      assert.equal(stored.subject_id, own.subject.id);
      assert.equal(stored.milestone_id, null);
      assert.equal(stored.finish_kind, 'SUBMITTED');
      assert.ok(stored.finished_at > stored.started_at);
      assert.ok(stored.duration_seconds >= 1.1);
      assert.equal(receipt.summary.duration_seconds, Math.round((stored.finished_at - stored.started_at) / 1000));
      assert.equal(stored.average_seconds, null);

      const attempts = await tx.query(
        'SELECT a.attempt_no, q.question_id, a.selected_option_position, a.submitted_text, a.seconds'
        + ' FROM session_answers AS a JOIN study_session_questions AS q'
        + ' ON q.session_id = a.session_id AND q.position = a.question_position'
        + ' WHERE a.session_id = $1 ORDER BY a.attempt_no', [issued.session_id]
      );
      assert.deepEqual(attempts, [
        { attempt_no: 1, question_id: own.mcq.id, selected_option_position: 2, submitted_text: null, seconds: null },
        { attempt_no: 2, question_id: fill.id, selected_option_position: null, submitted_text: 'chẵn', seconds: null },
        { attempt_no: 3, question_id: own.mcq.id, selected_option_position: 2, submitted_text: null, seconds: null }
      ]);
      const economy = await tx.queryOne(
        'SELECT u.coin_balance, u.xp, w.xp AS weekly_xp, sum(l.delta)::int AS ledger_sum,'
        + " count(*) FILTER (WHERE l.kind = 'EXTREME_REWARD')::int AS rewards"
        + ' FROM users AS u JOIN weekly_xp_usage AS w ON w.user_id = u.id AND w.week_start = $2'
        + ' LEFT JOIN coin_ledger AS l ON l.user_id = u.id WHERE u.id = $1 GROUP BY u.id, w.xp',
        [learner.user.id, prior.week_start]
      );
      assert.deepEqual(economy, { coin_balance: 16, xp: 1500, weekly_xp: 1500, ledger_sum: 16, rewards: 1 });
    });
  });
  assert.equal(await db.queryOne('SELECT id FROM subjects WHERE slug = $1', [slug]), null);
});

test('Extreme guest can play and time out, with no persisted attempts or rewards', async () => {
  const slug = 'extreme-guest-' + randomUUID().slice(0, 8);
  await withRolledBackDatabase(async tx => {
    const { subject, mcq } = await bank(slug);
    await tx.execute('SET CONSTRAINTS ALL IMMEDIATE');
    await withExtremeApi(async send => {
      const issued = ok(await send('/start', { subject_id: slug }));
      assert.equal(issued.subject_id, subject.id);
      assert.equal(issued.pool_count, 1);
      assert.equal(issued.questions[0].id, mcq.id);
      verifyNoAnswerKeys(issued);
      const response = ok(await send('/check-answer', {
        session_id: issued.session_id, attempt_no: 1, position: issued.questions[0].position,
        response: { kind: 'TIMEOUT' }
      }));
      assert.equal(response.is_correct, false);
      const finish = ok(await send('/finish', { session_id: issued.session_id }));
      assert.equal(finish.coins_awarded, 0);
      assert.equal(finish.xp_awarded, 0);
      assert.equal(finish.wallet, null);
      assert.equal(finish.summary.answer_count, 1);
      assert.equal(finish.summary.correct_count, 0);
      assert.equal(await tx.queryOne('SELECT id FROM study_sessions WHERE id = $1', [issued.session_id]), null);
    });
  });
});
