const db = require('./db');
async function initUserPreferences() {
  for (const column of ['cai_dat_am_thanh', 'tien_do_huong_dan']) {
    await db.execute(db.isPostgres
      ? `ALTER TABLE nguoi_dung ADD COLUMN IF NOT EXISTS ${column} TEXT NULL`
      : `IF COL_LENGTH('nguoi_dung', '${column}') IS NULL ALTER TABLE nguoi_dung ADD ${column} NVARCHAR(MAX) NULL`);
  }
}
module.exports = { initUserPreferences };
