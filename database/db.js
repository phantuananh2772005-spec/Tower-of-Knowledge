const { Pool, types } = require('pg');
const { databaseUrl, ssl } = require('../config/local-env');

// A DATE is a calendar day, independent of the Node process timezone.
types.setTypeParser(1082, value => value);

const pool = new Pool({
  connectionString: databaseUrl.href,
  ssl,
  application_name: 'tower-of-knowledge-local-v1',
  connectionTimeoutMillis: 5000,
  options: '-c search_path=app_v1,pg_catalog'
});
pool.on('error', error => {
  console.error('[POSTGRES] Idle connection error:', error.code || error.message);
});

function adapter(client) {
  return {
    async query(sql, params = []) {
      return (await client.query(sql, params)).rows;
    },
    async queryOne(sql, params = []) {
      return (await client.query(sql, params)).rows[0] ?? null;
    },
    async execute(sql, params = []) {
      const { rowCount } = await client.query(sql, params);
      return { rowCount };
    }
  };
}

const db = adapter(pool);

async function verifyRuntime() {
  const runtime = await db.queryOne(
    'SELECT current_user AS login, session_user AS session_login, current_database() AS database,'
      + ' current_schemas(false)::text[] AS schemas,'
      + " pg_has_role(current_user, 'thaptrithuc_v1_runtime', 'USAGE') AS has_runtime_role,"
      + " has_schema_privilege(current_user, 'app_v1', 'CREATE') AS can_create,"
      + ' r.rolsuper OR r.rolcreatedb OR r.rolcreaterole OR r.rolbypassrls OR r.rolreplication AS privileged'
      + ' FROM pg_roles r WHERE r.rolname = current_user'
  );
  if (runtime?.login !== decodeURIComponent(databaseUrl.username)
      || runtime.login !== runtime.session_login || runtime.database !== decodeURIComponent(databaseUrl.pathname.slice(1))
      || runtime.schemas.join(',') !== 'app_v1,pg_catalog'
      || !runtime.has_runtime_role || runtime.can_create || runtime.privileged) {
    throw new Error('Expected a dedicated V1 runtime login with search_path app_v1, pg_catalog.');
  }
  return runtime;
}

async function loadRuleConstants() {
  return db.queryOne(
    'SELECT v1_season_length_days() AS season_days, v1_first_season_start() AS first_season_start,'
      + ' v1_weekly_xp_limit() AS weekly_xp_limit, v1_arena_initial_hp() AS initial_hp,'
      + ' v1_arena_base_damage() AS base_damage, v1_arena_fast_bonus() AS fast_bonus,'
      + ' v1_arena_fast_answer_seconds() AS fast_answer_seconds'
  );
}

async function transaction(work) {
  const client = await pool.connect();
  let releaseError;
  try {
    await client.query('BEGIN');
    const result = await work(adapter(client));
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      releaseError = rollbackError;
    }
    throw error;
  } finally {
    client.release(releaseError);
  }
}

module.exports = {
  ...db,
  transaction,
  verifyRuntime,
  loadRuleConstants,
  close: () => pool.end(),
  isPostgres: true
};
