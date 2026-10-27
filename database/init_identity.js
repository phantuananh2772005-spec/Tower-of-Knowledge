const db=require('./db');
async function initIdentity(){
  for(const [name,type] of [['google_sub','VARCHAR(255) NULL'],['google_email','VARCHAR(255) NULL'],['co_mat_khau',db.isPostgres?'BOOLEAN NOT NULL DEFAULT TRUE':'BIT NOT NULL DEFAULT 1']]){
    await db.execute(db.isPostgres?`ALTER TABLE nguoi_dung ADD COLUMN IF NOT EXISTS ${name} ${type}`:`IF COL_LENGTH('nguoi_dung','${name}') IS NULL ALTER TABLE nguoi_dung ADD ${name} ${type}`);
  }
  await db.execute(db.isPostgres
    ?'CREATE UNIQUE INDEX IF NOT EXISTS uq_nguoi_dung_google_sub ON nguoi_dung(google_sub) WHERE google_sub IS NOT NULL'
    :"IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uq_nguoi_dung_google_sub' AND object_id = OBJECT_ID('nguoi_dung')) CREATE UNIQUE INDEX uq_nguoi_dung_google_sub ON nguoi_dung(google_sub) WHERE google_sub IS NOT NULL");
}
module.exports={initIdentity};
