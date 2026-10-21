/**
 * Admin Service
 * Provides comprehensive management for curriculum, question bank,
 * bulk imports (JSON/CSV), user accounts, and system analytics.
 */

const db = require('../database/db');
const { mutateCoins, addExperience } = require('./economy.service');

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
async function createCheckpoint({ ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong = 15, xu_thuong = 10, thu_tu = 1 }) {
  const ma_moc = `moc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.execute(`
    INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu]);
  return await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
}

async function updateCheckpoint(ma_moc, { tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu }) {
  await db.execute(`
    UPDATE moc_bai_hoc
    SET tieu_de = COALESCE($1, tieu_de),
        loai_moc = COALESCE($2, loai_moc),
        noi_dung_ly_thuyet = COALESCE($3, noi_dung_ly_thuyet),
        diem_thuong = COALESCE($4, diem_thuong),
        xu_thuong = COALESCE($5, xu_thuong),
        thu_tu = COALESCE($6, thu_tu)
    WHERE ma_moc = $7
  `, [tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, ma_moc]);
  return await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
}

async function deleteCheckpoint(ma_moc) {
  await db.execute('DELETE FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  return { thanh_cong: true, ma_moc };
}

/**
 * Question CRUD & Bulk Import
 */
async function listQuestions({ ma_moc, limit = 50, offset = 0 } = {}) {
  if (ma_moc) {
    return await db.query(
      'SELECT ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho FROM cau_hoi WHERE ma_moc = $1 ORDER BY ma_cau_hoi ASC',
      [ma_moc]
    );
  }
  return await db.query(
    'SELECT TOP ' + parseInt(limit, 10) + ' ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho FROM cau_hoi ORDER BY ma_cau_hoi ASC'
  );
}

async function createQuestion({ ma_moc, noi_dung, loai_cau_hoi = 'TRAC_NGHIEM_4', dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho = 1 }) {
  const ma_cau_hoi = `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.execute(`
    INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho]);
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
        ma_moc = COALESCE($9, ma_moc)
    WHERE ma_cau_hoi = $10
  `, [
    data.noi_dung, data.dap_an_a, data.dap_an_b, data.dap_an_c, data.dap_an_d,
    data.vi_tri_dap_an_dung, data.giai_thich, data.do_kho, data.ma_moc, ma_cau_hoi
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
    if (!item.noi_dung || !item.dap_an_a || !item.dap_an_b || item.vi_tri_dap_an_dung === undefined) {
      continue;
    }

    const ma_cau_hoi = item.ma_cau_hoi || `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.execute(`
      INSERT INTO cau_hoi (
        ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi,
        dap_an_a, dap_an_b, dap_an_c, dap_an_d,
        vi_tri_dap_an_dung, giai_thich, do_kho
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      ma_cau_hoi,
      ma_moc,
      item.noi_dung,
      item.loai_cau_hoi || 'TRAC_NGHIEM_4',
      item.dap_an_a,
      item.dap_an_b,
      item.dap_an_c || '',
      item.dap_an_d || '',
      parseInt(item.vi_tri_dap_an_dung, 10),
      item.giai_thich || '',
      item.do_kho ? parseInt(item.do_kho, 10) : 1
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
  adjustUserCoins
};
