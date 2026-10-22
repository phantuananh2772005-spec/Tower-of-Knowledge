/**
 * Admin Service
 * Provides comprehensive management for curriculum, question bank,
 * bulk imports (JSON/CSV), user accounts, and system analytics.
 */

const db = require('../database/db');
const { mutateCoins, addExperience } = require('./economy.service');
const { deriveRankTitle } = require('../core/rules/economy.rules');

/**
 * Get comprehensive system statistics
 */
async function getSystemStats() {
  const userCount = await db.queryOne('SELECT count(*) as total FROM nguoi_dung');
  const courseCount = await db.queryOne('SELECT count(*) as total FROM mon_hoc');
  const chapterCount = await db.queryOne('SELECT count(*) as total FROM chuong_hoc');
  const checkpointCount = await db.queryOne('SELECT count(*) as total FROM moc_bai_hoc');
  const questionCount = await db.queryOne('SELECT count(*) as total FROM cau_hoi');
  const matchCount = await db.queryOne('SELECT count(*) as total FROM tran_dau_1v1');
  const txCount = await db.queryOne('SELECT count(*) as total FROM giao_dich_xu');

  const recentUsers = await db.query('SELECT TOP 5 ma_nguoi_dung, ten_dang_nhap, ten_hien_thi, vai_tro, tong_diem_kinh_nghiem, xu_tri_thuc, chuoi_streak_ngay, tao_luc FROM nguoi_dung ORDER BY tao_luc DESC');
  const recentMatches = await db.query('SELECT TOP 5 ma_tran, ma_mon, trang_thai, nguoi_thang_cuoc, ly_do_ket_thuc, thoi_gian_bat_dau FROM tran_dau_1v1 ORDER BY thoi_gian_bat_dau DESC');

  return {
    tong_quan: {
      tong_nguoi_dung: userCount ? userCount.total : 0,
      tong_mon_hoc: courseCount ? courseCount.total : 0,
      tong_chuong: chapterCount ? chapterCount.total : 0,
      tong_moc: checkpointCount ? checkpointCount.total : 0,
      tong_cau_hoi: questionCount ? questionCount.total : 0,
      tong_tran_dau: matchCount ? matchCount.total : 0,
      tong_giao_dich: txCount ? txCount.total : 0
    },
    nguoi_dung_moi: recentUsers,
    tran_dau_gan_day: recentMatches
  };
}

/**
 * Course Management
 */
async function createCourse({ ten_mon, slug, mo_ta, anh_bia, thu_tu = 1 }) {
  const ma_mon = `mon_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.execute(`
    INSERT INTO mon_hoc (ma_mon, ten_mon, slug, mo_ta, anh_bia, thu_tu)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [ma_mon, ten_mon, slug, mo_ta, anh_bia, thu_tu]);
  return await db.queryOne('SELECT * FROM mon_hoc WHERE ma_mon = $1', [ma_mon]);
}

async function updateCourse(ma_mon, { ten_mon, slug, mo_ta, anh_bia, thu_tu }) {
  await db.execute(`
    UPDATE mon_hoc
    SET ten_mon = COALESCE($1, ten_mon),
        slug = COALESCE($2, slug),
        mo_ta = COALESCE($3, mo_ta),
        anh_bia = COALESCE($4, anh_bia),
        thu_tu = COALESCE($5, thu_tu)
    WHERE ma_mon = $6
  `, [ten_mon, slug, mo_ta, anh_bia, thu_tu, ma_mon]);
  return await db.queryOne('SELECT * FROM mon_hoc WHERE ma_mon = $1', [ma_mon]);
}

async function deleteCourse(ma_mon) {
  await db.execute('DELETE FROM mon_hoc WHERE ma_mon = $1', [ma_mon]);
  return { thanh_cong: true, ma_mon };
}

/**
 * Chapter Management
 */
async function createChapter({ ma_mon, tieu_de, thu_tu = 1, mo_ta }) {
  const ma_chuong = `ch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.execute(`
    INSERT INTO chuong_hoc (ma_chuong, ma_mon, tieu_de, thu_tu, mo_ta)
    VALUES ($1, $2, $3, $4, $5)
  `, [ma_chuong, ma_mon, tieu_de, thu_tu, mo_ta]);
  return await db.queryOne('SELECT * FROM chuong_hoc WHERE ma_chuong = $1', [ma_chuong]);
}

async function updateChapter(ma_chuong, { tieu_de, thu_tu, mo_ta }) {
  await db.execute(`
    UPDATE chuong_hoc
    SET tieu_de = COALESCE($1, tieu_de),
        thu_tu = COALESCE($2, thu_tu),
        mo_ta = COALESCE($3, mo_ta)
    WHERE ma_chuong = $4
  `, [tieu_de, thu_tu, mo_ta, ma_chuong]);
  return await db.queryOne('SELECT * FROM chuong_hoc WHERE ma_chuong = $1', [ma_chuong]);
}

async function deleteChapter(ma_chuong) {
  await db.execute('DELETE FROM chuong_hoc WHERE ma_chuong = $1', [ma_chuong]);
  return { thanh_cong: true, ma_chuong };
}

/**
 * Checkpoint Management
 */
async function createCheckpoint({ ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong = 15, xu_thuong = 10, thu_tu = 1, tong_so_buoc = 4, so_cau_moi_buoc = 10, cau_hinh_bloom = null }) {
  const ma_moc = `moc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.execute(`
    INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc, cau_hinh_bloom)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc, cau_hinh_bloom]);
  return await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
}

async function updateCheckpoint(ma_moc, { tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc, cau_hinh_bloom }) {
  await db.execute(`
    UPDATE moc_bai_hoc
    SET tieu_de = COALESCE($1, tieu_de),
        loai_moc = COALESCE($2, loai_moc),
        noi_dung_ly_thuyet = COALESCE($3, noi_dung_ly_thuyet),
        diem_thuong = COALESCE($4, diem_thuong),
        xu_thuong = COALESCE($5, xu_thuong),
        thu_tu = COALESCE($6, thu_tu),
        tong_so_buoc = COALESCE($7, tong_so_buoc),
        so_cau_moi_buoc = COALESCE($8, so_cau_moi_buoc),
        cau_hinh_bloom = COALESCE($9, cau_hinh_bloom)
    WHERE ma_moc = $10
  `, [tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc, cau_hinh_bloom, ma_moc]);
  return await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
}

async function deleteCheckpoint(ma_moc) {
  await db.execute('DELETE FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  return { thanh_cong: true, ma_moc };
}

/**
 * Question CRUD & Bulk Import
 */
async function listQuestions({ ma_moc, ma_mon, ma_chuong, limit = 500, offset = 0 } = {}) {
  const whereClauses = [];
  const params = [];

  if (ma_moc) {
    params.push(ma_moc);
    whereClauses.push(`q.ma_moc = $${params.length}`);
  }
  if (ma_chuong) {
    params.push(ma_chuong);
    whereClauses.push(`ch.ma_chuong = $${params.length}`);
  }
  if (ma_mon) {
    params.push(ma_mon);
    whereClauses.push(`mon.ma_mon = $${params.length}`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const topLimit = parseInt(limit, 10) || 500;

  const sql = `
    SELECT TOP ${topLimit}
      q.ma_cau_hoi, q.ma_moc, q.noi_dung, q.loai_cau_hoi, 
      q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d, 
      q.vi_tri_dap_an_dung, q.giai_thich, q.do_kho, q.muc_bloom, 
      q.buoc_luyen_tap, q.du_lieu_cau_hoi,
      m.tieu_de as ten_moc,
      ch.ma_chuong, ch.tieu_de as ten_chuong,
      mon.ma_mon, mon.ten_mon
    FROM cau_hoi q
    LEFT JOIN moc_bai_hoc m ON q.ma_moc = m.ma_moc
    LEFT JOIN chuong_hoc ch ON m.ma_chuong = ch.ma_chuong
    LEFT JOIN mon_hoc mon ON ch.ma_mon = mon.ma_mon
    ${whereSql}
    ORDER BY q.ma_cau_hoi ASC
  `;

  return await db.query(sql, params);
}

async function createQuestion({ ma_moc, noi_dung, loai_cau_hoi = 'TRAC_NGHIEM_4', dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho = 1, muc_bloom = 'NHO', buoc_luyen_tap = 1, du_lieu_cau_hoi = null }) {
  const ma_cau_hoi = `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.execute(`
    INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  `, [ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi]);
  return await db.queryOne('SELECT * FROM cau_hoi WHERE ma_cau_hoi = $1', [ma_cau_hoi]);
}

async function updateQuestion(ma_cau_hoi, data) {
  await db.execute(`
    UPDATE cau_hoi
    SET noi_dung = COALESCE($1, noi_dung),
        dap_an_a = COALESCE($2, dap_an_a),
        dap_an_b = COALESCE($3, dap_an_b),
        dap_an_c = COALESCE($4, dap_an_c),
        dap_an_d = COALESCE($5, dap_an_d),
        vi_tri_dap_an_dung = COALESCE($6, vi_tri_dap_an_dung),
        giai_thich = COALESCE($7, giai_thich),
        do_kho = COALESCE($8, do_kho),
        ma_moc = COALESCE($9, ma_moc),
        loai_cau_hoi = COALESCE($10, loai_cau_hoi),
        muc_bloom = COALESCE($11, muc_bloom),
        buoc_luyen_tap = COALESCE($12, buoc_luyen_tap),
        du_lieu_cau_hoi = COALESCE($13, du_lieu_cau_hoi)
    WHERE ma_cau_hoi = $14
  `, [
    data.noi_dung, data.dap_an_a, data.dap_an_b, data.dap_an_c, data.dap_an_d,
    data.vi_tri_dap_an_dung, data.giai_thich, data.do_kho, data.ma_moc,
    data.loai_cau_hoi, data.muc_bloom, data.buoc_luyen_tap, data.du_lieu_cau_hoi, ma_cau_hoi
  ]);
  return await db.queryOne('SELECT * FROM cau_hoi WHERE ma_cau_hoi = $1', [ma_cau_hoi]);
}

async function deleteQuestion(ma_cau_hoi) {
  await db.execute('DELETE FROM cau_hoi WHERE ma_cau_hoi = $1', [ma_cau_hoi]);
  return { thanh_cong: true, ma_cau_hoi };
}

/**
 * Bulk Import Questions (JSON array or CSV format)
 */
async function bulkImportQuestions(items, defaultMocId = null) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Dữ liệu nhập phải là một mảng câu hỏi không rỗng.');
  }

  let importedCount = 0;
  for (const item of items) {
    const ma_moc = item.ma_moc || defaultMocId;
    if (!item.noi_dung) continue;

    const ma_cau_hoi = item.ma_cau_hoi || `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.execute(`
      INSERT INTO cau_hoi (
        ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi,
        dap_an_a, dap_an_b, dap_an_c, dap_an_d,
        vi_tri_dap_an_dung, giai_thich, do_kho,
        muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      ma_cau_hoi,
      ma_moc,
      item.noi_dung,
      item.loai_cau_hoi || 'TRAC_NGHIEM_4',
      item.dap_an_a || '',
      item.dap_an_b || '',
      item.dap_an_c || '',
      item.dap_an_d || '',
      item.vi_tri_dap_an_dung !== undefined ? parseInt(item.vi_tri_dap_an_dung, 10) : null,
      item.giai_thich || '',
      item.do_kho ? parseInt(item.do_kho, 10) : 1,
      item.muc_bloom || 'NHO',
      item.buoc_luyen_tap ? parseInt(item.buoc_luyen_tap, 10) : 1,
      item.du_lieu_cau_hoi ? (typeof item.du_lieu_cau_hoi === 'string' ? item.du_lieu_cau_hoi : JSON.stringify(item.du_lieu_cau_hoi)) : null
    ]);
    importedCount++;
  }

  return { thanh_cong: true, tong_so_nhap: importedCount };
}

/**
 * Users Management
 */
async function listUsers() {
  return await db.query(`
    SELECT ma_nguoi_dung, ten_dang_nhap, email, ten_hien_thi, khung_avatar, vai_tro,
           tong_diem_kinh_nghiem, xu_tri_thuc, chuoi_streak_ngay, ngay_hoat_dong_cuoi,
           che_do_giao_dien, bat_am_thanh, tao_luc
    FROM nguoi_dung
    ORDER BY tao_luc DESC
  `);
}

async function updateUserRole(ma_nguoi_dung, vai_tro) {
  if (!['NGUOI_HOC', 'QUAN_TRI_VIEN'].includes(vai_tro)) {
    throw new Error('Vai trò không hợp lệ.');
  }
  await db.execute('UPDATE nguoi_dung SET vai_tro = $1 WHERE ma_nguoi_dung = $2', [vai_tro, ma_nguoi_dung]);
  return await db.queryOne('SELECT ma_nguoi_dung, ten_dang_nhap, vai_tro FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
}

async function adjustUserCoins(ma_nguoi_dung, amount, reason) {
  return await mutateCoins(ma_nguoi_dung, amount, 'THUONG_STREAK', reason || 'Điều chỉnh bởi Quản trị viên');
}

function formatDuration(sec) {
  const s = Math.round(Number(sec) || 0);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const remS = s % 60;
  if (m < 60) return `${m}p ${remS}s`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}g ${remM}p ${remS}s`;
}

async function hydrateQuestionDetails(detailsList) {
  if (!detailsList || !Array.isArray(detailsList) || detailsList.length === 0) return [];
  const missingIds = [...new Set(detailsList.filter(d => (!d.noi_dung || !d.giai_thich) && d.ma_cau_hoi).map(d => d.ma_cau_hoi))];
  let questionsMap = {};
  if (missingIds.length > 0) {
    try {
      const qRows = await db.query(`SELECT ma_cau_hoi, noi_dung, loai_cau_hoi, muc_bloom, do_kho, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich FROM cau_hoi WHERE ma_cau_hoi IN (${missingIds.map(id => `'${id}'`).join(',')})`);
      if (Array.isArray(qRows)) {
        qRows.forEach(row => { questionsMap[row.ma_cau_hoi] = row; });
      }
    } catch (e) {
      console.warn('⚠️ Hydration query notice:', e.message);
    }
  }

  return detailsList.map(item => {
    const qInfo = questionsMap[item.ma_cau_hoi];
    const opts = qInfo ? [qInfo.dap_an_a, qInfo.dap_an_b, qInfo.dap_an_c, qInfo.dap_an_d] : [];
    const correctIdx = item.dap_an_dung !== undefined && item.dap_an_dung !== null ? Number(item.dap_an_dung) : (qInfo && qInfo.vi_tri_dap_an_dung !== null ? Number(qInfo.vi_tri_dap_an_dung) : null);
    
    let userChoiceText = item.lua_chon_text || '';
    if (!userChoiceText && item.lua_chon !== undefined && item.lua_chon !== null) {
      if (typeof item.lua_chon === 'number' && opts[item.lua_chon]) {
        userChoiceText = opts[item.lua_chon];
      } else {
        userChoiceText = String(item.lua_chon);
      }
    }

    let correctText = item.dap_an_dung_text || '';
    if (!correctText && correctIdx !== null && opts[correctIdx]) {
      correctText = opts[correctIdx];
    }

    return {
      ma_cau_hoi: item.ma_cau_hoi,
      noi_dung: item.noi_dung || (qInfo ? qInfo.noi_dung : 'Câu hỏi ' + item.ma_cau_hoi),
      loai_cau_hoi: item.loai_cau_hoi || (qInfo ? qInfo.loai_cau_hoi : 'TRAC_NGHIEM_4'),
      muc_bloom: item.muc_bloom || (qInfo ? qInfo.muc_bloom : 'THONG_HIEU'),
      do_kho: item.do_kho || (qInfo ? qInfo.do_kho : 1),
      la_dung: item.la_dung !== undefined ? Boolean(item.la_dung) : (correctIdx !== null && item.lua_chon === correctIdx),
      lua_chon: item.lua_chon !== undefined ? item.lua_chon : item.chi_muc_chon,
      lua_chon_text: userChoiceText || (item.chi_muc_chon !== undefined ? `Đáp án ${['A','B','C','D'][item.chi_muc_chon]}` : '--'),
      dap_an_dung: correctIdx,
      dap_an_dung_text: correctText || (correctIdx !== null ? `Đáp án ${['A','B','C','D'][correctIdx]}` : '--'),
      thoi_gian_giay: item.thoi_gian_giay !== undefined ? Number(item.thoi_gian_giay) : 5,
      so_lan_tra_cuu: item.so_lan_tra_cuu !== undefined ? Number(item.so_lan_tra_cuu) : 0,
      giai_thich: item.giai_thich || (qInfo ? qInfo.giai_thich : '')
    };
  });
}

/**
 * Access & Learning Activity Feed (Recent Sessions + System Summary)
 */
async function getLearningActivityFeed() {
  // 1. Recent 10 live sessions across the system
  let recentSessions = [];
  try {
    recentSessions = await db.query(`
      SELECT TOP 10 p.ma_phien, p.ma_nguoi_dung, p.ma_moc, p.loai_phien, p.buoc_so,
             p.thoi_gian_tong_giay, p.ti_le_dung, p.toc_do_trung_binh_giay, p.tong_so_lan_tra_cuu,
             p.chi_tiet_cau_hoi, p.tao_luc,
             u.ten_hien_thi, u.ten_dang_nhap, u.khung_avatar, u.tong_diem_kinh_nghiem,
             m.tieu_de as ten_moc, c.tieu_de as ten_chuong, mn.ten_mon
      FROM lich_su_phien_hoc p
      JOIN nguoi_dung u ON p.ma_nguoi_dung = u.ma_nguoi_dung
      JOIN moc_bai_hoc m ON p.ma_moc = m.ma_moc
      JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
      JOIN mon_hoc mn ON c.ma_mon = mn.ma_mon
      ORDER BY p.tao_luc DESC
    `);
  } catch (err) {
    console.warn('⚠️ Error querying recent sessions:', err.message);
  }

  // Parse questions & hydrate for recent sessions
  const enrichedRecent = [];
  for (const s of (recentSessions || [])) {
    let parsedQ = [];
    try {
      parsedQ = typeof s.chi_tiet_cau_hoi === 'string' ? JSON.parse(s.chi_tiet_cau_hoi) : (s.chi_tiet_cau_hoi || []);
    } catch (e) { parsedQ = []; }
    const hydratedQ = await hydrateQuestionDetails(parsedQ);
    const correctCount = hydratedQ.filter(q => q.la_dung).length;

    enrichedRecent.push({
      ma_phien: s.ma_phien,
      ma_nguoi_dung: s.ma_nguoi_dung,
      ten_hien_thi: s.ten_hien_thi,
      ten_dang_nhap: s.ten_dang_nhap,
      khung_avatar: s.khung_avatar,
      rank_title: deriveRankTitle(s.tong_diem_kinh_nghiem || 0),
      ten_mon: s.ten_mon,
      ten_chuong: s.ten_chuong,
      ten_moc: s.ten_moc,
      loai_phien: s.loai_phien,
      buoc_so: s.buoc_so,
      ti_le_dung: Math.round(Number(s.ti_le_dung) || 0),
      so_cau_dung: correctCount,
      tong_so_cau: hydratedQ.length,
      thoi_gian_tong_giay: Number(s.thoi_gian_tong_giay) || 0,
      thoi_gian_dinh_dang: formatDuration(s.thoi_gian_tong_giay),
      tong_so_lan_tra_cuu: Number(s.tong_so_lan_tra_cuu) || 0,
      tao_luc: s.tao_luc,
      chi_tiet_cau_hoi: hydratedQ
    });
  }

  // 2. Aggregate telemetry summary
  let summary = {
    total_sessions: 0,
    total_learners_active: 0,
    avg_accuracy: 0,
    total_study_time_seconds: 0,
    formatted_total_time: '0s',
    total_lookups: 0
  };

  try {
    const agg = await db.queryOne(`
      SELECT COUNT(ma_phien) as total_sessions,
             COUNT(DISTINCT ma_nguoi_dung) as active_learners,
             AVG(ti_le_dung) as avg_accuracy,
             SUM(thoi_gian_tong_giay) as total_time,
             SUM(tong_so_lan_tra_cuu) as total_lookups
      FROM lich_su_phien_hoc
    `);
    if (agg) {
      summary.total_sessions = agg.total_sessions || 0;
      summary.total_learners_active = agg.active_learners || 0;
      summary.avg_accuracy = Math.round(Number(agg.avg_accuracy) || 0);
      summary.total_study_time_seconds = Math.round(Number(agg.total_time) || 0);
      summary.formatted_total_time = formatDuration(agg.total_time);
      summary.total_lookups = agg.total_lookups || 0;
    }
  } catch (errAgg) {
    console.warn('⚠️ Error aggregating telemetry summary:', errAgg.message);
  }

  // 3. Legacy checkpoint logs for backward compatibility
  const legacyLogs = await getActivityLogs();

  return {
    recent_activities: enrichedRecent,
    summary,
    legacy_logs: legacyLogs
  };
}

/**
 * Get all registered learners with comprehensive aggregated telemetry
 */
async function getLearnersTelemetryList() {
  const users = await db.query(`
    SELECT u.ma_nguoi_dung, u.ten_dang_nhap, u.ten_hien_thi, u.email, u.khung_avatar,
           u.vai_tro, u.tong_diem_kinh_nghiem, u.xu_tri_thuc, u.chuoi_streak_ngay,
           u.tao_luc, u.ngay_hoat_dong_cuoi,
           COUNT(p.ma_phien) as tong_so_phien,
           AVG(p.ti_le_dung) as ti_le_dung_tb,
           SUM(p.thoi_gian_tong_giay) as tong_thoi_gian_giay,
           SUM(p.tong_so_lan_tra_cuu) as tong_so_lan_tra_cuu,
           MAX(p.tao_luc) as hoat_dong_cuoi
    FROM nguoi_dung u
    LEFT JOIN lich_su_phien_hoc p ON u.ma_nguoi_dung = p.ma_nguoi_dung
    GROUP BY u.ma_nguoi_dung, u.ten_dang_nhap, u.ten_hien_thi, u.email, u.khung_avatar,
             u.vai_tro, u.tong_diem_kinh_nghiem, u.xu_tri_thuc, u.chuoi_streak_ngay,
             u.tao_luc, u.ngay_hoat_dong_cuoi
    ORDER BY MAX(p.tao_luc) DESC, u.tao_luc DESC
  `);

  // Count completed checkpoints per user
  let completedMap = {};
  try {
    const completedCounts = await db.query(`
      SELECT ma_nguoi_dung, COUNT(*) as completed_count
      FROM tien_do_moc_bai_hoc
      WHERE trang_thai = 'DA_HOAN_THANH'
      GROUP BY ma_nguoi_dung
    `);
    if (Array.isArray(completedCounts)) {
      completedCounts.forEach(c => { completedMap[c.ma_nguoi_dung] = c.completed_count; });
    }
  } catch (errCount) {
    console.warn('⚠️ Error counting completed checkpoints:', errCount.message);
  }

  return (users || []).map(u => ({
    ma_nguoi_dung: u.ma_nguoi_dung,
    ten_dang_nhap: u.ten_dang_nhap,
    ten_hien_thi: u.ten_hien_thi,
    email: u.email,
    khung_avatar: u.khung_avatar || 'khung_khoi_dau',
    vai_tro: u.vai_tro,
    tong_diem_kinh_nghiem: u.tong_diem_kinh_nghiem || 0,
    xu_tri_thuc: u.xu_tri_thuc || 0,
    chuoi_streak_ngay: u.chuoi_streak_ngay || 0,
    rank_title: deriveRankTitle(u.tong_diem_kinh_nghiem || 0),
    tong_so_phien: Number(u.tong_so_phien) || 0,
    ti_le_dung_tb: Math.round(Number(u.ti_le_dung_tb) || 0),
    tong_thoi_gian_giay: Number(u.tong_thoi_gian_giay) || 0,
    thoi_gian_dinh_dang: formatDuration(u.tong_thoi_gian_giay),
    tong_so_lan_tra_cuu: Number(u.tong_so_lan_tra_cuu) || 0,
    so_moc_hoan_thanh: completedMap[u.ma_nguoi_dung] || 0,
    hoat_dong_cuoi: u.hoat_dong_cuoi || u.ngay_hoat_dong_cuoi || u.tao_luc,
    tao_luc: u.tao_luc
  }));
}

/**
 * Deep-dive learner profile: All test history, granular question breakdown,
 * memory weaknesses, and checkpoint progress.
 */
async function getLearnerDeepTelemetry(userId) {
  const user = await db.queryOne(`
    SELECT ma_nguoi_dung, ten_dang_nhap, ten_hien_thi, email, khung_avatar,
           vai_tro, tong_diem_kinh_nghiem, xu_tri_thuc, chuoi_streak_ngay,
           ngay_hoat_dong_cuoi, tao_luc
    FROM nguoi_dung
    WHERE ma_nguoi_dung = $1
  `, [userId]);

  if (!user) {
    throw new Error('Không tìm thấy học viên với mã: ' + userId);
  }

  // 1. All sessions of this user
  let sessions = [];
  try {
    sessions = await db.query(`
      SELECT p.ma_phien, p.ma_moc, p.loai_phien, p.buoc_so,
             p.thoi_gian_tong_giay, p.ti_le_dung, p.toc_do_trung_binh_giay, p.tong_so_lan_tra_cuu,
             p.chi_tiet_cau_hoi, p.tao_luc,
             m.tieu_de as ten_moc, c.tieu_de as ten_chuong, mn.ten_mon
      FROM lich_su_phien_hoc p
      JOIN moc_bai_hoc m ON p.ma_moc = m.ma_moc
      JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
      JOIN mon_hoc mn ON c.ma_mon = mn.ma_mon
      WHERE p.ma_nguoi_dung = $1
      ORDER BY p.tao_luc DESC
    `, [userId]);
  } catch (errSess) {
    console.warn('⚠️ Error querying user sessions:', errSess.message);
  }

  let totalQuestionsCount = 0;
  let totalCorrectCount = 0;
  let totalLookupsCount = 0;
  let totalTimeSeconds = 0;

  const enrichedSessions = [];
  for (const s of (sessions || [])) {
    let parsedQ = [];
    try {
      parsedQ = typeof s.chi_tiet_cau_hoi === 'string' ? JSON.parse(s.chi_tiet_cau_hoi) : (s.chi_tiet_cau_hoi || []);
    } catch (e) { parsedQ = []; }
    const hydratedQ = await hydrateQuestionDetails(parsedQ);
    const correctCount = hydratedQ.filter(q => q.la_dung).length;

    totalQuestionsCount += hydratedQ.length;
    totalCorrectCount += correctCount;
    totalLookupsCount += (Number(s.tong_so_lan_tra_cuu) || 0);
    totalTimeSeconds += (Number(s.thoi_gian_tong_giay) || 0);

    enrichedSessions.push({
      ma_phien: s.ma_phien,
      ma_moc: s.ma_moc,
      ten_mon: s.ten_mon,
      ten_chuong: s.ten_chuong,
      ten_moc: s.ten_moc,
      loai_phien: s.loai_phien,
      buoc_so: s.buoc_so,
      ti_le_dung: Math.round(Number(s.ti_le_dung) || 0),
      so_cau_dung: correctCount,
      tong_so_cau: hydratedQ.length,
      thoi_gian_tong_giay: Number(s.thoi_gian_tong_giay) || 0,
      thoi_gian_dinh_dang: formatDuration(s.thoi_gian_tong_giay),
      toc_do_trung_binh_giay: Number(s.toc_do_trung_binh_giay) || 0,
      tong_so_lan_tra_cuu: Number(s.tong_so_lan_tra_cuu) || 0,
      tao_luc: s.tao_luc,
      chi_tiet_cau_hoi: hydratedQ
    });
  }

  // 2. Checkpoints progress
  let checkpoints = [];
  try {
    checkpoints = await db.query(`
      SELECT t.ma_tien_do_moc, t.ma_moc, m.tieu_de as ten_moc, c.tieu_de as ten_chuong, mn.ten_mon,
             t.trang_thai, t.diem_dat_duoc, t.xu_da_nhan, t.buoc_hien_tai, t.cac_buoc_hoan_thanh,
             t.du_lieu_tri_nho, t.thoi_diem_hoan_thanh
      FROM tien_do_moc_bai_hoc t
      JOIN moc_bai_hoc m ON t.ma_moc = m.ma_moc
      JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
      JOIN mon_hoc mn ON c.ma_mon = mn.ma_mon
      WHERE t.ma_nguoi_dung = $1
      ORDER BY t.thoi_diem_hoan_thanh DESC
    `, [userId]);
  } catch (errCp) {
    console.warn('⚠️ Error querying checkpoints progress:', errCp.message);
  }

  // 3. Extract Memory Map & Weaknesses from du_lieu_tri_nho
  const aggregatedMemoryMap = {};
  for (const cp of (checkpoints || [])) {
    if (cp.du_lieu_tri_nho) {
      try {
        const mem = typeof cp.du_lieu_tri_nho === 'string' ? JSON.parse(cp.du_lieu_tri_nho) : cp.du_lieu_tri_nho;
        if (mem && typeof mem === 'object') {
          for (const [qid, data] of Object.entries(mem)) {
            if (!aggregatedMemoryMap[qid]) {
              aggregatedMemoryMap[qid] = { ...data, ma_cau_hoi: qid };
            } else {
              aggregatedMemoryMap[qid].so_lan_lam += (data.so_lan_lam || 0);
              aggregatedMemoryMap[qid].so_lan_dung += (data.so_lan_dung || 0);
              aggregatedMemoryMap[qid].so_lan_sai += (data.so_lan_sai || 0);
              aggregatedMemoryMap[qid].tong_so_lan_tra_cuu += (data.tong_so_lan_tra_cuu || 0);
              aggregatedMemoryMap[qid].trong_so = Math.max(aggregatedMemoryMap[qid].trong_so, data.trong_so || 1.0);
            }
          }
        }
      } catch (e) {}
    }
  }

  const weaknessQIds = Object.keys(aggregatedMemoryMap);
  let weaknessQuestions = [];
  if (weaknessQIds.length > 0) {
    const hydratedWeak = await hydrateQuestionDetails(weaknessQIds.map(qid => ({ ma_cau_hoi: qid })));
    weaknessQuestions = hydratedWeak.map(q => {
      const mem = aggregatedMemoryMap[q.ma_cau_hoi] || {};
      const attempts = mem.so_lan_lam || 1;
      const wrong = mem.so_lan_sai || 0;
      const errorRate = Math.round((wrong / attempts) * 100);
      return {
        ...q,
        so_lan_lam: attempts,
        so_lan_dung: mem.so_lan_dung || 0,
        so_lan_sai: wrong,
        ti_le_sai: errorRate,
        thoi_gian_tb: mem.thoi_gian_tb || 0,
        tong_so_lan_tra_cuu: mem.tong_so_lan_tra_cuu || 0,
        trong_so: mem.trong_so || 1.0,
        streak: mem.streak || 0,
        lan_lam_cuoi: mem.lan_lam_cuoi
      };
    }).sort((a, b) => (b.ti_le_sai - a.ti_le_sai) || (b.trong_so - a.trong_so));
  }

  // 4. Compiled KPI
  const accuracyPct = totalQuestionsCount > 0 ? Math.round((totalCorrectCount / totalQuestionsCount) * 100) : 0;
  const avgTimePerQuestion = totalQuestionsCount > 0 ? Math.round((totalTimeSeconds / totalQuestionsCount) * 10) / 10 : 0;

  return {
    user: {
      ma_nguoi_dung: user.ma_nguoi_dung,
      ten_dang_nhap: user.ten_dang_nhap,
      ten_hien_thi: user.ten_hien_thi,
      email: user.email,
      khung_avatar: user.khung_avatar || 'khung_khoi_dau',
      vai_tro: user.vai_tro,
      tong_diem_kinh_nghiem: user.tong_diem_kinh_nghiem || 0,
      xu_tri_thuc: user.xu_tri_thuc || 0,
      chuoi_streak_ngay: user.chuoi_streak_ngay || 0,
      rank_title: deriveRankTitle(user.tong_diem_kinh_nghiem || 0),
      ngay_hoat_dong_cuoi: user.ngay_hoat_dong_cuoi,
      tao_luc: user.tao_luc
    },
    kpi: {
      total_sessions: enrichedSessions.length,
      total_questions: totalQuestionsCount,
      total_correct: totalCorrectCount,
      total_wrong: totalQuestionsCount - totalCorrectCount,
      accuracy_percentage: accuracyPct,
      total_time_seconds: totalTimeSeconds,
      formatted_total_time: formatDuration(totalTimeSeconds),
      avg_time_per_question: avgTimePerQuestion,
      total_lookups: totalLookupsCount,
      completed_checkpoints: (checkpoints || []).filter(c => c.trang_thai === 'DA_HOAN_THANH').length
    },
    sessions: enrichedSessions,
    weaknesses: weaknessQuestions,
    checkpoints_progress: (checkpoints || []).map(c => ({
      ma_tien_do_moc: c.ma_tien_do_moc,
      ma_moc: c.ma_moc,
      ten_mon: c.ten_mon,
      ten_chuong: c.ten_chuong,
      ten_moc: c.ten_moc,
      trang_thai: c.trang_thai,
      diem_dat_duoc: c.diem_dat_duoc,
      xu_da_nhan: c.xu_da_nhan,
      buoc_hien_tai: c.buoc_hien_tai,
      cac_buoc_hoan_thanh: c.cac_buoc_hoan_thanh,
      thoi_diem_hoan_thanh: c.thoi_diem_hoan_thanh
    }))
  };
}

/**
 * Access & Learning Activity Logs
 */
async function getActivityLogs() {
  const learningLogs = await db.query(`
    SELECT t.ma_tien_do_moc, u.ten_hien_thi, u.ten_dang_nhap, m.tieu_de as ten_moc, c.tieu_de as ten_chuong,
           t.trang_thai, t.diem_dat_duoc, t.xu_da_nhan, t.thoi_diem_hoan_thanh
    FROM tien_do_moc_bai_hoc t
    JOIN nguoi_dung u ON t.ma_nguoi_dung = u.ma_nguoi_dung
    JOIN moc_bai_hoc m ON t.ma_moc = m.ma_moc
    JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
    ORDER BY t.thoi_diem_hoan_thanh DESC
  `);
  return learningLogs;
}

async function getAllTransactions() {
  const tx = await db.query(`
    SELECT g.ma_giao_dich, u.ten_hien_thi, u.ten_dang_nhap, g.so_luong, g.so_du_sau, g.nguon_giao_dich, g.mo_ta, g.thoi_diem_tao
    FROM giao_dich_xu g
    JOIN nguoi_dung u ON g.ma_nguoi_dung = u.ma_nguoi_dung
    ORDER BY g.thoi_diem_tao DESC
  `);
  return tx;
}

/**
 * Pets Management
 */
async function listPets() {
  return await db.query('SELECT * FROM thu_cung ORDER BY gia_xu ASC');
}

async function createPet({ ma_thu_cung, ten_thu_cung, mo_ta, gia_xu, he_so_sat_thuong, anh_dai_dien, spritesheet_url }) {
  const id = ma_thu_cung || `pet_${Date.now()}`;
  await db.execute(`
    INSERT INTO thu_cung (ma_thu_cung, ten_thu_cung, mo_ta, gia_xu, he_so_sat_thuong, anh_dai_dien, spritesheet_url, cap_do_yeu_cau)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
  `, [id, ten_thu_cung, mo_ta || '', gia_xu || 0, he_so_sat_thuong || 1.1, anh_dai_dien || 'pet.png', spritesheet_url || 'pet_sheet.png']);
  return await db.queryOne('SELECT * FROM thu_cung WHERE ma_thu_cung = $1', [id]);
}

async function updatePet(id, { ten_thu_cung, mo_ta, gia_xu, he_so_sat_thuong }) {
  await db.execute(`
    UPDATE thu_cung
    SET ten_thu_cung = COALESCE($1, ten_thu_cung),
        mo_ta = COALESCE($2, mo_ta),
        gia_xu = COALESCE($3, gia_xu),
        he_so_sat_thuong = COALESCE($4, he_so_sat_thuong)
    WHERE ma_thu_cung = $5
  `, [ten_thu_cung, mo_ta, gia_xu, he_so_sat_thuong, id]);
  return await db.queryOne('SELECT * FROM thu_cung WHERE ma_thu_cung = $1', [id]);
}

async function deletePet(id) {
  await db.execute('DELETE FROM thu_cung WHERE ma_thu_cung = $1', [id]);
  return { thanh_cong: true, ma_thu_cung: id };
}

module.exports = {
  getSystemStats,
  createCourse,
  updateCourse,
  deleteCourse,
  createChapter,
  updateChapter,
  deleteChapter,
  createCheckpoint,
  updateCheckpoint,
  deleteCheckpoint,
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions,
  listUsers,
  updateUserRole,
  adjustUserCoins,
  getActivityLogs,
  getLearningActivityFeed,
  getLearnersTelemetryList,
  getLearnerDeepTelemetry,
  getAllTransactions,
  listPets,
  createPet,
  updatePet,
  deletePet
};
