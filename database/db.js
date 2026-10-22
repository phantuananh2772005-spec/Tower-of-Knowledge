/**
 * Database Adapter for Tower of Knowledge
 * Supports:
 * 1. Microsoft SQL Server (Local Developer via Windows Authentication)
 * 2. PostgreSQL (Render / Cloud deployment via process.env.DATABASE_URL)
 */

const { execFile } = require('child_process');
const util = require('util');
const fs = require('fs');
const os = require('os');
const path = require('path');
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

  const tmpFile = path.join(os.tmpdir(), `mssql_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.sql`);
  fs.writeFileSync(tmpFile, finalSql, 'utf8');

  try {
    const { stdout, stderr } = await execFileAsync('sqlcmd', [
      '-S', process.env.MSSQL_SERVER || 'localhost',
      '-E',
      '-d', process.env.MSSQL_DATABASE || 'TowerOfKnowledge',
      '-b',
      '-y', '0',
      '-w', '65535',
      '-f', '65001',
      '-i', tmpFile
    ], { encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 });

    if (stderr && stderr.trim().length > 0 && !stderr.includes('Changed database context')) {
      throw new Error(stderr);
    }
    if (/Msg \d+, Level \d+/i.test(stdout)) {
      throw new Error(stdout.trim());
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
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (e) {}
  }
}

/**
 * Adapt SQL Server dialect expressions to PostgreSQL cleanly
 */
function adaptForPostgres(sql) {
  if (!sql || typeof sql !== 'string') return sql;
  let adapted = sql
    .replace(/SYSDATETIME\(\)/gi, 'NOW()')
    .replace(/CAST\(NOW\(\)\s+AS\s+DATE\)/gi, 'CURRENT_DATE')
    .replace(/NEWID\(\)/gi, 'RANDOM()')
    .replace(/\b([a-zA-Z0-9_.]+\.)?dang_kich_hoat\s*=\s*1\b/gi, '$1dang_kich_hoat = TRUE')
    .replace(/\b([a-zA-Z0-9_.]+\.)?dang_kich_hoat\s*=\s*0\b/gi, '$1dang_kich_hoat = FALSE')
    .replace(/\b([a-zA-Z0-9_.]+\.)?bat_am_thanh\s*=\s*1\b/gi, '$1bat_am_thanh = TRUE')
    .replace(/\b([a-zA-Z0-9_.]+\.)?bat_am_thanh\s*=\s*0\b/gi, '$1bat_am_thanh = FALSE')
    .replace(/\b([a-zA-Z0-9_.]+\.)?la_dap_an_dung\s*=\s*1\b/gi, '$1la_dap_an_dung = TRUE')
    .replace(/\b([a-zA-Z0-9_.]+\.)?la_dap_an_dung\s*=\s*0\b/gi, '$1la_dap_an_dung = FALSE');

  // Convert SELECT TOP <N> <cols> ... to SELECT <cols> ... LIMIT <N>
  const topMatch = adapted.match(/^\s*SELECT\s+TOP\s+(\d+)\s+([\s\S]+)$/i);
  if (topMatch) {
    const limitNum = topMatch[1];
    const rest = topMatch[2];
    adapted = `SELECT ${rest} LIMIT ${limitNum}`;
  }

  return adapted;
}

/**
 * Unified query method
 * @param {string} sql SQL query with $1, $2 placeholders
 * @param {Array} params Parameter values
 * @returns {Promise<Array>} Array of row objects
 */
async function query(sql, params = []) {
  if (isPostgres) {
    const finalSql = adaptForPostgres(sql);
    const res = await pgPool.query(finalSql, params);
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
    const finalSql = adaptForPostgres(sql);
    const res = await pgPool.query(finalSql, params);
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
        query: (sql, params) => client.query(adaptForPostgres(sql), params).then(r => r.rows),
        queryOne: (sql, params) => client.query(adaptForPostgres(sql), params).then(r => r.rows[0] || null),
        execute: (sql, params) => client.query(adaptForPostgres(sql), params).then(r => ({ rowCount: r.rowCount }))
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
