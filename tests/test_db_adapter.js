const assert = require('node:assert/strict');
const { after, test } = require('node:test');
const db = require('../database/db');

after(() => db.close());

test('uses a dedicated PostgreSQL V1 runtime login and search path', async () => {
  const session = await db.verifyRuntime();
  assert.notEqual(session.login, 'postgres');
  assert.deepEqual(session.schemas, ['app_v1', 'pg_catalog']);
  assert.equal(session.has_runtime_role, true);
  assert.equal(session.can_create, false);
  assert.equal(session.privileged, false);

  const sparky = await db.queryOne('SELECT id FROM pets WHERE id = $1', ['pet_sparky']);
  assert.deepEqual(sparky, { id: 'pet_sparky' });
});

test('reads constants from the approved schema', async () => {
  const rules = await db.loadRuleConstants();
  assert.equal(rules.season_days, 56);
  assert.equal(rules.weekly_xp_limit, 1500);
  assert.equal(rules.initial_hp, 100);
  assert.equal(rules.base_damage, 12);
  assert.equal(rules.fast_bonus, 3);
  assert.equal(rules.fast_answer_seconds, 5);
});

test('runs a PostgreSQL transaction with rollback on error', async () => {
  await assert.rejects(db.transaction(async tx => {
    await tx.execute('CREATE TEMP TABLE config_v1_probe (id int) ON COMMIT DROP');
    await tx.execute('INSERT INTO config_v1_probe VALUES ($1)', [7]);
    assert.deepEqual(await tx.queryOne('SELECT id FROM config_v1_probe'), { id: 7 });
    throw new Error('rollback config probe');
  }), { message: 'rollback config probe' });
  assert.equal(await db.queryOne("SELECT to_regclass('pg_temp.config_v1_probe') AS probe")
    .then(result => result.probe), null);
});

test('rejects DDL writes to the application schema as runtime', async () => {
  await assert.rejects(db.transaction(tx =>
    tx.execute('CREATE TABLE app_v1.config_v1_forbidden_probe (id int)')
  ), { code: '42501' });
});
