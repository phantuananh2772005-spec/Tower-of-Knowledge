const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createServer } = require('node:http');
const { once } = require('node:events');
const { readFileSync } = require('node:fs');
const { after, test } = require('node:test');
const express = require('express');
const { Server } = require('socket.io');
const { io: connect } = require('socket.io-client');
const db = require('../database/db');
const auth = require('../services/auth.service');
const arena = require('../services/arena.service');
const arenaRoutes = require('../routes/arena.routes');
const { initArenaSocket } = require('../sockets/arena.socket');
const { responseFormatter } = require('../middlewares/response.middleware');

after(() => db.close());

const discardFixtures = new Error('Rollback arena V1 fixtures');

async function withRolledBackDatabase(work) {
  await db.verifyRuntime();
  const original = { ...db };
  let savepoints = 0;

  await assert.rejects(original.transaction(async tx => {
    Object.assign(db, tx, {
      async transaction(operation) {
        const name = 'arena_test_' + (++savepoints);
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

async function seedBank(tx, slug) {
  const subject = await tx.queryOne(
    "INSERT INTO subjects (slug, name, sort_order, status) VALUES ($1, 'Arena test', 99, 'ACTIVE') RETURNING id",
    [slug]
  );
  const chapter = await tx.queryOne(
    "INSERT INTO chapters (subject_id, title, sort_order, status) VALUES ($1, 'Chương test', 1, 'ACTIVE') RETURNING id",
    [subject.id]
  );
  const milestone = await tx.queryOne(
    "INSERT INTO milestones (chapter_id, title, kind, status, sort_order, reward_xp, reward_coins, step_count,"
      + " questions_per_step) VALUES ($1, 'Mốc test', 'QUIZ', 'ACTIVE', 1, 0, 0, 1, 1) RETURNING id",
    [chapter.id]
  );
  const question = await tx.queryOne(
    "INSERT INTO questions (milestone_id, type, bloom_level, step_no, difficulty, stem, explanation, status)"
      + " VALUES ($1, 'MULTIPLE_CHOICE', 'REMEMBER', 1, 1, $2, 'Lời giải test', 'ACTIVE') RETURNING id",
    [milestone.id, 'Đề thuộc ' + slug]
  );
  await tx.execute(
    "INSERT INTO question_options (question_id, position, text, is_correct) VALUES"
      + " ($1, 0, 'sai 1', false), ($1, 1, 'sai 2', false), ($1, 2, 'đúng', true), ($1, 3, 'sai 3', false)",
    [question.id]
  );
  return { subjectId: subject.id, questionId: question.id };
}

async function seedPlayer(tx, username) {
  return auth.createAccount(tx, {
    username,
    email: username + '@example.test',
    display_name: 'Người đấu test',
    password_hash: 'fixture-password-hash'
  });
}

async function withArenaServer(work) {
  const app = express();
  const server = createServer(app);
  const io = new Server(server);
  const clients = [];
  initArenaSocket(io);
  app.set('io', io);
  app.use(express.json(), responseFormatter);
  app.use('/api/arena', arenaRoutes);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = 'http://127.0.0.1:' + server.address().port;
  try {
    await work({
      async request(path, token, body) {
        const response = await fetch(origin + '/api/arena' + path, {
          method: body === undefined ? 'GET' : 'POST',
          headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: body === undefined ? undefined : JSON.stringify(body)
        });
        return { status: response.status, body: await response.json() };
      },
      async socket(token) {
        const client = connect(origin, {
          auth: { token }, transports: ['websocket'], reconnection: false, timeout: 5000
        });
        clients.push(client);
        await once(client, 'connect');
        return client;
      }
    });
  } finally {
    for (const client of clients) client.close();
    await new Promise(resolve => io.close(resolve));
  }
}

function successful(result, status = 200) {
  assert.equal(result.status, status, JSON.stringify(result.body));
  assert.equal(result.body.success, true);
  return result.body.data;
}

function rejected(result, message) {
  assert.equal(result.status, 400, JSON.stringify(result.body));
  assert.equal(result.body.success, false);
  assert.match(result.body.error.message, message);
  assert.equal(Object.hasOwn(result.body, 'data'), false);
}

async function storedTrials(connection, banks) {
  return connection.queryOne(
    'SELECT (SELECT count(*)::int FROM matches WHERE subject_id = ANY($1::uuid[])) AS matches,'
      + ' (SELECT count(*)::int FROM match_rounds WHERE question_id = ANY($2::uuid[])) AS rounds',
    [banks.map(unit => unit.subjectId), banks.map(unit => unit.questionId)]
  );
}

function track(client, event) {
  const payloads = [];
  client.on(event, payload => payloads.push(payload));
  return payloads;
}

function nextEvent(client, event) {
  return once(client, event, { signal: AbortSignal.timeout(5000) }).then(([payload]) => payload);
}

function ack(client, event, payload) {
  return client.timeout(5000).emitWithAck(event, payload);
}

function assertVisibleRound(match, bank) {
  assert.equal(match.subject_id, bank.subjectId);
  assert.equal(match.rounds.length, 1);
  const [round] = match.rounds;
  assert.equal(round.round_no, 1);
  assert.equal(round.id, bank.questionId);
  assert.equal(Object.hasOwn(round, 'payload'), false);
  assert.equal(Object.hasOwn(round, 'correct_answer'), false);
  assert.ok(round.options.every(option => !Object.hasOwn(option, 'is_correct')));
}

test('real arena REST and matchmaking reject an out-of-subject round without rows or question publication', { timeout: 30000 }, async () => {
  const tag = randomUUID();
  let banks;
  await withRolledBackDatabase(async tx => {
    const right = await seedBank(tx, 'arena-right-' + tag);
    const wrong = await seedBank(tx, 'arena-wrong-' + tag);
    banks = [right, wrong];
    const first = await seedPlayer(tx, 'arena-first-' + tag);
    const second = await seedPlayer(tx, 'arena-second-' + tag);
    const firstToken = auth.generateToken(first);
    const secondToken = auth.generateToken(second);
    const originalCreateMatch = arena.createMatch;
    const injected = arena.createArenaService({
      // The valid first candidate is written before the second one must fail.
      selectRoundQuestions: async () => [right.questionId, wrong.questionId]
    });

    try {
      await withArenaServer(async ({ request, socket }) => {
        arena.createMatch = injected.createMatch;
        const body = { subject_id: right.subjectId, opponent_id: second.id };
        rejected(await request('/create-match', firstToken, body), /không thuộc môn/);
        assert.deepEqual(await storedTrials(tx, banks), { matches: 0, rounds: 0 });

        const firstClient = await socket(firstToken);
        const secondClient = await socket(secondToken);
        const firstPublished = track(firstClient, 'match_found');
        const secondPublished = track(secondClient, 'match_found');
        assert.equal((await ack(firstClient, 'join_queue', { subject_id: right.subjectId })).ok, true);
        const firstError = nextEvent(firstClient, 'error_msg');
        const failure = await ack(secondClient, 'join_queue', { subject_id: right.subjectId });
        assert.match(await firstError, /không thuộc môn/);
        assert.equal(failure.ok, false);
        assert.match(failure.message, /không thuộc môn/);
        assert.deepEqual(firstPublished, []);
        assert.deepEqual(secondPublished, []);
        assert.deepEqual(await storedTrials(tx, banks), { matches: 0, rounds: 0 });

        arena.createMatch = originalCreateMatch;
        const practice = successful(await request('/create-match', firstToken, body), 201);
        assertVisibleRound(practice, right);
        assert.deepEqual(await storedTrials(tx, banks), { matches: 1, rounds: 1 });

        assert.equal((await ack(firstClient, 'join_queue', { subject_id: right.subjectId })).ok, true);
        const firstNotice = nextEvent(firstClient, 'match_found');
        const secondNotice = nextEvent(secondClient, 'match_found');
        assert.equal((await ack(secondClient, 'join_queue', { subject_id: right.subjectId })).ok, true);
        const matching = await firstNotice;
        assert.equal(matching.match.id, (await secondNotice).match.id);
        assertVisibleRound(matching.match, right);
        assert.equal(firstPublished.length, 1);
        assert.equal(secondPublished.length, 1);
        assert.deepEqual(await storedTrials(tx, banks), { matches: 2, rounds: 2 });

        const surrender = await ack(firstClient, 'surrender', { match_id: matching.match.id });
        assert.equal(surrender.ok, true, JSON.stringify(surrender));
      });
    } finally {
      arena.createMatch = originalCreateMatch;
    }
  });
  assert.deepEqual(await storedTrials(db, banks), { matches: 0, rounds: 0 });
});

test('HTTP and Socket.IO reject shield without a turn, and publish legitimate fixed-damage turns', { timeout: 30000 }, async () => {
  const tag = randomUUID();
  let matchId;
  await withRolledBackDatabase(async tx => {
    const bank = await seedBank(tx, 'arena-shield-' + tag);
    const first = await seedPlayer(tx, 'arena-shield-first-' + tag);
    const second = await seedPlayer(tx, 'arena-shield-second-' + tag);
    const firstToken = auth.generateToken(first);
    const secondToken = auth.generateToken(second);

    await withArenaServer(async ({ request, socket }) => {
      const match = successful(await request('/create-match', firstToken, {
        subject_id: bank.subjectId, opponent_id: second.id
      }), 201);
      matchId = match.id;
      const firstClient = await socket(firstToken);
      const secondClient = await socket(secondToken);
      assert.equal((await ack(firstClient, 'join_match_room', { match_id: matchId })).ok, true);
      assert.equal((await ack(secondClient, 'join_match_room', { match_id: matchId })).ok, true);
      const firstBroadcasts = track(firstClient, 'turn_resolved');
      const secondBroadcasts = track(secondClient, 'turn_resolved');

      rejected(await request('/' + matchId + '/turn', firstToken, {
        round_no: 1, selected_option_position: 2, shield: true
      }), /không hợp lệ|không được hỗ trợ/);
      const socketAttempt = await ack(firstClient, 'submit_answer', {
        match_id: matchId, round_no: 1, selected_option_position: 2, shield: true
      });
      assert.equal(socketAttempt.ok, false);
      assert.match(socketAttempt.message, /không hợp lệ|không được hỗ trợ/);
      assert.deepEqual(firstBroadcasts, []);
      assert.deepEqual(secondBroadcasts, []);
      assert.deepEqual(await tx.queryOne(
        'SELECT count(*)::int AS turns FROM match_answers WHERE match_id = $1', [matchId]
      ), { turns: 0 });

      const firstTurnNotice = nextEvent(secondClient, 'turn_resolved');
      const firstAnswer = successful(await request('/' + matchId + '/turn', firstToken, {
        round_no: 1, selected_option_position: 2
      }));
      const resolved = await firstTurnNotice;
      const timing = await tx.queryOne(
        'SELECT v1_arena_initial_hp() AS hp, v1_arena_base_damage() AS base_damage,'
          + ' v1_arena_fast_bonus() AS bonus, v1_arena_fast_answer_seconds() AS fast_seconds'
      );
      assert.equal(firstAnswer.is_correct, true);
      const expectedDamage = firstAnswer.match.turns[0].response_seconds <= timing.fast_seconds
        ? timing.base_damage + timing.bonus : timing.base_damage;
      assert.equal(firstAnswer.damage, expectedDamage);
      assert.equal(resolved.damage, firstAnswer.damage);
      assert.equal(resolved.match.players.find(player => player.user_id === second.id).hp, timing.hp - expectedDamage);

      const finalNotice = nextEvent(firstClient, 'match_ended');
      const secondAnswer = await ack(secondClient, 'submit_answer', {
        match_id: matchId, round_no: 1, selected_option_position: 0
      });
      assert.equal(secondAnswer.ok, true, JSON.stringify(secondAnswer));
      assert.equal(secondAnswer.data.damage, 0);
      const completed = (await finalNotice).match;
      assert.equal(completed.status, 'FINISHED');
      assert.equal(completed.winner_id, first.id);
      assert.deepEqual(completed.players.map(player => player.coins_awarded), [25, 10]);
      assert.equal(firstBroadcasts.length, 2);
      assert.equal(secondBroadcasts.length, 2);

      const wallets = await tx.query(
        "SELECT u.id, u.coin_balance, coalesce(sum(l.delta), 0)::int AS balance_from_ledger"
          + ' FROM users u LEFT JOIN coin_ledger l ON l.user_id = u.id WHERE u.id = ANY($1::uuid[]) GROUP BY u.id',
        [[first.id, second.id]]
      );
      assert.equal(wallets.length, 2);
      for (const wallet of wallets) assert.equal(wallet.coin_balance, wallet.balance_from_ledger);
    });
  });

  assert.deepEqual(await db.queryOne(
    'SELECT count(*)::int AS turns FROM match_answers WHERE match_id = $1', [matchId]
  ), { turns: 0 });
  const page = readFileSync(require.resolve('../public/index.html'), 'utf8');
  assert.doesNotMatch(page, /\bid=["'](?:b-skill|my-shield)["']|\buseShield\b/);
});
