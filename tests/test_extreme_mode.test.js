const assert = require('assert');
const extremeService = require('../services/extreme.service');
const db = require('../database/db');

async function runTests() {
  console.log('--- Extreme Survival Challenge (Thi Đấu Cực Hạn) Tests ---');

  // 1. Start Session Test
  console.log('Testing startSession...');
  const session = await extremeService.startSession('mon_csdl');
  assert.strictEqual(session.max_sinh_mang, 5, 'Must have 5 initial lives');
  assert.ok(session.tong_so_cau_trong_kho >= 10, 'Must have questions in pool');
  assert.strictEqual(session.danh_sach_cau_hoi.length, 10, 'Must deliver initial batch of 10 questions');
  console.log(`  ✓ startSession delivers 10 questions from total pool of ${session.tong_so_cau_trong_kho}`);

  // 2. Next Batch with Exclude IDs Test
  console.log('Testing getNextBatch with excludeIds...');
  const first10Ids = session.danh_sach_cau_hoi.map(q => q.ma_cau_hoi);
  const nextBatch = await extremeService.getNextBatch('mon_csdl', first10Ids);
  assert.ok(nextBatch.danh_sach_cau_hoi.length > 0, 'Must return next batch');
  const overlap = nextBatch.danh_sach_cau_hoi.filter(q => first10Ids.includes(q.ma_cau_hoi));
  assert.strictEqual(overlap.length, 0, 'Next batch must NOT contain any excluded IDs');
  console.log(`  ✓ getNextBatch returned ${nextBatch.danh_sach_cau_hoi.length} fresh questions with 0 overlap`);

  // 3. Real-time Answer Evaluation Test
  console.log('Testing checkAnswer...');
  const sampleQ = await db.queryOne("SELECT * FROM cau_hoi WHERE loai_cau_hoi = 'TRAC_NGHIEM_4'");
  if (sampleQ) {
    const correctRes = await extremeService.checkAnswer(sampleQ.ma_cau_hoi, sampleQ.vi_tri_dap_an_dung);
    assert.strictEqual(correctRes.la_dung, true, 'Correct answer must be evaluated as true');

    const wrongRes = await extremeService.checkAnswer(sampleQ.ma_cau_hoi, (Number(sampleQ.vi_tri_dap_an_dung) + 1) % 4);
    assert.strictEqual(wrongRes.la_dung, false, 'Wrong answer must be evaluated as false');
    console.log('  ✓ checkAnswer correctly verifies correct and wrong answers');
  }

  // 4. Finish Session & Rewards Test
  console.log('Testing finishSession...');
  const testUser = await db.queryOne("SELECT TOP 1 ma_nguoi_dung FROM nguoi_dung WHERE vai_tro = 'NGUOI_HOC'");
  if (testUser) {
    const finishRes = await extremeService.finishSession(testUser.ma_nguoi_dung, {
      ma_mon: 'mon_csdl',
      tong_so_cau_lam: 15,
      tong_so_cau_dung: 12,
      chuoi_dung_cao_nhat: 8,
      tong_diem: 1450,
      thoi_gian_giay: 90,
      vong_lap: 1
    });

    assert.strictEqual(finishRes.success, true);
    assert.ok(finishRes.earnedCoins > 0, 'Must earn coins for survival');
    assert.ok(finishRes.earnedExp > 0, 'Must earn exp for survival');
    assert.ok(finishRes.badgeTitle, 'Must award achievement badge title');
    console.log(`  ✓ finishSession successfully awarded +${finishRes.earnedCoins} coins, +${finishRes.earnedExp} EXP, Badge: "${finishRes.badgeTitle}"`);
  }

  console.log('✅ ALL EXTREME MODE BACKEND TESTS PASSED!\n');
}

if (require.main === module) {
  runTests().then(() => process.exit(0)).catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}

module.exports = { runTests };
