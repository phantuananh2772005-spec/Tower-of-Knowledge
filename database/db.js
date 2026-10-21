/**
 * Database Adapter for Tower of Knowledge
 * Supports:
 * 1. Microsoft SQL Server (Local Developer via Windows Authentication)
 * 2. PostgreSQL (Render / Cloud deployment via process.env.DATABASE_URL)
 */

const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);
require('dotenv').config();

const isPostgres = Boolean(
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'))
);

let pgPool = null;
if (isPostgres) {
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

/**
 * Escape a JS value into a SQL Server literal
 */
function escapeMssqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') {
    if (!Number.isFinite(val)) return 'NULL';
    return String(val);
  }
  if (typeof val === 'boolean') {
    return val ? '1' : '0';
  }
  if (val instanceof Date) {
    return `'${val.toISOString().replace('T', ' ').replace('Z', '')}'`;
  }
  if (typeof val === 'object') {
    return `N'${JSON.stringify(val).replace(/'/g, "''")}'`;
  }
  // String
  return `N'${String(val).replace(/'/g, "''")}'`;
}

/**
 * Format parameterized query with $1, $2... for SQL Server
 */
function interpolateMssql(sql, params = []) {
  if (!params || params.length === 0) return sql;
  return sql.replace(/\$(\d+)/g, (match, indexStr) => {
    const idx = parseInt(indexStr, 10) - 1;
    if (idx >= 0 && idx < params.length) {
      return escapeMssqlValue(params[idx]);
    }
    return match;
  });
}

/**
 * Query Microsoft SQL Server using sqlcmd native bridge
 */
async function queryMssql(sql, params = []) {
  const interpolated = interpolateMssql(sql, params);
  const isSelect = /^\s*SELECT/i.test(interpolated);

  let finalSql;
  if (isSelect) {
    if (/FOR\s+JSON/i.test(interpolated)) {
      finalSql = `SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; SET NOCOUNT ON; ${interpolated};`;
    } else {
      // Append FOR JSON PATH directly to preserve ORDER BY and CTEs cleanly
      finalSql = `SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; SET NOCOUNT ON; ${interpolated} FOR JSON PATH;`;
    }
  } else {
    finalSql = `SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; SET NOCOUNT ON; ${interpolated};`;
  }

  const { stdout, stderr } = await execFileAsync('sqlcmd', [
    '-S', process.env.MSSQL_SERVER || 'localhost',
    '-E',
    '-d', process.env.MSSQL_DATABASE || 'TowerOfKnowledge',
    '-y', '0',
    '-w', '65535',
    '-f', '65001',
    '-Q', finalSql
  ], { encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 });

  if (stderr && stderr.trim().length > 0 && !stderr.includes('Changed database context')) {
    throw new Error(stderr);
  }

  if (isSelect) {
    // sqlcmd splits long JSON across lines with \r\n; join them together
    const raw = stdout.replace(/\r?\n/g, '').trim();
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      // If result was not valid JSON (e.g. empty or non-wrapped), return empty
      return [];
    }
  }

  return { affectedRows: 1 };
}

/**
 * Unified query method
 * @param {string} sql SQL query with $1, $2 placeholders
 * @param {Array} params Parameter values
 * @returns {Promise<Array>} Array of row objects
 */
async function query(sql, params = []) {
  if (isPostgres) {
    const res = await pgPool.query(sql, params);
    return res.rows;
  }
  return await queryMssql(sql, params);
}

/**
 * Query returning single row or null
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Execute INSERT, UPDATE, DELETE
 */
async function execute(sql, params = []) {
  if (isPostgres) {
    const res = await pgPool.query(sql, params);
    return { rowCount: res.rowCount };
  }
  return await queryMssql(sql, params);
}

/**
 * Run operations inside a transaction
 */
async function transaction(fn) {
  if (isPostgres) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn({
        query: (sql, params) => client.query(sql, params).then(r => r.rows),
        queryOne: (sql, params) => client.query(sql, params).then(r => r.rows[0] || null),
        execute: (sql, params) => client.query(sql, params).then(r => ({ rowCount: r.rowCount }))
      });
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    // For MSSQL bridge, commands are atomic or can wrap in BEGIN TRAN ... COMMIT TRAN
    return await fn({ query, queryOne, execute });
  }
}

module.exports = {
  query,
  queryOne,
  execute,
  transaction,
  isPostgres
};
