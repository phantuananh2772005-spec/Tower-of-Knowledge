const db=require('./db');
async function initArenaRanking(){
 await db.execute(db.isPostgres?"ALTER TABLE tran_dau_1v1 ADD COLUMN IF NOT EXISTS che_do VARCHAR(20) NOT NULL DEFAULT 'UNCLASSIFIED'":"IF COL_LENGTH('tran_dau_1v1','che_do') IS NULL ALTER TABLE tran_dau_1v1 ADD che_do VARCHAR(20) NOT NULL DEFAULT 'UNCLASSIFIED'");
 await db.execute(db.isPostgres?'ALTER TABLE nguoi_choi_trong_tran ADD COLUMN IF NOT EXISTS diem_hang_thay_doi INT NOT NULL DEFAULT 0':"IF COL_LENGTH('nguoi_choi_trong_tran','diem_hang_thay_doi') IS NULL ALTER TABLE nguoi_choi_trong_tran ADD diem_hang_thay_doi INT NOT NULL DEFAULT 0");
 const sql=`CREATE TABLE diem_dau_hang (ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,ma_mon VARCHAR(50) NOT NULL REFERENCES mon_hoc(ma_mon) ON DELETE CASCADE,diem INT NOT NULL DEFAULT 0 CHECK(diem>=0),PRIMARY KEY(ma_nguoi_dung,ma_mon))`;
 await db.execute(db.isPostgres?sql.replace('CREATE TABLE','CREATE TABLE IF NOT EXISTS'):"IF OBJECT_ID('diem_dau_hang','U') IS NULL "+sql);
 const create = async (name, columns) => {
   const sql = `CREATE TABLE ${name} (${columns})`;
   await db.execute(db.isPostgres ? sql.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS')
     : `IF OBJECT_ID('${name}','U') IS NULL ${sql}`);
 };
 await create('mua_dau_hang', 'id INT PRIMARY KEY, mua INT NOT NULL');
 await create('lich_su_mua_dau_hang', `mua INT NOT NULL,
   ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
   diem INT NOT NULL, vi_tri INT NOT NULL, xu_thuong INT NOT NULL,
   diem_theo_mon VARCHAR(4000) NOT NULL, PRIMARY KEY(mua,ma_nguoi_dung)`);
 await db.execute(db.isPostgres ? 'INSERT INTO mua_dau_hang(id,mua) VALUES(1,1) ON CONFLICT (id) DO NOTHING'
   : 'IF NOT EXISTS (SELECT 1 FROM mua_dau_hang WHERE id=1) INSERT INTO mua_dau_hang(id,mua) VALUES(1,1)');
}
module.exports={initArenaRanking};
