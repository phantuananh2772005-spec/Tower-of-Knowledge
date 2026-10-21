const assert = require('assert');
const authService = require('../services/auth.service');
const courseService = require('../services/course.service');
const db = require('../database/db');

async function testFull5LevelsProgression() {
  console.log('=== VERIFYING STRICT SEQUENTIAL PROGRESSION (1.1 -> 1.2 -> 1.3 -> 1.4 -> 1.5 -> 2.1) ===');

  const testUser = `linear_tester_${Date.now()}`;
  const regResult = await authService.register({
    ten_dang_nhap: testUser,
    mat_khau: 'Pass123456@',
    ten_hien_thi: 'Tester Leo Tháp Chuẩn'
  });
  const userId = regResult.nguoi_dung.ma_nguoi_dung;

  // 1. Enroll into course
  await courseService.enrollCourse('co-so-du-lieu', userId);

  // Helper to answer and pass a checkpoint
  async function passCheckpoint(maMoc) {
    const questions = await db.query(
      'SELECT * FROM cau_hoi WHERE ma_moc = $1 ORDER BY ma_cau_hoi ASC',
      [maMoc]
    );
    const answers = questions.map(q => {
      if (q.loai_cau_hoi === 'NOI_CAP') {
        const parsed = JSON.parse(q.du_lieu_cau_hoi || '{}');
        return { ma_cau_hoi: q.ma_cau_hoi, matched_pairs: parsed.pairs || [] };
      } else if (q.loai_cau_hoi === 'DIEN_TU') {
        const parsed = JSON.parse(q.du_lieu_cau_hoi || '{}');
        return { ma_cau_hoi: q.ma_cau_hoi, selected_word: parsed.blank_answer };
      } else if (q.loai_cau_hoi === 'SAP_XEP_CAU') {
        const parsed = JSON.parse(q.du_lieu_cau_hoi || '{}');
        return { ma_cau_hoi: q.ma_cau_hoi, ordered_words: parsed.correct_order || [] };
      } else {
        return { ma_cau_hoi: q.ma_cau_hoi, chi_muc_chon: q.vi_tri_dap_an_dung };
      }
    });

    const res = await courseService.submitQuizCheckpoint(maMoc, answers, userId);
    return res;
  }

  // Check initial state: only moc_csdl_01_01 is DA_MO
  let details = await courseService.getCourseDetails('co-so-du-lieu', userId);
  let ch1 = details.cac_chuong[0];
  assert.strictEqual(ch1.cac_moc.length, 5, 'Chapter 1 must have exactly 5 checkpoints');
  assert.strictEqual(ch1.cac_moc[0].trang_thai, 'DA_MO', 'Mốc 1.1 must be DA_MO initially');
  assert.strictEqual(ch1.cac_moc[1].trang_thai, 'KHOA', 'Mốc 1.2 must be KHOA initially');

  // Complete Mốc 1.1 -> must unlock Mốc 1.2
  const r1 = await passCheckpoint('moc_csdl_01_01');
  assert.strictEqual(r1.moc_ke_tiep_mo_khoa, 'moc_csdl_01_02', 'Hoàn thành 1.1 phải mở khóa 1.2');
  console.log('   ✓ Mốc 1.1 hoàn thành -> Mở khóa:', r1.moc_ke_tiep_mo_khoa);

  // Complete Mốc 1.2 -> must unlock Mốc 1.3
  const r2 = await passCheckpoint('moc_csdl_01_02');
  assert.strictEqual(r2.moc_ke_tiep_mo_khoa, 'moc_csdl_01_03', 'Hoàn thành 1.2 phải mở khóa 1.3');
  console.log('   ✓ Mốc 1.2 hoàn thành -> Mở khóa:', r2.moc_ke_tiep_mo_khoa);

  // Complete Mốc 1.3 -> must unlock Mốc 1.4
  const r3 = await passCheckpoint('moc_csdl_01_03');
  assert.strictEqual(r3.moc_ke_tiep_mo_khoa, 'moc_csdl_01_04', 'Hoàn thành 1.3 phải mở khóa 1.4');
  console.log('   ✓ Mốc 1.3 hoàn thành -> Mở khóa:', r3.moc_ke_tiep_mo_khoa);

  // Complete Mốc 1.4 -> must unlock Mốc 1.5
  const r4 = await passCheckpoint('moc_csdl_01_04');
  assert.strictEqual(r4.moc_ke_tiep_mo_khoa, 'moc_csdl_01_05', 'Hoàn thành 1.4 phải mở khóa 1.5');
  console.log('   ✓ Mốc 1.4 hoàn thành -> Mở khóa:', r4.moc_ke_tiep_mo_khoa);

  // Complete Mốc 1.5 (Boss Chương 1) -> must unlock Mốc 2.1 (Chương 2)!
  const r5 = await passCheckpoint('moc_csdl_01_05');
  assert.strictEqual(r5.moc_ke_tiep_mo_khoa, 'moc_csdl_02_01', 'Hoàn thành 1.5 phải mở khóa 2.1 của Chương 2');
  console.log('   ✓ Mốc 1.5 hoàn thành -> Mở khóa:', r5.moc_ke_tiep_mo_khoa);

  // Cleanup
  await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1', [userId]);

  console.log('🎉 100% TOÀN BỘ TIẾN TRÌNH 5 MỐC CHƯƠNG 1 -> CHƯƠNG 2 CHUẨN XÁC!');
}

testFull5LevelsProgression()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Test progression error:', err);
    process.exit(1);
  });
