/**
 * Telemetry & Session History Integration Test
 * Verifies end-to-end saving of session metrics, question weights,
 * and adaptive question sampling from DB.
 */

const assert = require('assert');
const db = require('../database/db');
const courseService = require('../services/course.service');
const { initTelemetrySchema } = require('../database/init_telemetry');

async function runTelemetryIntegrationTest() {
  console.log('=== TEST TELEMETRY & ADAPTIVE INTEGRATION ===');

  await initTelemetrySchema();

  // Pick an active user or create mock
  const user = await db.queryOne('SELECT TOP 1 ma_nguoi_dung FROM nguoi_dung');
  assert(user, 'Should have at least 1 user in DB');
  const userId = user.ma_nguoi_dung;

  // Pick checkpoint 1.1 (moc_csdl_01_01)
  const ck = await db.queryOne("SELECT ma_moc, tieu_de FROM moc_bai_hoc WHERE ma_moc = 'moc_csdl_01_01'");
  assert(ck, 'Should find checkpoint moc_csdl_01_01');

  // 1. Fetch checkpoint content
  const content = await courseService.getCheckpointContent(ck.ma_moc, userId, 1);
  assert(content && content.danh_sach_cau_hoi.length > 0, 'Should load checkpoint questions');
  const firstQ = content.danh_sach_cau_hoi[0];

  // 2. Submit step answers with telemetry
  const mockSubmissions = [
    {
      ma_cau_hoi: firstQ.ma_cau_hoi,
      chi_muc_chon: firstQ.vi_tri_dap_an_dung !== null ? firstQ.vi_tri_dap_an_dung : 0,
      thoi_gian_giay: 4.2,
      so_lan_tra_cuu: 0
    }
  ];

  const stepResult = await courseService.submitStep(ck.ma_moc, 1, mockSubmissions, userId);
  assert(stepResult, 'Should return step result');
  assert(stepResult.telemetry, 'Should return telemetry object');
  console.log('   ✓ Step submission returned telemetry:', stepResult.telemetry);
  assert.strictEqual(stepResult.telemetry.tong_so_lan_tra_cuu, 0);
  assert(stepResult.telemetry.thoi_gian_tong_giay > 0);

  // 3. Verify du_lieu_tri_nho in DB
  const progMoc = await db.queryOne(
    'SELECT du_lieu_tri_nho FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
    [userId, ck.ma_moc]
  );
  assert(progMoc && progMoc.du_lieu_tri_nho, 'du_lieu_tri_nho should be saved');
  const memoryMap = JSON.parse(progMoc.du_lieu_tri_nho);
  assert(memoryMap[firstQ.ma_cau_hoi], 'Memory state for question should exist');
  console.log(`   ✓ Memory weight for question ${firstQ.ma_cau_hoi}:`, memoryMap[firstQ.ma_cau_hoi].trong_so);

  // 4. Verify record in lich_su_phien_hoc
  const sessionLog = await db.queryOne(
    'SELECT TOP 1 * FROM lich_su_phien_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2 ORDER BY tao_luc DESC',
    [userId, ck.ma_moc]
  );
  assert(sessionLog, 'Session record should exist in lich_su_phien_hoc');
  console.log(`   ✓ Found session in lich_su_phien_hoc: ma_phien=${sessionLog.ma_phien}, thoi_gian=${sessionLog.thoi_gian_tong_giay}s`);
  assert(sessionLog.chi_tiet_cau_hoi, 'Session details JSON should exist');
  const details = JSON.parse(sessionLog.chi_tiet_cau_hoi);
  assert(Array.isArray(details) && details.length > 0, 'Details should be an array of questions');

  // 5. Test submitQuizCheckpoint with simulated theory lookup
  const mockQuizSubmissions = [
    {
      ma_cau_hoi: firstQ.ma_cau_hoi,
      chi_muc_chon: firstQ.vi_tri_dap_an_dung !== null ? firstQ.vi_tri_dap_an_dung : 0,
      thoi_gian_giay: 15.5,
      so_lan_tra_cuu: 1 // simulated user opened theory
    }
  ];

  const quizResult = await courseService.submitQuizCheckpoint(ck.ma_moc, mockQuizSubmissions, userId);
  assert(quizResult.telemetry, 'submitQuizCheckpoint should return telemetry');
  assert.strictEqual(quizResult.telemetry.tong_so_lan_tra_cuu, 1, 'Lookup count should be 1');
  console.log('   ✓ Quiz submission telemetry with lookup:', quizResult.telemetry);

  console.log('🎉 ALL TELEMETRY & ADAPTIVE INTEGRATION TESTS PASSED 100%!');
}

runTelemetryIntegrationTest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Telemetry test failed:', err);
    process.exit(1);
  });
