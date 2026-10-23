const extremeService = require('../services/extreme.service');
const adminService = require('../services/admin.service');
const assert = require('assert');

(async () => {
  console.log('--- 1. Testing CDS Extreme Start (All 174 Questions Fetched at Once) ---');
  const startCds = await extremeService.startSession('mon_cds', 'usr_bot_001');
  assert.strictEqual(startCds.ma_mon, 'mon_cds');
  assert.strictEqual(startCds.tong_so_cau_trong_kho, 174, 'Môn CĐS phải có 174 câu trong kho');
  assert.strictEqual(startCds.danh_sach_cau_hoi.length, 174, 'Phải tải trọn vẹn 174 câu về RAM');
  assert.strictEqual(startCds.questions.length, 174, 'Questions alias phải có đủ 174 câu');

  // Verify all 174 questions have unique ma_cau_hoi
  const uniqueCdsIds = new Set(startCds.danh_sach_cau_hoi.map(q => q.ma_cau_hoi));
  assert.strictEqual(uniqueCdsIds.size, 174, '174 câu hỏi CĐS phải hoàn toàn phân biệt không trùng lặp');
  console.log(`  ✓ Start CDS: 100% full pool of ${startCds.tong_so_cau_trong_kho} unique questions loaded into RAM at once`);

  console.log('--- 2. Testing CSDL Extreme Start (All 108 Questions Fetched at Once) ---');
  const startCsdl = await extremeService.startSession('mon_csdl', 'usr_bot_001');
  assert.strictEqual(startCsdl.ma_mon, 'mon_csdl');
  assert.strictEqual(startCsdl.tong_so_cau_trong_kho, 108, 'Môn CSDL phải có 108 câu trong kho');
  assert.strictEqual(startCsdl.danh_sach_cau_hoi.length, 108, 'Phải tải trọn vẹn 108 câu về RAM');
  const uniqueCsdlIds = new Set(startCsdl.danh_sach_cau_hoi.map(q => q.ma_cau_hoi));
  assert.strictEqual(uniqueCsdlIds.size, 108, '108 câu hỏi CSDL phải hoàn toàn phân biệt không trùng lặp');
  console.log(`  ✓ Start CSDL: 100% full pool of ${startCsdl.tong_so_cau_trong_kho} unique questions loaded into RAM at once`);

  console.log('--- 3. Testing Real-time Answer Check API ---');
  const firstQ = startCds.danh_sach_cau_hoi[0];
  const checkRes = await extremeService.checkAnswer(firstQ.ma_cau_hoi, 0);
  assert.ok(checkRes.hasOwnProperty('is_correct'));
  assert.ok(checkRes.hasOwnProperty('vi_tri_dap_an_dung'));
  console.log(`  ✓ Check answer for ${firstQ.ma_cau_hoi}: result=${checkRes.is_correct}, correctPos=${checkRes.vi_tri_dap_an_dung}`);

  console.log('--- 4. Testing Finish Session Logging & Rewards ---');
  const mockAnswered = startCds.danh_sach_cau_hoi.slice(0, 15).map((q, idx) => ({
    ma_cau_hoi: q.ma_cau_hoi,
    noi_dung: q.noi_dung,
    muc_bloom: q.muc_bloom,
    do_kho: q.do_kho,
    lua_chon: idx % 2 === 0 ? 0 : 1,
    la_dung: idx % 2 === 0,
    thoi_gian_giay: 5,
    giai_thich: 'Giải thích chi tiết'
  }));

  const fin = await extremeService.finishSession('usr_bot_001', {
    ma_mon: 'mon_cds',
    tong_so_cau_lam: 15,
    tong_so_cau_dung: 8,
    chuoi_dung_cao_nhat: 6,
    tong_diem: 1200,
    thoi_gian_giay: 150,
    vong_lap: 1,
    danh_sach_cau_hoi: mockAnswered
  });
  assert.strictEqual(fin.success, true);
  console.log(`  ✓ Extreme session persisted: coins=${fin.earnedCoins}, exp=${fin.earnedExp}`);

  console.log('--- 5. Testing Admin Activity Feed & Telemetry ---');
  const feed = await adminService.getLearningActivityFeed();
  assert.ok(feed.recent_activities.length > 0);
  const extremeActivity = feed.recent_activities.find(a => a.loai_phien === 'THI_DAU_CUC_HAN');
  assert.ok(extremeActivity, 'Admin feed must include THI_DAU_CUC_HAN session');
  assert.strictEqual(extremeActivity.ten_mon, 'Chuyển đổi số & Kinh tế số (Digital Transformation)');
  console.log(`  ✓ Admin feed shows extreme activity: ${extremeActivity.ten_mon}`);

  const stats = await adminService.getSystemStats();
  assert.ok(stats.tong_quan.tong_phien_cuc_han >= 1, 'KPI must count extreme sessions');
  console.log(`  ✓ Admin stats has tong_phien_cuc_han = ${stats.tong_quan.tong_phien_cuc_han}`);

  const userTel = await adminService.getLearnerDeepTelemetry('usr_bot_001');
  const userExtremeSess = userTel.sessions.find(s => s.loai_phien === 'THI_DAU_CUC_HAN');
  assert.ok(userExtremeSess, 'Learner deep telemetry must include extreme session');
  console.log(`  ✓ Learner deep telemetry shows extreme session: ${userExtremeSess.ten_mon} (${userExtremeSess.so_cau_dung}/${userExtremeSess.tong_so_cau} đúng)`);

  console.log('🎉 ALL EXTREME 1-TIME RAM CACHE & ADMIN VERIFICATIONS PASSED!');
  process.exit(0);
})();
