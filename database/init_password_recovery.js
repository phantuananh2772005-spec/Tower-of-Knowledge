const db = require('./db');
async function initPasswordRecovery() {
  await db.execute(db.isPostgres
    ? 'ALTER TABLE nguoi_dung ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0'
    : "IF COL_LENGTH('nguoi_dung','session_version') IS NULL ALTER TABLE nguoi_dung ADD session_version INT NOT NULL DEFAULT 0");
  if (db.isPostgres) await db.execute(`CREATE TABLE IF NOT EXISTS password_recovery (
    user_id VARCHAR(100) PRIMARY KEY REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL, google_sub VARCHAR(255) NOT NULL,
    code_hash VARCHAR(64) NOT NULL, expires_at BIGINT NOT NULL,
    sent_at BIGINT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0
  )`);
}
module.exports = { initPasswordRecovery };
