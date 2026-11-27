const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { after, test } = require('node:test');
const express = require('express');
const auth = require('../services/auth.service');
const db = require('../database/db');
const economy = require('../services/economy.service');
const quests = require('../services/quest.service');
const { mutateCoinsInTransaction } = require('../services/wallet.service');
const economyRoutes = require('../routes/economy.routes');
const petRoutes = require('../routes/pet.routes');
const { responseFormatter } = require('../middlewares/response.middleware');

after(() => db.close());

const rollbackFixture = new Error('Rollback economy V1 fixtures');

async function withRolledBackDatabase(work, getQuestInstant = () => null) {
  await db.verifyRuntime();
  const original = { ...db };
  let savepoint = 0;
  let fixtureQueue = Promise.resolve();
  try {
    await original.transaction(async connection => {
      let queryQueue = Promise.resolve();
      const tx = Object.fromEntries(['query', 'queryOne', 'execute'].map(method => [
        method, (sql, params = []) => {
          const instant = getQuestInstant();
          const args = instant && sql.startsWith('WITH instant AS (SELECT COALESCE($1::timestamptz, clock_timestamp())')
            && params[0] === null ? [instant] : params;
          const result = queryQueue.then(() => connection[method](sql, args));
          queryQueue = result.catch(() => {});
          return result;
        }
      ]));

      async function runSavepoint(operation) {
        const name = 'economy_test_' + (++savepoint);
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

      Object.assign(db, tx, {
        transaction(operation) {
          // Requests may arrive together. This rollback-only fixture owns one test connection.
          const operationResult = fixtureQueue.then(() => runSavepoint(operation));
          fixtureQueue = operationResult.catch(() => {});
          return operationResult;
        }
      });
      try {
        await work(tx, runSavepoint);
      } finally {
        await fixtureQueue;
        Object.assign(db, original);
      }
      throw rollbackFixture;
    });
  } catch (error) {
    if (error !== rollbackFixture) throw error;
    return;
  }
  assert.fail('Expected the outer transaction to roll back the test fixtures');
}

async function withEconomyApi(work) {
  const app = express();
  app.use(express.json(), responseFormatter);
  app.use('/api/economy', economyRoutes);
  app.use('/api', petRoutes);
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

function success(response) {
  assert.equal(response.status, 200, JSON.stringify(response.body));
  assert.equal(response.body.success, true);
  return response.body.data;
}

function rejected(response, status) {
  assert.equal(response.status, status, JSON.stringify(response.body));
  assert.equal(response.body.success, false);
}

function claimPetQuest(send, token) {
  return send('POST', '/economy/claim-quest', { token, body: { quest_code: 'PET_CARE' } });
}

async function assertWalletsReconciled(tx) {
  const disagreements = await tx.query(
    'SELECT u.id, u.coin_balance, COALESCE(SUM(l.delta), 0) AS ledger_balance'
    + ' FROM users u LEFT JOIN coin_ledger l ON l.user_id = u.id'
    + ' GROUP BY u.id HAVING u.coin_balance <> COALESCE(SUM(l.delta), 0)'
  );
  assert.deepEqual(disagreements, [], 'All wallets must reconcile to the actual ledger');
}

test('quest permissions, completion, duplicate claims, onboarding and wallet rollback', async () => {
  const key = randomUUID().slice(0, 8);
  const learnerName = 'eco_learner_' + key;
  const otherName = 'eco_another_' + key;
  const systemName = 'eco_system_' + key;

  await withRolledBackDatabase(async (tx, runSavepoint) => {
    const learner = await auth.register({ username: learnerName, password: 'silvercreek' });
    const other = await auth.register({ username: otherName, password: 'morningpine' });
    const system = await tx.queryOne(
      "INSERT INTO users (username, email, display_name, role) VALUES ($1, $2, 'Test Bot', 'SYSTEM') RETURNING *",
      [systemName, systemName + '@local.invalid']
    );
    const systemToken = auth.generateToken(system);
    const token = learner.token;
    await withEconomyApi(async send => {
      const getStatus = async () => success(await send('GET', '/economy/quests-status', { token }));
      rejected(await send('GET', '/economy/quests-status'), 401);
      rejected(await claimPetQuest(send, systemToken), 401);
      rejected(await claimPetQuest(send, token), 400);
      rejected(await send('POST', '/economy/claim-quest', {
        token, body: { quest_code: 'NOT_CONFIGURED' }
      }), 400);

      const initial = await getStatus();
      assert.equal(initial.progress.PET_CARE, false);
      assert.equal(initial.onboarding_claimed, false);
      success(await send('POST', '/pets/care', { token, body: { action: 'pet' } }));
      assert.equal((await getStatus()).progress.PET_CARE, true);
      rejected(await claimPetQuest(send, other.token), 400);

      const rollbackAward = new Error('Force rollback after an actual quest reward');
      await assert.rejects(runSavepoint(async () => {
        const reward = success(await claimPetQuest(send, token));
        assert.equal(reward.coin_balance, 10);
        assert.equal((await getStatus()).claimed.PET_CARE, true);
        await assertWalletsReconciled(tx);
        throw rollbackAward;
      }), error => error === rollbackAward);

      assert.equal(Boolean((await getStatus()).claimed.PET_CARE), false);
      assert.equal((await tx.queryOne('SELECT coin_balance FROM users WHERE id = $1', [learner.user.id])).coin_balance, 0);
      await assertWalletsReconciled(tx);

      const claims = (await Promise.all([claimPetQuest(send, token), claimPetQuest(send, token)])).map(success);
      assert.equal(claims.filter(claim => !claim.already_claimed).length, 1,
        'Two HTTP requests share one reward on the rollback fixture connection');
      assert.deepEqual(claims.map(claim => claim.coins_awarded).sort(), [0, 10]);
      assert.deepEqual(claims.map(claim => claim.xp_awarded).sort(), [0, 15]);
      const current = await getStatus();
      assert.equal(current.claimed.PET_CARE, true);
      const claimRows = await tx.query('SELECT quest_code, vn_date FROM quest_claims WHERE user_id = $1', [learner.user.id]);
      assert.deepEqual(claimRows, [{ quest_code: 'PET_CARE', vn_date: current.vn_date }]);

      const onboarding = () => send('POST', '/economy/onboarding-gift', { token });
      assert.equal(success(await onboarding()).coins_awarded, 20);
      assert.equal(success(await onboarding()).already_claimed, true);
      assert.equal((await getStatus()).onboarding_claimed, true);
      const wallet = await tx.queryOne('SELECT coin_balance, xp FROM users WHERE id = $1', [learner.user.id]);
      assert.deepEqual(wallet, { coin_balance: 30, xp: 45 });

      const history = success(await send('GET', '/economy/transactions?limit=10', { token }));
      assert.deepEqual(history.map(({ kind, delta, balance_after }) => ({ kind, delta, balance_after })), [
        { kind: 'ONBOARDING_REWARD', delta: 20, balance_after: 30 },
        { kind: 'DAILY_QUEST_REWARD', delta: 10, balance_after: 10 },
        { kind: 'PET_STROKE', delta: 0, balance_after: 0 }
      ]);
      assert.equal(success(await send('GET', '/economy/transactions?limit=1', { token })).length, 1);
      assert.deepEqual(success(await send('GET', '/economy/transactions', { token: other.token })), []);
      await assertWalletsReconciled(tx);
    });
  });

  const fixture = await db.queryOne('SELECT id FROM users WHERE username = ANY($1::text[])',
    [[learnerName, otherName, systemName]]);
  assert.equal(fixture, null);
  await assertWalletsReconciled(db);
});

test('Vietnam daily quest eligibility and rewards move together across UTC 17:00', async () => {
  const learnerName = 'eco_day_' + randomUUID().slice(0, 8);
  const before = '2026-08-17T16:59:59.999Z';
  const after = '2026-08-17T17:00:00.000Z';
  let clock = before;

  await withRolledBackDatabase(async tx => {
    const { token, user } = await auth.register({ username: learnerName, password: 'rainfield' });
    const firstDay = await quests.readVietnamDay(tx, before);
    const nextDay = await quests.readVietnamDay(tx, after);
    assert.equal(firstDay.vn_date, '2026-08-17');
    assert.equal(firstDay.ends_at.toISOString(), after);
    assert.equal(nextDay.vn_date, '2026-08-18');
    assert.equal(nextDay.starts_at.toISOString(), after);

    await withEconomyApi(async send => {
      const getStatus = async () => success(await send('GET', '/economy/quests-status', { token }));
      const recordStroke = occurred_at => db.transaction(inner =>
        mutateCoinsInTransaction(inner, user.id, 0, 'PET_STROKE', { occurred_at })
      );
      await recordStroke(before);
      assert.equal((await getStatus()).progress.PET_CARE, true);
      assert.equal(success(await claimPetQuest(send, token)).coins_awarded, 10);
      assert.equal(success(await claimPetQuest(send, token)).coins_awarded, 0);

      clock = after;
      const dailyReset = await getStatus();
      assert.equal(dailyReset.vn_date, '2026-08-18');
      assert.equal(dailyReset.claimed.PET_CARE, false);
      assert.equal(dailyReset.progress.PET_CARE, false);
      rejected(await claimPetQuest(send, token), 400);

      const { id: subjectId } = await tx.queryOne(
        "INSERT INTO subjects (slug, name, sort_order) VALUES ($1, 'Quest boundary', 90) RETURNING id",
        ['quest-boundary-' + randomUUID()]
      );
      const { id: sessionId } = await tx.queryOne(
        "INSERT INTO study_sessions (user_id, kind, subject_id, started_at, finished_at, finish_kind)"
        + " VALUES ($1, 'EXTREME', $2, $3, $4, 'SUBMITTED') RETURNING id",
        [user.id, subjectId, before, after]
      );
      assert.equal((await getStatus()).progress.STUDY, false, 'Closing an Extreme session without an attempt is not study');
      const chapter = await tx.queryOne(
        "INSERT INTO chapters (subject_id, title, sort_order) VALUES ($1, 'Chapter', 1) RETURNING id", [subjectId]
      );
      const milestone = await tx.queryOne(
        "INSERT INTO milestones (chapter_id, title, kind, sort_order, reward_xp, reward_coins, step_count, questions_per_step)"
        + " VALUES ($1, 'Quiz', 'QUIZ', 1, 0, 0, 1, 1) RETURNING id", [chapter.id]
      );
      const question = await tx.queryOne(
        "INSERT INTO questions (milestone_id, type, bloom_level, step_no, difficulty, stem, payload)"
        + " VALUES ($1, 'FILL_BLANK', 'REMEMBER', 1, 1, 'Fill the blank', $2) RETURNING id",
        [milestone.id, { sentence_template: 'A {blank}', options: ['word'], blank_answer: 'word' }]
      );
      await tx.execute('INSERT INTO study_session_questions VALUES ($1, 1, $2)', [sessionId, question.id]);
      await tx.execute(
        'INSERT INTO session_answers (session_id, attempt_no, question_position, submitted_text, is_correct)'
        + " VALUES ($1, 1, 1, 'word', true)", [sessionId]
      );
      assert.equal((await getStatus()).progress.STUDY, true);
      assert.equal((await getStatus()).progress.BATTLE, false);
      await db.transaction(inner => mutateCoinsInTransaction(inner, user.id, 3, 'EXTREME_REWARD', { occurred_at: after }));
      await recordStroke(after);
      const eligible = await getStatus();
      assert.equal(eligible.progress.PET_CARE, true);
      assert.equal(eligible.progress.STUDY, true);
      assert.equal(eligible.progress.BATTLE, true);
      assert.equal(success(await send('POST', '/economy/claim-quest', {
        token, body: { quest_code: 'PET_CARE', vn_date: '2001-01-01', occurred_at: before }
      })).coins_awarded, 10, 'The request cannot override the server day');
      const claimedDays = await tx.query(
        "SELECT vn_date FROM quest_claims WHERE user_id = $1 AND quest_code = 'PET_CARE' ORDER BY vn_date", [user.id]);
      assert.deepEqual(claimedDays, [{ vn_date: '2026-08-17' }, { vn_date: '2026-08-18' }]);

      const rewards = await tx.query(
        "SELECT delta, occurred_at FROM coin_ledger WHERE user_id = $1 AND kind = 'DAILY_QUEST_REWARD' ORDER BY id", [user.id]);
      assert.deepEqual(rewards.map(row => ({ delta: row.delta, at: row.occurred_at.toISOString() })),
        [{ delta: 10, at: before }, { delta: 10, at: after }]);
      await assertWalletsReconciled(tx);
    });
  }, () => clock);
  assert.equal(await db.queryOne('SELECT id FROM users WHERE username = $1', [learnerName]), null);
});

test('repeat EXP combines awards until 1,500 and starts a new week at Vietnam midnight', async () => {
  const learnerName = 'eco_quota_' + randomUUID().slice(0, 8);
  await withRolledBackDatabase(async tx => {
    const { token, user } = await auth.register({ username: learnerName, password: 'frosttrail' });
    await withEconomyApi(async send => {
      const before = success(await send('GET', '/economy/repeat-exp-quota', { token }));
      assert.equal(before.limit_xp, 1500);
      assert.equal(before.used_xp, 0);
      assert.equal(before.remaining_xp, 1500);

      const grant = (xp, occurred_at) => db.transaction(inner => economy.awardRepeatXpInTransaction(
        inner, user.id, xp, { occurred_at }
      ));
      const lastSunday = '2021-01-10T16:59:59.999Z';
      const startMonday = '2021-01-10T17:00:00.000Z';
      const first = await grant(1200, lastSunday);
      const capped = await grant(800, lastSunday);
      const blocked = await grant(50, lastSunday);
      assert.equal(first.week_start, '2021-01-04');
      assert.equal(first.xp_awarded, 1200);
      assert.equal(capped.xp_awarded, 300);
      assert.equal(capped.used_xp, 1500);
      assert.equal(capped.remaining_xp, 0);
      assert.equal(blocked.xp_awarded, 0);
      assert.equal(blocked.total_xp, 1500);
      const refreshed = await grant(40, startMonday);
      assert.equal(refreshed.week_start, '2021-01-11');
      assert.equal(refreshed.used_xp, 40);
      assert.equal(refreshed.remaining_xp, 1460);
      assert.equal(refreshed.total_xp, 1540);
      const usage = await tx.query('SELECT week_start, xp FROM weekly_xp_usage WHERE user_id = $1 ORDER BY week_start', [user.id]);
      assert.deepEqual(usage, [{ week_start: '2021-01-04', xp: 1500 }, { week_start: '2021-01-11', xp: 40 }]);

      const liveAward = await grant(50);
      assert.equal(liveAward.xp_awarded, 50);
      const liveQuota = success(await send('GET', '/economy/repeat-exp-quota', { token }));
      assert.equal(liveQuota.week_start, liveAward.week_start);
      assert.equal(liveQuota.used_xp, 50);
      assert.equal(liveQuota.remaining_xp, 1450);
      const wideXp = success(await send('POST', '/economy/onboarding-gift', { token }));
      assert.equal(wideXp.xp_awarded, 30);
      assert.deepEqual(success(await send('GET', '/economy/repeat-exp-quota', { token })), liveQuota,
        'Onboarding grants XP without consuming the shared arena and Extreme cap');
      assert.equal((await tx.queryOne('SELECT xp FROM users WHERE id = $1', [user.id])).xp, 1620);
      await assertWalletsReconciled(tx);
    });
  });
  assert.equal(await db.queryOne('SELECT id FROM users WHERE username = $1', [learnerName]), null);
});


test('starter and tour gifts are independent and repeat claims award nothing', async () => {
  await withRolledBackDatabase(async tx => {
    const learner = await auth.register({username:'tour_'+randomUUID().slice(0,8),password:'testtour8'});
    const id = learner.user.id;
    await assert.rejects(quests.awardTour(id), /hoàn thành/);
    const first = await quests.awardOnboarding(id);
    assert.equal(first.coins_awarded,20);
    assert.equal(first.xp_awarded,30);
    const tourState = Object.fromEntries(['home','kho','mini','pet','shop','set'].map(key=>[key,'done']));
    await auth.updateSettings(id,{tutorial_progress:{step:'tour',layout:'desktop',context:{tourState}}});
    const rewards = await Promise.all([quests.awardTour(id),quests.awardTour(id)]);
    assert.equal(rewards.reduce((sum,r)=>sum+r.coins_awarded,0),10);
    assert.equal(rewards.reduce((sum,r)=>sum+r.xp_awarded,0),0);
    assert.equal((await quests.awardOnboarding(id)).coins_awarded,0);
    assert.equal((await quests.awardTour(id)).coins_awarded,0);
    const balance = await tx.queryOne('SELECT coin_balance, (SELECT SUM(delta) FROM coin_ledger WHERE user_id=$1) AS ledger FROM users WHERE id=$1',[id]);
    assert.equal(Number(balance.coin_balance),Number(balance.ledger));
  });
});
