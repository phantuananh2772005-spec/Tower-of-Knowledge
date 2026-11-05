const db = require('./db');

async function initRepeatExperience() {
  const ddl = `CREATE TABLE exp_lap_lai (
    ma_giao_dich VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    ngay_vn CHAR(10) NOT NULL,
    exp INT NOT NULL CHECK(exp > 0)
  )`;
  await db.execute(db.isPostgres
    ? ddl.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS')
    : "IF OBJECT_ID('exp_lap_lai','U') IS NULL " + ddl);
  const index = 'CREATE INDEX ix_exp_lap_lai_user_day ON exp_lap_lai(ma_nguoi_dung, ngay_vn)';
  await db.execute(db.isPostgres
    ? index.replace('CREATE INDEX','CREATE INDEX IF NOT EXISTS')
    : "IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='ix_exp_lap_lai_user_day' AND object_id=OBJECT_ID('exp_lap_lai')) " + index);
}
module.exports = { initRepeatExperience };
