const assert = require('assert');
const authService = require('../services/auth.service');
const courseService = require('../services/course.service');
const db = require('../database/db');

async function runSteppingE2ETest() {
  console.log('--- Testing Complete Duolingo Stepping & Onboarding Journey ---');

  const testUsername = `user_step_${Date.now()}`;
  const testPassword = 'Password123@';

  // 1. Register brand new user
  const regResult = await authService.register({
    ten_dang_nhap: testUsername,
    mat_khau: testPassword,
    ten_hien_thi: `Học Viên Bước ${Date.now()}`
  });
  assert.ok(regResult && regResult.token, 'Đăng ký phải trả về token');
  const userId = regResult.nguoi_dung.ma_nguoi_dung;

  // 2. New user must have 0 enrolled courses
  const myCoursesInit = await courseService.listMyCourses(userId);
  assert.strictEqual(myCoursesInit.length, 0, 'Người dùng mới phải có 0 môn học');

  // 3. User views course details before enrolling (should NOT auto-enroll)
  const courseDetailsBefore = await courseService.getCourseDetails('co-so-du-lieu', userId);
  assert.strictEqual(courseDetailsBefore.mon_hoc.da_dang_ky, false, 'Chưa đăng ký thì da_dang_ky phải là false');

  const myCoursesAfterView = await courseService.listMyCourses(userId);
  assert.strictEqual(myCoursesAfterView.length, 0, 'Xem chi tiết môn học tuyệt đối không được tự động đăng ký');

  // 4. User explicitly clicks "➕ Đăng ký học ngay"
  const enrollResult = await courseService.enrollCourse('co-so-du-lieu', userId);
  assert.ok(enrollResult && enrollResult.success, 'Đăng ký môn học thành công');

  const myCoursesAfterEnroll = await courseService.listMyCourses(userId);
  assert.strictEqual(myCoursesAfterEnroll.length, 1, 'Sau khi đăng ký phải có 1 môn học duy nhất');

  // 5. Course details now show Mốc 1.1 is DA_MO, Step 1 active
  const courseDetailsEnrolled = await courseService.getCourseDetails('co-so-du-lieu', userId);
  assert.strictEqual(courseDetailsEnrolled.mon_hoc.da_dang_ky, true, 'da_dang_ky bây giờ phải là true');

  const ch1 = courseDetailsEnrolled.cac_chuong[0];
  const moc1 = ch1.cac_moc[0];
  assert.strictEqual(moc1.trang_thai, 'DA_MO', 'Mốc 1.1 phải ở trạng thái DA_MO');
  assert.strictEqual(moc1.buoc_hien_tai, 1, 'Mốc 1.1 phải bắt đầu ở Bước 1');
  assert.strictEqual(moc1.cac_buoc_hoan_thanh, '0/4', 'Mốc 1.1 phải bắt đầu với 0/4 bước');

  // 6. Fetch Checkpoint content for Step 1 (100% Nhớ)
  const step1Content = await courseService.getCheckpointContent(moc1.ma_moc, userId, 1);
  assert.ok(step1Content && step1Content.danh_sach_cau_hoi.length > 0, 'Bước 1 phải có câu hỏi');
  assert.strictEqual(step1Content.buoc_dang_hoc, 1, 'Đang học bước 1');

  // Check question types in Step 1
  const typesInStep1 = step1Content.danh_sach_cau_hoi.map(q => q.loai_cau_hoi);
  console.log('   ✓ Question types present in Step 1:', [...new Set(typesInStep1)].join(', '));

  // 7. Complete Step 1: submit correct answers
  // To simulate correct answers, we fetch the actual questions from DB to get the answers
  const dbQuestions = await db.query(
    'SELECT * FROM cau_hoi WHERE ma_moc = $1 AND buoc_luyen_tap = 1 ORDER BY ma_cau_hoi ASC',
    [moc1.ma_moc]
  );

  const submissions = dbQuestions.map(q => {
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

  const submitResult = await courseService.submitStep(moc1.ma_moc, 1, submissions, userId);
  assert.strictEqual(submitResult.isPassed, true, 'Nộp bài bước 1 phải đạt');
  assert.strictEqual(submitResult.scorePercentage, 100, 'Điểm số phải là 100%');
  assert.strictEqual(submitResult.buoc_ke_tiep, 2, 'Bước tiếp theo phải là Bước 2');

  // 8. Verify DB progress updated to Step 2 (1/4 bước)
  const progAfterStep1 = await db.queryOne(
    'SELECT buoc_hien_tai, cac_buoc_hoan_thanh FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
    [userId, moc1.ma_moc]
  );
  assert.strictEqual(progAfterStep1.buoc_hien_tai, 2, 'DB buoc_hien_tai phải lên 2');
  assert.strictEqual(progAfterStep1.cac_buoc_hoan_thanh, '1/4', 'DB cac_buoc_hoan_thanh phải là 1/4');

  // Cleanup test user
  await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1', [userId]);

  console.log('   ✓ Complete Stepping & Onboarding Journey verified successfully with 100% precision!');
}

runSteppingE2ETest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Stepping test failed:', err);
    process.exit(1);
  });
