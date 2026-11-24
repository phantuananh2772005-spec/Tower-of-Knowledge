const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { after, test } = require('node:test');
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const auth = require('../services/auth.service');
const { assertCurrentSession } = require('../services/session-validity.service');
const googleModule = require('../services/google-identity.service');
const { createRecoveryService } = require('../services/password-recovery.service');
const { responseFormatter } = require('../middlewares/response.middleware');

after(() => db.close());

const discardFixtures = new Error('rollback Bước 4 auth test fixtures');

async function useRolledBackDatabase(work) {
  const original = { ...db };
  let savepoint = 0;
  await assert.rejects(original.transaction(async tx => {
    Object.assign(db, tx, {
      async transaction(operation) {
        const name = 'auth_test_' + (++savepoint);
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

async function withAuthHttpRoutes(work) {
  const app = express();
  app.use(express.json(), responseFormatter);
  app.use('/api/auth', require('../routes/auth.routes'));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port + '/api/auth';
  async function send(path, { method = 'GET', token, body } = {}) {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(token && { Authorization: 'Bearer ' + token }),
        ...(body && { 'Content-Type': 'application/json' })
      },
      body: body && JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
  }
  try {
    await work(send);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

test('register, sign in, set preferences, update account, rotate password and revoke disabled session', async () => {
  const username = 'v1_auth_' + randomUUID().slice(0, 8);
  await useRolledBackDatabase(async tx => {
    await withAuthHttpRoutes(async send => {
      const registration = await send('/register', {
        method: 'POST', body: { username, password: 'cloudink', display_name: 'Học viên V1' }
      });
      assert.equal(registration.body.success, true, JSON.stringify(registration.body.error));
      const { token, user } = registration.body.data;
      assert.equal(user.username, username);
      assert.equal(user.role, 'LEARNER');
      assert.equal(user.equipped_pet.id, 'pet_sparky');
      assert.equal(user.coin_balance, 0);
      assert.equal(user.has_password, true);
      assert.equal('password_hash' in user, false);
      assert.equal((await tx.queryOne('SELECT count(*)::int AS owned FROM user_pets WHERE user_id = $1', [user.id])).owned, 1);

      const duplicate = await send('/register', {
        method: 'POST', body: { username: username.toUpperCase(), password: 'cloudink' }
      });
      assert.equal(duplicate.body.success, false);

      const loggedIn = await send('/login', { method: 'POST', body: { username, password: 'cloudink' } });
      assert.equal(loggedIn.body.success, true, JSON.stringify(loggedIn.body.error));
      assert.equal(loggedIn.body.data.user.coin_balance, 5);
      const loggedInAgain = await send('/login', { method: 'POST', body: { username, password: 'cloudink' } });
      assert.equal(loggedInAgain.body.data.user.coin_balance, 5);

      const prefs = await send('/settings', { method: 'PUT', token, body: {
        theme: 'LIGHT',
        sound_enabled: false,
        sound_config: { quiz: false },
        tutorial_progress: { step: 'intro', layout: 'desktop', completed: false }
      } });
      assert.equal(prefs.body.success, true, JSON.stringify(prefs.body.error));
      const me = (await send('/me', { token })).body.data;
      assert.equal(me.theme, 'LIGHT');
      assert.deepEqual(me.sound_config, { quiz: false });
      assert.equal(me.tutorial_progress.step, 'intro');

      const rename = await send('/account', { method: 'PUT', token, body: {
        display_name: 'Tên hiển thị mới', username: username + '_renamed'
      } });
      assert.equal(rename.body.success, true, JSON.stringify(rename.body.error));
      assert.equal(rename.body.data.user.display_name, 'Tên hiển thị mới');

      const rotation = await send('/password', {
        method: 'PUT',
        token: rename.body.data.token,
        body: { current_password: 'cloudink', new_password: 'trailmap' }
      });
      assert.equal(rotation.body.success, true, JSON.stringify(rotation.body.error));
      assert.equal((await send('/me', { token })).status, 401);
      const latest = rotation.body.data.token;
      assert.equal((await send('/me', { token: latest })).body.data.has_password, true);

      const reconciliation = await tx.queryOne(
        'SELECT u.coin_balance = COALESCE(SUM(l.delta), 0) AS matches, count(l.id)::int AS entries'
          + ' FROM users u LEFT JOIN coin_ledger l ON l.user_id = u.id WHERE u.id = $1 GROUP BY u.id',
        [user.id]
      );
      assert.deepEqual(reconciliation, { matches: true, entries: 1 });

      await tx.execute('UPDATE users SET disabled_at = clock_timestamp() WHERE id = $1', [user.id]);
      assert.equal((await send('/me', { token: latest })).status, 401);
      await assert.rejects(auth.login({ username: username + '_renamed', password: 'trailmap' }));
    });
  });
  assert.equal(await db.queryOne('SELECT id FROM users WHERE username IN ($1, $2)', [username, username + '_renamed']), null);
});

test('verified Google sign-in, link and reset use V1 identity and challenge records', async () => {
  const priorGoogleClient = process.env.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_ID = 'v1-group-test.apps.googleusercontent.com';
  const google = googleModule.createGoogleIdentity({ verifyIdToken: async credential => JSON.parse(credential) });
  const sub = 'v1_google_' + randomUUID();
  const email = sub + '@example.test';

  function proof(mode, userId, overrides = {}) {
    const challenge = google.challenge(mode, userId);
    return {
      body: {
        csrf: challenge.csrf,
        credential: JSON.stringify({ sub, email, email_verified: true, name: 'Google V1', nonce: challenge.nonce, ...overrides })
      },
      cookie: challenge.cookie
    };
  }

  try {
    await useRolledBackDatabase(async tx => {
      const invalid = proof('login', null, { nonce: 'wrong' });
      await assert.rejects(google.signIn(invalid.body, invalid.cookie));
      const valid = proof('login', null);
      const session = await google.signIn(valid.body, valid.cookie);
      const id = session.user.id;
      const row = await tx.queryOne('SELECT password_hash, google_verified_email FROM users WHERE id = $1', [id]);
      assert.deepEqual(row, { password_hash: null, google_verified_email: email });
      assert.equal(session.user.google_linked, true);
      assert.equal(session.user.has_password, false);
      await assert.rejects(google.unlink(id));

      const clock = Date.now();
      const delivered = [];
      const recovery = createRecoveryService({
        now: () => clock,
        transport: { configured: () => true, sendCode: async (target, code) => delivered.push({ target, code }) }
      });
      await recovery.request({ email });
      await recovery.request({ email });
      assert.equal(delivered.length, 1);
      assert.equal(delivered[0].target, email);
      const { code } = delivered[0];
      const activeChallenge = await tx.queryOne('SELECT code_hash FROM password_resets WHERE user_id = $1', [id]);
      assert.notEqual(activeChallenge.code_hash, code);
      await assert.rejects(recovery.reset({ email, code: code === '000000' ? '999999' : '000000', password: 'trailmap' }));
      const attempted = await tx.queryOne('SELECT attempts FROM password_resets WHERE user_id = $1', [id]);
      assert.equal(attempted.attempts, 1);
      await recovery.reset({ email, code, password: 'trailmap' });
      await assert.rejects(recovery.reset({ email, code, password: 'trailmap' }));
      await assert.rejects(assertCurrentSession(jwt.decode(session.token)));
      const ret = await auth.login({ username: session.user.username, password: 'trailmap' });
      assert.equal(ret.user.id, id);
      assert.equal(ret.user.has_password, true);
      await assertCurrentSession(jwt.decode(ret.token));
      await google.unlink(id);
      assert.equal((await auth.getCurrentUser(id)).google_linked, false);

      const link = proof('link', id);
      const linked = await google.link(id, link.body, link.cookie);
      assert.equal(linked.google_linked, true);
      const lookup = await recovery.lookup({ username: session.user.username });
      assert.ok(lookup.lookupToken);
      const recoveryChallenge = proof('recover', null);
      const recoveryProof = await google.recover({ ...recoveryChallenge.body, lookupToken: lookup.lookupToken }, recoveryChallenge.cookie);
      await recovery.reset({ email, recovery_token: recoveryProof.recoveryToken, password: 'quietbay' });
      const recovered = await auth.login({ username: session.user.username, password: 'quietbay' });
      assert.equal(recovered.user.id, id);
    });
    assert.equal(await db.queryOne('SELECT id FROM users WHERE google_sub = $1', [sub]), null);
  } finally {
    if (priorGoogleClient === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = priorGoogleClient;
  }
});
