const db=require('./db');
async function initInventory(){
  if(db.isPostgres){
    await db.execute('ALTER TABLE nguoi_dung ADD COLUMN IF NOT EXISTS phu_kien_dang_dung VARCHAR(50) NULL');
    await db.execute(`CREATE TABLE IF NOT EXISTS vat_pham_so_huu (
      ma_so_huu VARCHAR(50) PRIMARY KEY,
      ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
      ma_vat_pham VARCHAR(50) NOT NULL,
      ngay_so_huu TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_nguoi_dung_vat_pham UNIQUE(ma_nguoi_dung,ma_vat_pham))`);
  }else{
    await db.execute(`IF COL_LENGTH('nguoi_dung','phu_kien_dang_dung') IS NULL ALTER TABLE nguoi_dung ADD phu_kien_dang_dung VARCHAR(50) NULL`);
    await db.execute(`IF OBJECT_ID('vat_pham_so_huu','U') IS NULL CREATE TABLE vat_pham_so_huu (
      ma_so_huu VARCHAR(50) PRIMARY KEY,
      ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
      ma_vat_pham VARCHAR(50) NOT NULL,
      ngay_so_huu DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
      CONSTRAINT uq_nguoi_dung_vat_pham UNIQUE(ma_nguoi_dung,ma_vat_pham))`);
  }
}
module.exports={initInventory};
