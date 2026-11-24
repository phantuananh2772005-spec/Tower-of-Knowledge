const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { once } = require('node:events');
const { after, test } = require('node:test');
const express = require('express');
const db = require('../database/db');
const auth = require('../services/auth.service');
const { mutateCoinsInTransaction } = require('../services/wallet.service');
const { responseFormatter } = require('../middlewares/response.middleware');
const petRoutes = require('../routes/pet.routes');
const inventoryRoutes = require('../routes/inventory.routes');

after(() => db.close());

const discardFixtures = new Error('Roll back pet and inventory test fixtures');

async function useRolledBackDatabase(work) {
  const original = { ...db };
  let savepoint = 0;
  await assert.rejects(original.transaction(async tx => {
    Object.assign(db, tx, {
      async transaction(operation) {
        const name = 'pet_test_' + (++savepoint);
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

async function withShopRoutes(token, work) {
  const app = express();
  app.use(express.json(), responseFormatter);
  app.use('/api', petRoutes);
  app.use('/api/items', inventoryRoutes);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  async function send(method, path, body) {
    const response = await fetch(base + path, {
      method,
      headers: {
        Authorization: 'Bearer ' + token,
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

function assertSuccess(response) {
  assert.equal(response.status, 200, JSON.stringify(response.body));
  assert.equal(response.body.success, true);
  return response.body.data;
}

function assertRejected(response) {
  assert.equal(response.status, 400, JSON.stringify(response.body));
  assert.equal(response.body.success, false);
}

async function assertWalletsReconciled(tx) {
  const disagreements = await tx.query(
    'SELECT u.id, u.coin_balance, COALESCE(SUM(l.delta), 0) AS ledger_balance'
    + ' FROM users AS u LEFT JOIN coin_ledger AS l ON l.user_id = u.id'
    + ' GROUP BY u.id HAVING u.coin_balance <> COALESCE(SUM(l.delta), 0)'
  );
  assert.deepEqual(disagreements, [], 'Every user balance must equal the ledger sum, including users with no entries');
}

async function getWallet(tx, userId) {
  const { coin_balance } = await tx.queryOne('SELECT coin_balance FROM users WHERE id = $1', [userId]);
  const ledger = await tx.query('SELECT kind, delta FROM coin_ledger WHERE user_id = $1 ORDER BY id', [userId]);
  return { coin_balance, ledger };
}

test('Pet purchase charges once, ownership and equip are separate, and a rolled-back purchase leaves no coins or ownership changed', async () => {
  const username = 'v1_pet_' + randomUUID().slice(0, 8);
  const petId = 'pet_kitsune';
  const password = 'riverpaw';

  await useRolledBackDatabase(async tx => {
    const { user } = await auth.register({ username, password, display_name: 'Thử Shop Pet V1' });
    await assertWalletsReconciled(tx);
    const session = await auth.login({ username, password });
    assert.equal(session.user.coin_balance, 5, 'First sign-in should credit streak via the ledger');
    assert.deepEqual(await getWallet(tx, user.id), {
      coin_balance: 5,
      ledger: [{ kind: 'STREAK_REWARD', delta: 5 }]
    });
    await assertWalletsReconciled(tx);

    const pet = await tx.queryOne('SELECT price_coins FROM pets WHERE id = $1', [petId]);
    assert.ok(pet.price_coins > 5);

    await withShopRoutes(session.token, async send => {
      const catalog = assertSuccess(await send('GET', '/pets'));
      assert.ok(catalog.some(item => item.id === petId), 'Paid Pet exists in catalog');
      assertRejected(await send('POST', '/pets/' + petId + '/equip'));
      assertRejected(await send('POST', '/pets/' + petId + '/buy'));
      const restricted = await send('POST', '/pets/pet_admin_aurum/buy');
      assertRejected(restricted);
      const price = pet.price_coins;
      await db.transaction(inner => mutateCoinsInTransaction(inner, user.id, price, 'ADMIN_ADJUSTMENT', {
        note: 'Group 3 test fixture to fund Pet purchase'
      }));
      const beforePurchase = await getWallet(tx, user.id);
      assert.equal(beforePurchase.coin_balance, price + 5);
      await assertWalletsReconciled(tx);

      const undoPurchase = new Error('Force savepoint rollback after a successful Pet purchase');
      await assert.rejects(db.transaction(async () => {
        assertSuccess(await send('POST', '/pets/' + petId + '/buy'));
        assert.equal((await getWallet(tx, user.id)).coin_balance, 5);
        await assertWalletsReconciled(tx);
        throw undoPurchase;
      }), error => error === undoPurchase);

      assert.deepEqual(await getWallet(tx, user.id), beforePurchase);
      assert.equal(await tx.queryOne('SELECT 1 FROM user_pets WHERE user_id = $1 AND pet_id = $2', [user.id, petId]), null);
      await assertWalletsReconciled(tx);

      assertSuccess(await send('POST', '/pets/' + petId + '/buy'));
      const afterPurchase = await getWallet(tx, user.id);
      assert.equal(afterPurchase.coin_balance, 5);
      assert.equal(afterPurchase.ledger.length, beforePurchase.ledger.length + 1);
      assert.deepEqual(afterPurchase.ledger.at(-1), { kind: 'PET_PURCHASE', delta: -price });
      assert.equal((await auth.getCurrentUser(user.id)).equipped_pet_id, 'pet_sparky', 'Purchase never silently equips');
      assert.ok(await tx.queryOne('SELECT 1 FROM user_pets WHERE user_id = $1 AND pet_id = $2', [user.id, petId]));

      assertSuccess(await send('POST', '/pets/' + petId + '/buy'));
      assert.deepEqual(await getWallet(tx, user.id), afterPurchase, 'Repeated purchase must not charge again');
      assertSuccess(await send('POST', '/pets/' + petId + '/equip'));
      assert.equal((await auth.getCurrentUser(user.id)).equipped_pet_id, petId);
      assert.deepEqual(await getWallet(tx, user.id), afterPurchase, 'Equipping must not charge');
      await assertWalletsReconciled(tx);
    });
  });
  assert.equal(await db.queryOne('SELECT id FROM users WHERE username = $1', [username]), null);
});

test('Active accessories purchase and equip separately, archived Sparky hat stays locked, and care writes feed/stroke ledger entries', async () => {
  const key = randomUUID().slice(0, 8);
  const username = 'v1_item_' + key;
  const noFundsUsername = 'v1_pet_care_' + key;
  const accessoryId = 'test_accessory_' + key;
  const accessoryPrice = 40;

  await useRolledBackDatabase(async tx => {
    const { user, token } = await auth.register({ username, password: 'quietdock' });
    const noFunds = await auth.register({ username: noFundsUsername, password: 'twincedar' });
    await tx.execute(
      "INSERT INTO accessories (id, name, description, price_coins, minimum_level, status) VALUES ($1, $2, $3, $4, 1, 'ACTIVE')",
      [accessoryId, 'Phụ kiện thử V1', 'Dữ liệu sẽ được rollback', accessoryPrice]
    );
    const hat = await tx.queryOne("SELECT status FROM accessories WHERE id = 'sparky_witch_hat'");
    assert.equal(hat.status, 'ARCHIVED');
    await db.transaction(inner => mutateCoinsInTransaction(inner, user.id, 100, 'ADMIN_ADJUSTMENT', {
      note: 'Group 3 test fixture to fund accessory and care'
    }));
    await assertWalletsReconciled(tx);

    await withShopRoutes(noFunds.token, async send => {
      assertRejected(await send('POST', '/pets/care', { action: 'feed' }));
      assert.deepEqual(await getWallet(tx, noFunds.user.id), { coin_balance: 0, ledger: [] });
      assertSuccess(await send('POST', '/pets/care', { action: 'pet' }));
      assert.deepEqual(await getWallet(tx, noFunds.user.id), { coin_balance: 0, ledger: [{ kind: 'PET_STROKE', delta: 0 }] });
    });

    await withShopRoutes(token, async send => {
      const catalog = assertSuccess(await send('GET', '/items'));
      assert.ok(catalog.some(item => item.id === accessoryId), 'Runtime reads the active item from the database catalog');
      assertRejected(await send('PUT', '/items/equipped', { accessory_id: accessoryId }));
      assertRejected(await send('POST', '/items/sparky_witch_hat/buy'));
      assertRejected(await send('PUT', '/items/equipped', { accessory_id: 'sparky_witch_hat' }));
      assert.deepEqual(await getWallet(tx, user.id), {
        coin_balance: 100,
        ledger: [{ kind: 'ADMIN_ADJUSTMENT', delta: 100 }]
      });

      assertSuccess(await send('POST', '/items/' + accessoryId + '/buy'));
      const afterPurchase = await getWallet(tx, user.id);
      assert.equal(afterPurchase.coin_balance, 100 - accessoryPrice);
      assert.deepEqual(afterPurchase.ledger.at(-1), { kind: 'ACCESSORY_PURCHASE', delta: -accessoryPrice });
      assert.equal((await auth.getCurrentUser(user.id)).equipped_accessory_id, null);
      assert.ok(await tx.queryOne(
        'SELECT 1 FROM user_accessories WHERE user_id = $1 AND accessory_id = $2', [user.id, accessoryId]
      ));
      assertSuccess(await send('POST', '/items/' + accessoryId + '/buy'));
      assert.deepEqual(await getWallet(tx, user.id), afterPurchase);
      await assertWalletsReconciled(tx);

      assertSuccess(await send('PUT', '/items/equipped', { accessory_id: accessoryId }));
      assert.equal((await auth.getCurrentUser(user.id)).equipped_accessory_id, accessoryId);
      assertSuccess(await send('PUT', '/items/equipped', { accessory_id: null }));
      assert.equal((await auth.getCurrentUser(user.id)).equipped_accessory_id, null);
      assert.deepEqual(await getWallet(tx, user.id), afterPurchase);

      assertRejected(await send('POST', '/pets/care', { action: 'unknown' }));
      assertSuccess(await send('POST', '/pets/care', { action: 'feed' }));
      const fed = await getWallet(tx, user.id);
      assert.equal(fed.coin_balance, 100 - accessoryPrice - 10);
      assert.deepEqual(fed.ledger.at(-1), { kind: 'PET_FEED', delta: -10 });
      await assertWalletsReconciled(tx);
    });
  });
  assert.equal(await db.queryOne('SELECT id FROM users WHERE username IN ($1, $2)', [username, noFundsUsername]), null);
  assert.equal(await db.queryOne('SELECT id FROM accessories WHERE id = $1', [accessoryId]), null);
  await assertWalletsReconciled(db);
});
