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

async function checkTableExists(tableName) {
  if (isPostgres) {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    try {
      const res = await pool.query(
        "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1",
        [tableName]
      );
      return res.rows.length > 0;
    } catch (e) {
      return false;
    } finally {
      await pool.end();
    }
  } else {
    try {
      const { stdout } = await execFileAsync('sqlcmd', [
        '-S', process.env.MSSQL_SERVER || 'localhost',
        '-E',
        '-d', process.env.MSSQL_DATABASE || 'TowerOfKnowledge',
        '-Q', `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${tableName}';`
      ], { encoding: 'utf8' });
      return stdout && stdout.includes('(1 rows affected)');
    } catch (e) {
      return false;
    }
  }
}

async function main() {
  const shouldSeed = process.argv.includes('--seed') || true;
  const forceFresh = process.argv.includes('--fresh');

  const tableExists = await checkTableExists('nguoi_dung');
  const isFreshDb = !tableExists;

  if (isFreshDb || forceFresh) {
    console.log(`==> Fresh database detected. Creating initial schema and seed...`);
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
  } else {
    console.log('==> Existing database detected. Preserving existing users and learning progress (non-destructive mode).');
  }

  // Add every schema extension before running seeders that use those columns.
  await require('../scripts/migrate_stepping').migrate();
  await require('./init_telemetry').initTelemetrySchema();
  await require('./sync_pet_catalog').syncPetCatalog();
  await require('./init_user_preferences').initUserPreferences();
  await require('./init_inventory').initInventory();
  await require('./init_identity').initIdentity();

  console.log('==> Seeding Chapter 1 (5 checkpoints & 63 questions)...');
  await require('../scripts/seed_chapter1_5levels').runSeed();
  if (isPostgres) {
    const cdsPgSql = path.join(__dirname, 'seed_postgres_cds.sql');
    if (fs.existsSync(cdsPgSql)) {
      console.log('==> Seeding Chuyen Doi So for PostgreSQL...');
      await runPostgresFile(cdsPgSql);
    }
  }

  console.log('==> Database setup successfully completed!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
