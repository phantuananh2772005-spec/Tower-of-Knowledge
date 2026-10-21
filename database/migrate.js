/**
 * Database Migration & Seed Runner
 * Usage: node database/migrate.js [--seed]
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);
require('dotenv').config();

const isPostgres = Boolean(
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'))
);

async function runMssqlFile(filePath) {
  console.log(`[MSSQL] Executing: ${path.basename(filePath)}`);
  const { stdout, stderr } = await execFileAsync('sqlcmd', [
    '-S', process.env.MSSQL_SERVER || 'localhost',
    '-E',
    '-f', '65001',
    '-i', filePath
  ], { encoding: 'utf8' });

  if (stdout) console.log(stdout.trim());
  if (stderr && stderr.trim().length > 0 && !stderr.includes('Changed database context')) {
    console.warn('[MSSQL STDERR]', stderr.trim());
  }
}

async function runPostgresFile(filePath) {
  console.log(`[PostgreSQL] Executing: ${path.basename(filePath)}`);
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
  await pool.end();
}

async function main() {
  const shouldSeed = process.argv.includes('--seed') || true;

  if (isPostgres) {
    console.log('==> Running PostgreSQL migrations...');
    await runPostgresFile(path.join(__dirname, 'migrations', '001_postgres_initial_schema.sql'));
    if (shouldSeed) {
      console.log('==> Running PostgreSQL seed...');
      await runPostgresFile(path.join(__dirname, 'seed_postgres.sql'));
    }
  } else {
    console.log('==> Running Microsoft SQL Server migrations...');
    await runMssqlFile(path.join(__dirname, 'migrations', '001_mssql_initial_schema.sql'));
    if (shouldSeed) {
      console.log('==> Running Microsoft SQL Server seed...');
      await runMssqlFile(path.join(__dirname, 'seed_mssql.sql'));
    }
  }

  console.log('==> Seeding Chapter 1 (5 checkpoints & 63 questions)...');
  try {
    const ch1Seeder = require('../scripts/seed_chapter1_5levels');
    await ch1Seeder.runSeed();
  } catch (seedErr) {
    console.warn('[MIGRATE] Warning: seed_chapter1_5levels error (non-fatal):', seedErr.message);
  }

  console.log('==> Database setup successfully completed!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
