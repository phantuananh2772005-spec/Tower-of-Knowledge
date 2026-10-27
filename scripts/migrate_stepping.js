const db = require('../database/db');

async function migrate() {
  console.log('--- Checking & adding columns for Duolingo Stepping ---');

  if (db.isPostgres) {
    // PostgreSQL
    await db.execute(`
      ALTER TABLE cau_hoi ADD COLUMN IF NOT EXISTS muc_bloom VARCHAR(20) NOT NULL DEFAULT 'NHO';
      ALTER TABLE cau_hoi ADD COLUMN IF NOT EXISTS buoc_luyen_tap INT NOT NULL DEFAULT 1;
      ALTER TABLE cau_hoi ADD COLUMN IF NOT EXISTS du_lieu_cau_hoi TEXT NULL;
      ALTER TABLE cau_hoi ALTER COLUMN dap_an_a DROP NOT NULL;
      ALTER TABLE cau_hoi ALTER COLUMN dap_an_b DROP NOT NULL;
      ALTER TABLE cau_hoi ALTER COLUMN dap_an_c DROP NOT NULL;
      ALTER TABLE cau_hoi ALTER COLUMN dap_an_d DROP NOT NULL;
      ALTER TABLE cau_hoi ALTER COLUMN vi_tri_dap_an_dung DROP NOT NULL;

      ALTER TABLE tien_do_moc_bai_hoc ADD COLUMN IF NOT EXISTS buoc_hien_tai INT NOT NULL DEFAULT 1;
      ALTER TABLE tien_do_moc_bai_hoc ADD COLUMN IF NOT EXISTS cac_buoc_hoan_thanh VARCHAR(50) NOT NULL DEFAULT '0/4';
    `);
  } else {
    // Microsoft SQL Server
    await db.execute(`
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('cau_hoi') AND name = 'muc_bloom')
        ALTER TABLE cau_hoi ADD muc_bloom VARCHAR(20) NOT NULL DEFAULT 'NHO';

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('cau_hoi') AND name = 'buoc_luyen_tap')
        ALTER TABLE cau_hoi ADD buoc_luyen_tap INT NOT NULL DEFAULT 1;

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('cau_hoi') AND name = 'du_lieu_cau_hoi')
        ALTER TABLE cau_hoi ADD du_lieu_cau_hoi NVARCHAR(MAX) NULL;

      ALTER TABLE cau_hoi ALTER COLUMN dap_an_a NVARCHAR(MAX) NULL;
      ALTER TABLE cau_hoi ALTER COLUMN dap_an_b NVARCHAR(MAX) NULL;
      ALTER TABLE cau_hoi ALTER COLUMN dap_an_c NVARCHAR(MAX) NULL;
      ALTER TABLE cau_hoi ALTER COLUMN dap_an_d NVARCHAR(MAX) NULL;
      ALTER TABLE cau_hoi ALTER COLUMN vi_tri_dap_an_dung INT NULL;

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('tien_do_moc_bai_hoc') AND name = 'buoc_hien_tai')
        ALTER TABLE tien_do_moc_bai_hoc ADD buoc_hien_tai INT NOT NULL DEFAULT 1;

      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('tien_do_moc_bai_hoc') AND name = 'cac_buoc_hoan_thanh')
        ALTER TABLE tien_do_moc_bai_hoc ADD cac_buoc_hoan_thanh VARCHAR(50) NOT NULL DEFAULT '0/4';
    `);
  }

  console.log('✓ Migration executed successfully!');
}

if (require.main === module) migrate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
  });
module.exports = { migrate };
