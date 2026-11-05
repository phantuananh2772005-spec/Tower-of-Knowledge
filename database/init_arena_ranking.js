const db=require('./db');
async function initArenaRanking(){
 await db.execute(db.isPostgres?"ALTER TABLE tran_dau_1v1 ADD COLUMN IF NOT EXISTS che_do VARCHAR(20) NOT NULL DEFAULT 'UNCLASSIFIED'":"IF COL_LENGTH('tran_dau_1v1','che_do') IS NULL ALTER TABLE tran_dau_1v1 ADD che_do VARCHAR(20) NOT NULL DEFAULT 'UNCLASSIFIED'");
 await db.execute(db.isPostgres?'ALTER TABLE nguoi_choi_trong_tran ADD COLUMN IF NOT EXISTS diem_hang_thay_doi INT NOT NULL DEFAULT 0':"IF COL_LENGTH('nguoi_choi_trong_tran','diem_hang_thay_doi') IS NULL ALTER TABLE nguoi_choi_trong_tran ADD diem_hang_thay_doi INT NOT NULL DEFAULT 0");
 const sql=`CREATE TABLE diem_dau_hang (ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,ma_mon VARCHAR(50) NOT NULL REFERENCES mon_hoc(ma_mon) ON DELETE CASCADE,diem INT NOT NULL DEFAULT 0 CHECK(diem>=0),PRIMARY KEY(ma_nguoi_dung,ma_mon))`;
 await db.execute(db.isPostgres?sql.replace('CREATE TABLE','CREATE TABLE IF NOT EXISTS'):"IF OBJECT_ID('diem_dau_hang','U') IS NULL "+sql);
}
module.exports={initArenaRanking};
