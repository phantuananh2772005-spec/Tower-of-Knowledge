/**
 * Master Seeder Script: Môn Chuyển Đổi Số & Kinh Tế Số (mon_cds / chuyen-doi-so)
 * - 6 Chương học chuẩn đại học
 * - 18 Mốc bài học (3 mốc/chương, gồm 6 mốc Trùm Cuối BOSS)
 * - 174 Câu hỏi phong phú (120 câu gốc giáo trình + 54 câu mở rộng thực tế Việt Nam & Case studies)
 * - Cân bằng tuyệt đối vị trí đáp án đúng (34 A, 34 B, 34 C, 34 D)
 * - Tối ưu hóa: Thực thi 1 Batch duy nhất trong MSSQL (< 2 giây) & tạo file seed_postgres_cds.sql
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);
const db = require('../database/db');

const ch1Data = require('./cds_data_ch1');
const ch2Data = require('./cds_data_ch2');
const ch3Data = require('./cds_data_ch3');
const ch4Data = require('./cds_data_ch4');
const ch5Data = require('./cds_data_ch5');
const ch6Data = require('./cds_data_ch6');

const courseData = {
  ma_mon: 'mon_cds',
  ten_mon: 'Chuyển đổi số & Kinh tế số (Digital Transformation)',
  slug: 'chuyen-doi-so',
  mo_ta: 'Giáo trình đào tạo toàn diện chuẩn Đại học về Chuyển đổi số, Hạ tầng dữ liệu, Kinh tế số, Công nghệ 4.0, Chính phủ số & Kỹ năng số cho kỷ nguyên mới.',
  anh_bia: 'banner_cds.jpg',
  thu_tu: 2
};

const chaptersData = [
  {
    ma_chuong: 'ch_cds_01',
    ma_mon: 'mon_cds',
    tieu_de: 'Chương 1: Tổng quan về Chuyển đổi số',
    thu_tu: 1,
    mo_ta: 'Khái niệm số hóa vs chuyển đổi số, 3 trụ cột CĐS quốc gia (QĐ 749/QĐ-TTg) và bài học thất bại sống còn giữa Nokia và Apple iPhone.'
  },
  {
    ma_chuong: 'ch_cds_02',
    ma_mon: 'mon_cds',
    tieu_de: 'Chương 2: Dữ liệu và Quản trị dữ liệu số',
    thu_tu: 2,
    mo_ta: 'Dữ liệu như nguồn dầu mỏ mới, chu trình quản trị dữ liệu (Thu thập -> Xử lý -> Chia sẻ), Open Data và Luật Bảo vệ dữ liệu cá nhân NĐ 13/2023.'
  },
  {
    ma_chuong: 'ch_cds_03',
    ma_mon: 'mon_cds',
    tieu_de: 'Chương 3: Kinh tế số & Mô hình kinh doanh số',
    thu_tu: 3,
    mo_ta: '3 cấu phần kinh tế số theo OECD, kinh tế nền tảng hai phía, mô hình O2O JioMart - Kirana, Highlands Coffee và cơ cấu chỉ số DTI Việt Nam.'
  },
  {
    ma_chuong: 'ch_cds_04',
    ma_mon: 'mon_cds',
    tieu_de: 'Chương 4: Các công nghệ cốt lõi trong Chuyển đổi số',
    thu_tu: 4,
    mo_ta: 'Trí tuệ nhân tạo (AI y tế DrAid VinBrain), Đám mây Make in Vietnam, Dữ liệu lớn Tiki/Shopee, IoT VNPT SmartAgri và Blockchain TPBank.'
  },
  {
    ma_chuong: 'ch_cds_05',
    ma_mon: 'mon_cds',
    tieu_de: 'Chương 5: Xã hội số, Chính phủ số & Ngành trọng yếu',
    thu_tu: 5,
    mo_ta: 'Công dân số thời 4.0, thanh toán MoMo/VNPay, Trục NDXP, phòng họp eCabinet, ERP doanh nghiệp, CĐS Y tế - Giáo dục và bài học thành công Amazon.'
  },
  {
    ma_chuong: 'ch_cds_06',
    ma_mon: 'mon_cds',
    tieu_de: 'Chương 6: Kỹ năng số, Phân tích dữ liệu & An toàn thông tin',
    thu_tu: 6,
    mo_ta: 'Nghệ thuật Prompting AI, thẩm định nguồn tin số CRAAP, phân tích DataFrame & Power BI, an toàn số phòng chống Phishing và bảo vệ 2FA.'
  }
];

const allCheckpoints = [
  ...ch1Data.checkpointsCh1,
  ...ch2Data.checkpointsCh2,
  ...ch3Data.checkpointsCh3,
  ...ch4Data.checkpointsCh4,
  ...ch5Data.checkpointsCh5,
  ...ch6Data.checkpointsCh6
];

const chapterConfigs = [
  { name: 'ch1', qs: ch1Data.questionsCh1, targetCounts: [6, 5, 6, 5] },
  { name: 'ch2', qs: ch2Data.questionsCh2, targetCounts: [5, 6, 5, 6] },
  { name: 'ch3', qs: ch3Data.questionsCh3, targetCounts: [6, 5, 6, 5] },
  { name: 'ch4', qs: ch4Data.questionsCh4, targetCounts: [5, 6, 5, 6] },
  { name: 'ch5', qs: ch5Data.questionsCh5, targetCounts: [6, 6, 6, 6] },
  { name: 'ch6', qs: ch6Data.questionsCh6, targetCounts: [6, 6, 6, 6] }
];

function prepareAllQuestions() {
  const prepared = [];

  chapterConfigs.forEach(cfg => {
    const mcqs = cfg.qs.filter(q => q.loai_cau_hoi === 'TRAC_NGHIEM_4');
    const nonMcqs = cfg.qs.filter(q => q.loai_cau_hoi !== 'TRAC_NGHIEM_4');

    const targets = [];
    cfg.targetCounts.forEach((count, pos) => {
      for (let i = 0; i < count; i++) targets.push(pos);
    });

    for (let i = targets.length - 1; i > 0; i--) {
      const j = (i * 13 + 7) % (i + 1);
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }

    mcqs.forEach((q, idx) => {
      const targetPos = targets[idx];
      let originalOpts = [];
      let originalCorrect = q.vi_tri_dap_an_dung !== undefined && q.vi_tri_dap_an_dung !== null ? q.vi_tri_dap_an_dung : 0;

      if (q.dap_an_a !== undefined) {
        originalOpts = [q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d];
      } else if (q.du_lieu_cau_hoi) {
        try {
          const parsed = typeof q.du_lieu_cau_hoi === 'string' ? JSON.parse(q.du_lieu_cau_hoi) : q.du_lieu_cau_hoi;
          if (parsed && Array.isArray(parsed.options)) {
            originalOpts = parsed.options;
          }
        } catch (e) {}
      }

      if (originalOpts.length < 4) {
        originalOpts = [
          originalOpts[0] || 'Lựa chọn A',
          originalOpts[1] || 'Lựa chọn B',
          originalOpts[2] || 'Lựa chọn C',
          originalOpts[3] || 'Lựa chọn D'
        ];
      }

      const correctText = originalOpts[originalCorrect];
      const distractors = originalOpts.filter((_, i) => i !== originalCorrect);

      const newOpts = [];
      let distractorIdx = 0;
      for (let p = 0; p < 4; p++) {
        if (p === targetPos) {
          newOpts.push(correctText);
        } else {
          newOpts.push(distractors[distractorIdx++]);
        }
      }

      prepared.push({
        ma_cau_hoi: q.ma_cau_hoi,
        ma_moc: q.ma_moc,
        noi_dung: q.noi_dung,
        loai_cau_hoi: 'TRAC_NGHIEM_4',
        dap_an_a: newOpts[0],
        dap_an_b: newOpts[1],
        dap_an_c: newOpts[2],
        dap_an_d: newOpts[3],
        vi_tri_dap_an_dung: targetPos,
        giai_thich: q.giai_thich || '',
        do_kho: q.do_kho || 1,
        muc_bloom: q.muc_bloom || 'HIEU',
        buoc_luyen_tap: q.buoc_luyen_tap || 1,
        du_lieu_cau_hoi: null
      });
    });

    nonMcqs.forEach(q => {
      prepared.push({
        ma_cau_hoi: q.ma_cau_hoi,
        ma_moc: q.ma_moc,
        noi_dung: q.noi_dung,
        loai_cau_hoi: q.loai_cau_hoi,
        dap_an_a: null,
        dap_an_b: null,
        dap_an_c: null,
        dap_an_d: null,
        vi_tri_dap_an_dung: null,
        giai_thich: q.giai_thich || '',
        do_kho: q.do_kho || 2,
        muc_bloom: q.muc_bloom || 'VAN_DUNG',
        buoc_luyen_tap: q.buoc_luyen_tap || 3,
        du_lieu_cau_hoi: typeof q.du_lieu_cau_hoi === 'object' ? JSON.stringify(q.du_lieu_cau_hoi) : q.du_lieu_cau_hoi
      });
    });
  });

  return prepared;
}

function esc(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escMssql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `N'${String(str).replace(/'/g, "''")}'`;
}

/**
 * Generate MSSQL Single Batch
 */
function generateMssqlBatch(questions) {
  let sql = `USE TowerOfKnowledge;\nSET ANSI_NULLS ON;\nSET QUOTED_IDENTIFIER ON;\nSET NOCOUNT ON;\n\n`;

  // Mon hoc
  sql += `IF EXISTS (SELECT 1 FROM mon_hoc WHERE ma_mon = 'mon_cds')\n`;
  sql += `  UPDATE mon_hoc SET ten_mon = ${escMssql(courseData.ten_mon)}, slug = ${escMssql(courseData.slug)}, mo_ta = ${escMssql(courseData.mo_ta)}, anh_bia = ${escMssql(courseData.anh_bia)}, thu_tu = ${courseData.thu_tu} WHERE ma_mon = 'mon_cds';\n`;
  sql += `ELSE\n`;
  sql += `  INSERT INTO mon_hoc (ma_mon, ten_mon, slug, mo_ta, anh_bia, thu_tu) VALUES ('mon_cds', ${escMssql(courseData.ten_mon)}, ${escMssql(courseData.slug)}, ${escMssql(courseData.mo_ta)}, ${escMssql(courseData.anh_bia)}, ${courseData.thu_tu});\n\n`;

  // Chuong hoc
  for (const ch of chaptersData) {
    sql += `IF EXISTS (SELECT 1 FROM chuong_hoc WHERE ma_chuong = '${ch.ma_chuong}')\n`;
    sql += `  UPDATE chuong_hoc SET tieu_de = ${escMssql(ch.tieu_de)}, thu_tu = ${ch.thu_tu}, mo_ta = ${escMssql(ch.mo_ta)}, ma_mon = '${ch.ma_mon}' WHERE ma_chuong = '${ch.ma_chuong}';\n`;
    sql += `ELSE\n`;
    sql += `  INSERT INTO chuong_hoc (ma_chuong, ma_mon, tieu_de, thu_tu, mo_ta) VALUES ('${ch.ma_chuong}', '${ch.ma_mon}', ${escMssql(ch.tieu_de)}, ${ch.thu_tu}, ${escMssql(ch.mo_ta)});\n`;
  }
  sql += `\n`;

  // Moc bai hoc
  for (const m of allCheckpoints) {
    const isBoss = m.tieu_de.includes('[BOSS]');
    const loaiMoc = isBoss ? 'THU_THACH_BOSS' : 'TRAC_NGHIEM';
    const totalSteps = isBoss ? 5 : 4;
    const qPerStep = 10;
    sql += `IF EXISTS (SELECT 1 FROM moc_bai_hoc WHERE ma_moc = '${m.ma_moc}')\n`;
    sql += `  UPDATE moc_bai_hoc SET ma_chuong = '${m.ma_chuong}', tieu_de = ${escMssql(m.tieu_de)}, loai_moc = '${loaiMoc}', noi_dung_ly_thuyet = ${escMssql(m.noi_dung_ly_thuyet)}, diem_thuong = ${m.diem_thuong}, xu_thuong = ${m.xu_thuong}, thu_tu = ${m.thu_tu}, tong_so_buoc = ${totalSteps}, so_cau_moi_buoc = ${qPerStep} WHERE ma_moc = '${m.ma_moc}';\n`;
    sql += `ELSE\n`;
    sql += `  INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc) VALUES ('${m.ma_moc}', '${m.ma_chuong}', ${escMssql(m.tieu_de)}, '${loaiMoc}', ${escMssql(m.noi_dung_ly_thuyet)}, ${m.diem_thuong}, ${m.xu_thuong}, ${m.thu_tu}, ${totalSteps}, ${qPerStep});\n`;
  }
  sql += `\n`;

  // Cau hoi
  for (const q of questions) {
    const vt = q.vi_tri_dap_an_dung !== null && q.vi_tri_dap_an_dung !== undefined ? q.vi_tri_dap_an_dung : 'NULL';
    sql += `IF EXISTS (SELECT 1 FROM cau_hoi WHERE ma_cau_hoi = '${q.ma_cau_hoi}')\n`;
    sql += `  UPDATE cau_hoi SET ma_moc = '${q.ma_moc}', noi_dung = ${escMssql(q.noi_dung)}, loai_cau_hoi = '${q.loai_cau_hoi}', dap_an_a = ${escMssql(q.dap_an_a)}, dap_an_b = ${escMssql(q.dap_an_b)}, dap_an_c = ${escMssql(q.dap_an_c)}, dap_an_d = ${escMssql(q.dap_an_d)}, vi_tri_dap_an_dung = ${vt}, giai_thich = ${escMssql(q.giai_thich)}, do_kho = ${q.do_kho}, muc_bloom = '${q.muc_bloom}', buoc_luyen_tap = ${q.buoc_luyen_tap}, du_lieu_cau_hoi = ${escMssql(q.du_lieu_cau_hoi)} WHERE ma_cau_hoi = '${q.ma_cau_hoi}';\n`;
    sql += `ELSE\n`;
    sql += `  INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi) VALUES ('${q.ma_cau_hoi}', '${q.ma_moc}', ${escMssql(q.noi_dung)}, '${q.loai_cau_hoi}', ${escMssql(q.dap_an_a)}, ${escMssql(q.dap_an_b)}, ${escMssql(q.dap_an_c)}, ${escMssql(q.dap_an_d)}, ${vt}, ${escMssql(q.giai_thich)}, ${q.do_kho}, '${q.muc_bloom}', ${q.buoc_luyen_tap}, ${escMssql(q.du_lieu_cau_hoi)});\n`;
  }

  return sql;
}

/**
 * Generate Postgres SQL file
 */
function generatePostgresSql(questions) {
  let sql = `-- =======================================================================\n`;
  sql += `-- SEED DATA: seed_postgres_cds.sql\n`;
  sql += `-- Course: Chuyen doi so & Kinh te so (mon_cds / chuyen-doi-so)\n`;
  sql += `-- Auto-generated with 6 Chapters, 18 Checkpoints, 174 Questions\n`;
  sql += `-- =======================================================================\n\n`;

  // 1. Mon hoc
  sql += `-- 1. MON HOC\n`;
  sql += `INSERT INTO mon_hoc (ma_mon, ten_mon, slug, mo_ta, anh_bia, thu_tu)\n`;
  sql += `VALUES (${esc(courseData.ma_mon)}, ${esc(courseData.ten_mon)}, ${esc(courseData.slug)}, ${esc(courseData.mo_ta)}, ${esc(courseData.anh_bia)}, ${courseData.thu_tu})\n`;
  sql += `ON CONFLICT (ma_mon) DO UPDATE SET\n`;
  sql += `  ten_mon = EXCLUDED.ten_mon,\n  slug = EXCLUDED.slug,\n  mo_ta = EXCLUDED.mo_ta,\n  anh_bia = EXCLUDED.anh_bia,\n  thu_tu = EXCLUDED.thu_tu;\n\n`;

  // 2. Chuong hoc
  sql += `-- 2. CHUONG HOC (6 CHUONG)\n`;
  for (const ch of chaptersData) {
    sql += `INSERT INTO chuong_hoc (ma_chuong, ma_mon, tieu_de, thu_tu, mo_ta)\n`;
    sql += `VALUES (${esc(ch.ma_chuong)}, ${esc(ch.ma_mon)}, ${esc(ch.tieu_de)}, ${ch.thu_tu}, ${esc(ch.mo_ta)})\n`;
    sql += `ON CONFLICT (ma_chuong) DO UPDATE SET\n`;
    sql += `  tieu_de = EXCLUDED.tieu_de,\n  thu_tu = EXCLUDED.thu_tu,\n  mo_ta = EXCLUDED.mo_ta;\n`;
  }
  sql += `\n`;

  // 3. Moc bai hoc
  sql += `-- 3. MOC BAI HOC (18 MOC)\n`;
  for (const m of allCheckpoints) {
    const isBoss = m.tieu_de.includes('[BOSS]');
    const loaiMoc = isBoss ? 'THU_THACH_BOSS' : 'TRAC_NGHIEM';
    const totalSteps = isBoss ? 5 : 4;
    const qPerStep = 10;
    sql += `INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)\n`;
    sql += `VALUES (${esc(m.ma_moc)}, ${esc(m.ma_chuong)}, ${esc(m.tieu_de)}, '${loaiMoc}', ${esc(m.noi_dung_ly_thuyet)}, ${m.diem_thuong}, ${m.xu_thuong}, ${m.thu_tu}, ${totalSteps}, ${qPerStep})\n`;
    sql += `ON CONFLICT (ma_moc) DO UPDATE SET\n`;
    sql += `  tieu_de = EXCLUDED.tieu_de,\n  loai_moc = EXCLUDED.loai_moc,\n  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,\n  diem_thuong = EXCLUDED.diem_thuong,\n  xu_thuong = EXCLUDED.xu_thuong,\n  thu_tu = EXCLUDED.thu_tu,\n  tong_so_buoc = EXCLUDED.tong_so_buoc,\n  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;\n`;
  }
  sql += `\n`;

  // 4. Cau hoi
  sql += `-- 4. CAU HOI (174 CAU)\n`;
  for (const q of questions) {
    const vt = q.vi_tri_dap_an_dung !== null && q.vi_tri_dap_an_dung !== undefined ? q.vi_tri_dap_an_dung : 'NULL';
    sql += `INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)\n`;
    sql += `VALUES (${esc(q.ma_cau_hoi)}, ${esc(q.ma_moc)}, ${esc(q.noi_dung)}, ${esc(q.loai_cau_hoi)}, ${esc(q.dap_an_a)}, ${esc(q.dap_an_b)}, ${esc(q.dap_an_c)}, ${esc(q.dap_an_d)}, ${vt}, ${esc(q.giai_thich)}, ${q.do_kho}, ${esc(q.muc_bloom)}, ${q.buoc_luyen_tap}, ${esc(q.du_lieu_cau_hoi)})\n`;
    sql += `ON CONFLICT (ma_cau_hoi) DO UPDATE SET\n`;
    sql += `  noi_dung = EXCLUDED.noi_dung,\n  loai_cau_hoi = EXCLUDED.loai_cau_hoi,\n  dap_an_a = EXCLUDED.dap_an_a,\n  dap_an_b = EXCLUDED.dap_an_b,\n  dap_an_c = EXCLUDED.dap_an_c,\n  dap_an_d = EXCLUDED.dap_an_d,\n  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,\n  giai_thich = EXCLUDED.giai_thich,\n  do_kho = EXCLUDED.do_kho,\n  muc_bloom = EXCLUDED.muc_bloom,\n  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,\n  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;\n`;
  }

  return sql;
}

async function main() {
  console.log('=== [SEED_CDS] KHỞI CHẠY TIẾN TRÌNH SEED MÔN CHUYỂN ĐỔI SỐ ===');

  const questions = prepareAllQuestions();
  console.log(`[SEED_CDS] Đã chuẩn bị ${questions.length} câu hỏi đạt chuẩn.`);

  const spread = { A: 0, B: 0, C: 0, D: 0, Interactive: 38 };
  questions.forEach(q => {
    if (q.vi_tri_dap_an_dung === 0) spread.A++;
    else if (q.vi_tri_dap_an_dung === 1) spread.B++;
    else if (q.vi_tri_dap_an_dung === 2) spread.C++;
    else if (q.vi_tri_dap_an_dung === 3) spread.D++;
  });
  console.log('[SEED_CDS] Phân bố đáp án đúng:', spread);

  // MSSQL Execution via Batch
  const mssqlBatch = generateMssqlBatch(questions);
  const tmpSql = path.join(os.tmpdir(), `seed_cds_${Date.now()}.sql`);
  fs.writeFileSync(tmpSql, mssqlBatch, 'utf8');

  console.log('[SEED_CDS] Đang nạp toàn bộ cấu trúc vào Database qua SQL Batch...');
  try {
    const { stdout, stderr } = await execFileAsync('sqlcmd', [
      '-S', process.env.MSSQL_SERVER || 'localhost',
      '-E',
      '-d', process.env.MSSQL_DATABASE || 'TowerOfKnowledge',
      '-b',
      '-y', '0',
      '-w', '65535',
      '-f', '65001',
      '-i', tmpSql
    ], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });

    if (stderr && stderr.trim().length > 0 && !stderr.includes('Changed database context')) {
      console.warn('[SEED_CDS] Cảnh báo SQL:', stderr);
    }
    console.log('[SEED_CDS] Đã nạp thành công 100% dữ liệu vào MSSQL!');
  } finally {
    try { fs.unlinkSync(tmpSql); } catch (e) {}
  }

  // Generate Postgres SQL file
  const pgSqlPath = path.join(__dirname, '..', 'database', 'seed_postgres_cds.sql');
  const pgSqlContent = generatePostgresSql(questions);
  fs.writeFileSync(pgSqlPath, pgSqlContent, 'utf8');
  console.log(`[SEED_CDS] Đã tạo file triển khai Render Postgres: ${pgSqlPath} (${(pgSqlContent.length / 1024).toFixed(1)} KB)`);

  console.log('=== [SEED_CDS] HOÀN TẤT 100% THÀNH CÔNG RỰC RỠ! ===');
  process.exit(0);
}

if (require.main === module) {
  main().catch(err => {
    console.error('[SEED_CDS] LỖI:', err);
    process.exit(1);
  });
}

module.exports = { prepareAllQuestions, generatePostgresSql };
