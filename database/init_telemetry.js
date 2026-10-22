/**
 * Database Migration for Session Telemetry and Adaptive Memory
 * Adds du_lieu_tri_nho column to tien_do_moc_bai_hoc
 * and creates lich_su_phien_hoc table.
 */

const db = require('./db');

async function initTelemetrySchema() {
  const isPostgres = Boolean(
    process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'))
  );

  console.log(`==> Initializing Telemetry Schema (${isPostgres ? 'PostgreSQL' : 'MSSQL'})...`);

  if (isPostgres) {
    // 1. Add du_lieu_tri_nho to tien_do_moc_bai_hoc if not exists
    await db.execute(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='tien_do_moc_bai_hoc' AND column_name='du_lieu_tri_nho'
        ) THEN 
          ALTER TABLE tien_do_moc_bai_hoc ADD COLUMN du_lieu_tri_nho TEXT NULL; 
        END IF; 
      END $$;
    `);

    // 2. Create lich_su_phien_hoc if not exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lich_su_phien_hoc (
        ma_phien VARCHAR(50) PRIMARY KEY,
        ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
        ma_moc VARCHAR(50) NOT NULL REFERENCES moc_bai_hoc(ma_moc) ON DELETE CASCADE,
        loai_phien VARCHAR(30) NOT NULL DEFAULT 'DUOLINGO_STEP',
        buoc_so INT NULL,
        thoi_gian_tong_giay REAL NOT NULL DEFAULT 0,
        ti_le_dung REAL NOT NULL DEFAULT 0,
        toc_do_trung_binh_giay REAL NOT NULL DEFAULT 0,
        tong_so_lan_tra_cuu INT NOT NULL DEFAULT 0,
        chi_tiet_cau_hoi TEXT NULL,
        tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Ensure phan_tram_hoan_thanh in tien_do_mon_hoc accepts floating-point percentages (e.g. 18.2%)
    await db.execute(`
      DO $$ 
      BEGIN 
        ALTER TABLE tien_do_mon_hoc ALTER COLUMN phan_tram_hoan_thanh TYPE REAL; 
      EXCEPTION WHEN OTHERS THEN 
        NULL; 
      END $$;
    `);
  } else {
    // MSSQL
    await db.execute(`
      IF COL_LENGTH('tien_do_moc_bai_hoc', 'du_lieu_tri_nho') IS NULL
      BEGIN
        ALTER TABLE tien_do_moc_bai_hoc ADD du_lieu_tri_nho NVARCHAR(MAX) NULL;
      END
    `);

    await db.execute(`
      IF OBJECT_ID('lich_su_phien_hoc', 'U') IS NULL
      BEGIN
        CREATE TABLE lich_su_phien_hoc (
          ma_phien VARCHAR(50) PRIMARY KEY,
          ma_nguoi_dung VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
          ma_moc VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES moc_bai_hoc(ma_moc) ON DELETE CASCADE,
          loai_phien VARCHAR(30) NOT NULL DEFAULT 'DUOLINGO_STEP',
          buoc_so INT NULL,
          thoi_gian_tong_giay FLOAT NOT NULL DEFAULT 0,
          ti_le_dung FLOAT NOT NULL DEFAULT 0,
          toc_do_trung_binh_giay FLOAT NOT NULL DEFAULT 0,
          tong_so_lan_tra_cuu INT NOT NULL DEFAULT 0,
          chi_tiet_cau_hoi NVARCHAR(MAX) NULL,
          tao_luc DATETIME2 NOT NULL DEFAULT SYSDATETIME()
        );
      END
    `);
  }

  // 4. Ensure canonical bot opponents exist for 1v1 Arena
  try {
    const { ensureBotUsers } = require('../scripts/seed_bots');
    await ensureBotUsers();
  } catch (botErr) {
    console.warn('⚠️ Could not ensure bot users in initTelemetrySchema:', botErr.message);
  }

  console.log('✅ Telemetry Schema initialized successfully!');
}

if (require.main === module) {
  initTelemetrySchema()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Failed to init telemetry schema:', err);
      process.exit(1);
    });
}

module.exports = { initTelemetrySchema };
