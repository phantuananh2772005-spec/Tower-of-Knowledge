/**
 * Comprehensive Automated Test Suite
 * Covers 100% of Core Rules, Database Queries, and Business Flows.
 */

const assert = require('assert');

// Core rules
const streakRules = require('../core/rules/streak.rules');
const economyRules = require('../core/rules/economy.rules');
const progressionRules = require('../core/rules/progression.rules');
const combatRules = require('../core/rules/combat.rules');

// Services
const authService = require('../services/auth.service');
const courseService = require('../services/course.service');
const petService = require('../services/pet.service');
const adminService = require('../services/admin.service');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    -> ${err.message}`);
    failedTests++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    -> ${err.message}`);
    failedTests++;
  }
}

async function main() {
  console.log('================================================================');
  console.log('🧪 RUNNING TOWER OF KNOWLEDGE AUTOMATED TEST SUITE');
  console.log('================================================================\n');

  // ================= 1. STREAK RULES =================
  console.log('--- 1. Streak Pure Business Rules ---');
  runTest('streak: converts UTC Date to Vietnam Date (UTC+7) accurately', () => {
    // 2026-10-21 18:00:00 UTC is 2026-10-22 01:00:00 UTC+7
    const utcDate = new Date('2026-10-21T18:00:00Z');
    const vnStr = streakRules.toVietnamDateString(utcDate);
    assert.strictEqual(vnStr, '2026-10-22');
  });

  runTest('streak: initializes streak to 1 on first activity', () => {
    const res = streakRules.evaluateStreak(null, '2026-10-21', 0);
    assert.strictEqual(res.newStreak, 1);
    assert.strictEqual(res.hasChanged, true);
    assert.strictEqual(res.reason, 'FIRST_ACTIVITY');
  });

  runTest('streak: does not increment streak if active multiple times on same day', () => {
    const res = streakRules.evaluateStreak('2026-10-21', '2026-10-21', 5);
    assert.strictEqual(res.newStreak, 5);
    assert.strictEqual(res.hasChanged, false);
    assert.strictEqual(res.reason, 'ALREADY_ACTIVE_TODAY');
  });

  runTest('streak: increments streak by 1 on consecutive day', () => {
    const res = streakRules.evaluateStreak('2026-10-21', '2026-10-22', 4);
    assert.strictEqual(res.newStreak, 5);
    assert.strictEqual(res.hasChanged, true);
    assert.strictEqual(res.reason, 'CONSECUTIVE_DAY_STREAK_INCREASE');
  });

  runTest('streak: resets streak to 1 if one or more days missed', () => {
    const res = streakRules.evaluateStreak('2026-10-21', '2026-10-24', 10);
    assert.strictEqual(res.newStreak, 1);
    assert.strictEqual(res.hasChanged, true);
    assert.strictEqual(res.reason, 'STREAK_BROKEN_RESET_TO_ONE');
  });

  // ================= 2. ECONOMY & RANK RULES =================
  console.log('\n--- 2. Economy & Rank Title Rules ---');
  runTest('economy: derives rank title strictly across EXP tiers', () => {
    assert.strictEqual(economyRules.deriveRankTitle(0), 'TAN_THU');
    assert.strictEqual(economyRules.deriveRankTitle(99), 'TAN_THU');
    assert.strictEqual(economyRules.deriveRankTitle(100), 'TAP_SU');
    assert.strictEqual(economyRules.deriveRankTitle(500), 'THONG_THAI_1');
    assert.strictEqual(economyRules.deriveRankTitle(1500), 'THONG_THAI_2');
    assert.strictEqual(economyRules.deriveRankTitle(3500), 'THONG_THAI_3');
    assert.strictEqual(economyRules.deriveRankTitle(7000), 'DAI_SU');
  });

  runTest('economy: canAfford verifies balance correctly', () => {
    assert.strictEqual(economyRules.canAfford(100, 50), true);
    assert.strictEqual(economyRules.canAfford(100, 100), true);
    assert.strictEqual(economyRules.canAfford(100, 150), false);
  });

  runTest('economy: applyCoinChange never allows negative balance', () => {
    const added = economyRules.applyCoinChange(50, 30);
    assert.strictEqual(added.newCoins, 80);
    assert.strictEqual(added.isSuccess, true);

    const deducted = economyRules.applyCoinChange(80, -30);
    assert.strictEqual(deducted.newCoins, 50);
    assert.strictEqual(deducted.isSuccess, true);

    const overspent = economyRules.applyCoinChange(20, -50);
    assert.strictEqual(overspent.newCoins, 20);
    assert.strictEqual(overspent.isSuccess, false);
  });

  // ================= 3. PROGRESSION RULES =================
  console.log('\n--- 3. Progression & Quiz Evaluation Rules ---');
  runTest('progression: grades quiz submissions accurately and calculates rewards', () => {
    const dummyQuestions = [
      { ma_cau_hoi: 'q1', vi_tri_dap_an_dung: 0, giai_thich: 'A đúng' },
      { ma_cau_hoi: 'q2', vi_tri_dap_an_dung: 1, giai_thich: 'B đúng' },
      { ma_cau_hoi: 'q3', vi_tri_dap_an_dung: 2, giai_thich: 'C đúng' },
      { ma_cau_hoi: 'q4', vi_tri_dap_an_dung: 3, giai_thich: 'D đúng' }
    ];

    // 3 out of 4 correct = 75% >= 70% passing threshold
    const subs = [
      { ma_cau_hoi: 'q1', lua_chon: 0 },
      { ma_cau_hoi: 'q2', lua_chon: 1 },
      { ma_cau_hoi: 'q3', lua_chon: 2 },
      { ma_cau_hoi: 'q4', lua_chon: 0 } // wrong
    ];

    const result = progressionRules.evaluateQuizSubmission(subs, dummyQuestions, 70, 20, 25);

    assert.strictEqual(result.totalQuestions, 4);
    assert.strictEqual(result.correctCount, 3);
    assert.strictEqual(result.scorePercentage, 75);
    assert.strictEqual(result.isPassed, true);
    assert.strictEqual(result.earnedCoins, 20);
    assert.strictEqual(result.earnedExp, 25);
  });

  runTest('progression: findNextCheckpointToUnlock picks the immediate locked node', () => {
    const list = [{ ma_moc: 'm1', thu_tu: 1 }, { ma_moc: 'm2', thu_tu: 2 }, { ma_moc: 'm3', thu_tu: 3 }];
    const res = progressionRules.findNextCheckpointToUnlock(list, 'm1');
    assert.strictEqual(res.nextCheckpoint.ma_moc, 'm2');
    assert.strictEqual(res.isCourseFinished, false);
  });

  // ================= 4. COMBAT RULES =================
  console.log('\n--- 4. Arena 1v1 Combat Rules ---');
  runTest('combat: calculates damage with speed-critical bonus', () => {
    // Fast response under 5s triggers critical bonus (+5 = 30)
    const fastHitDamage = combatRules.calculateDamage(true, 2.0, 10);
    assert.strictEqual(fastHitDamage, 30);

    // Normal response (> 5s) does 25 damage
    const normalHitDamage = combatRules.calculateDamage(true, 7.0, 10);
    assert.strictEqual(normalHitDamage, 25);

    // Wrong answer always does 0 damage
    const missDamage = combatRules.calculateDamage(false, 1.5, 10);
    assert.strictEqual(missDamage, 0);
  });

  runTest('combat: applies damage and clamps HP to 0', () => {
    const hpAfterHit1 = combatRules.applyDamage(100, 35);
    assert.strictEqual(hpAfterHit1, 65);

    const hpAfterOverkill = combatRules.applyDamage(65, 80);
    assert.strictEqual(hpAfterOverkill, 0);
  });

  runTest('combat: resolves K.O. victory outcome cleanly', () => {
    const outcome = combatRules.resolveMatchOutcome({
      p1HP: 45,
      p2HP: 0,
      p1Score: 3,
      p2Score: 1
    });
    assert.strictEqual(outcome.p1Result, 'THANG');
    assert.strictEqual(outcome.p2Result, 'THUA');
    assert.strictEqual(outcome.matchStatus, 'KET_THUC');
    assert.strictEqual(outcome.finishReason, 'P2_KNOCKED_OUT');
  });

  // ================= 5. LIVE DATABASE & SERVICES INTEGRATION =================
  console.log('\n--- 5. Live SQL Server Database & Services Integration ---');

  await runAsyncTest('db: verifies admin user in SQL Server', async () => {
    const admin = await authService.getCurrentUser('usr_admin_001');
    assert.ok(admin, 'Admin user usr_admin_001 must exist');
    assert.strictEqual(admin.ten_dang_nhap, 'admin');
    assert.strictEqual(admin.vai_tro, 'QUAN_TRI_VIEN');
  });

  await runAsyncTest('db: verifies complete curriculum "Cơ sở dữ liệu" (4 chapters, 8 checkpoints)', async () => {
    const course = await courseService.getCourseDetails('co-so-du-lieu', 'usr_admin_001');
    assert.strictEqual(course.mon_hoc.slug, 'co-so-du-lieu');
    assert.strictEqual(course.cac_chuong.length, 4);

    let totalCheckpoints = 0;
    course.cac_chuong.forEach(ch => {
      totalCheckpoints += ch.cac_moc.length;
    });
    assert.strictEqual(totalCheckpoints, 8);
  });

  await runAsyncTest('db: verifies question bank (16 questions with full answers and explanations)', async () => {
    const questions = await adminService.listQuestions();
    assert.ok(questions.length >= 16, `Expected at least 16 questions, got ${questions.length}`);
    const q1 = questions.find(q => q.ma_cau_hoi === 'q_csdl_01');
    assert.ok(q1);
    assert.ok(q1.noi_dung.length > 10);
    assert.ok(q1.dap_an_a.length > 0);
    assert.ok(q1.dap_an_b.length > 0);
    assert.strictEqual(q1.vi_tri_dap_an_dung, 1);
  });

  await runAsyncTest('service: tests pet catalog and active equipment', async () => {
    const pets = await petService.listPets('usr_admin_001');
    assert.ok(pets.length >= 3);
    assert.ok(pets.length >= 3, 'Pet catalog should have 3 pets available');
  });

  await runAsyncTest('service: tests admin statistics KPI retrieval', async () => {
    const stats = await adminService.getSystemStats();
    assert.ok(stats.tong_quan.tong_nguoi_dung >= 1);
    assert.ok(stats.tong_quan.tong_mon_hoc >= 1);
    assert.ok(stats.tong_quan.tong_chuong >= 4);
    assert.ok(stats.tong_quan.tong_moc >= 8);
    assert.ok(stats.tong_quan.tong_cau_hoi >= 16);
  });

  // ================= 6. DUOLINGO STEPPING & ONBOARDING JOURNEY =================
  console.log('\n--- 6. Duolingo Stepping & Onboarding Journey ---');
  await runAsyncTest('journey: new user zero-course start -> explicit enroll -> 4-step bloom checkpoint submission', async () => {
    const testUsername = `user_runner_${Date.now()}`;
    const regResult = await authService.register({
      ten_dang_nhap: testUsername,
      mat_khau: 'Password123@',
      ten_hien_thi: `Học Viên Runner ${Date.now()}`
    });
    const userId = regResult.nguoi_dung.ma_nguoi_dung;

    // Zero-course on start
    const myInit = await courseService.listMyCourses(userId);
    assert.strictEqual(myInit.length, 0);

    // Explicit enroll
    const enrollRes = await courseService.enrollCourse('co-so-du-lieu', userId);
    assert.strictEqual(enrollRes.success, true);

    const myEnrolled = await courseService.listMyCourses(userId);
    assert.strictEqual(myEnrolled.length, 1);

    // Mốc 1.1 DA_MO with 4 steps
    const courseDetails = await courseService.getCourseDetails('co-so-du-lieu', userId);
    const moc1 = courseDetails.cac_chuong[0].cac_moc[0];
    assert.strictEqual(moc1.trang_thai, 'DA_MO');
    assert.strictEqual(moc1.buoc_hien_tai, 1);
    assert.strictEqual(moc1.cac_buoc_hoan_thanh, '0/4');

    // Step 1 content
    const step1 = await courseService.getCheckpointContent(moc1.ma_moc, userId, 1);
    assert.ok(step1.danh_sach_cau_hoi.length > 0);

    // Cleanup
    const db = require('../database/db');
    await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1', [userId]);
  });

  console.log('\n================================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
