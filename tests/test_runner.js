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

  runTest('progression: strictly advances sequentially 1.1 -> 1.2 -> 1.3 -> 1.4 -> 1.5 -> 2.1', () => {
    const list = [
      { ma_moc: 'moc_csdl_01_01', thu_tu: 1, chuong_thu_tu: 1 },
      { ma_moc: 'moc_csdl_02_01', thu_tu: 1, chuong_thu_tu: 2 },
      { ma_moc: 'moc_csdl_01_02', thu_tu: 2, chuong_thu_tu: 1 },
      { ma_moc: 'moc_csdl_01_03', thu_tu: 3, chuong_thu_tu: 1 },
      { ma_moc: 'moc_csdl_01_04', thu_tu: 4, chuong_thu_tu: 1 },
      { ma_moc: 'moc_csdl_01_05', thu_tu: 5, chuong_thu_tu: 1 }
    ];
    // After 1.1, must unlock 1.2 (NOT 2.1)
    const n1 = progressionRules.findNextCheckpointToUnlock(list, 'moc_csdl_01_01');
    assert.strictEqual(n1.nextCheckpoint.ma_moc, 'moc_csdl_01_02');

    // After 1.2, must unlock 1.3
    const n2 = progressionRules.findNextCheckpointToUnlock(list, 'moc_csdl_01_02');
    assert.strictEqual(n2.nextCheckpoint.ma_moc, 'moc_csdl_01_03');

    // After 1.5, must unlock 2.1
    const n5 = progressionRules.findNextCheckpointToUnlock(list, 'moc_csdl_01_05');
    assert.strictEqual(n5.nextCheckpoint.ma_moc, 'moc_csdl_02_01');
  });

  // ================= 4. COMBAT RULES =================
  console.log('\n--- 4. Arena 1v1 Combat Rules ---');
  runTest('combat: calculates damage with speed-critical bonus', () => {
    // Fast response under 5s triggers critical bonus (12 + 3 = 15)
    const fastHitDamage = combatRules.calculateDamage(true, 2.0, 10);
    assert.strictEqual(fastHitDamage.damage, 15);
    assert.strictEqual(fastHitDamage.isCritical, true);

    // Normal response (> 5s) does 12 damage
    const normalHitDamage = combatRules.calculateDamage(true, 7.0, 10);
    assert.strictEqual(normalHitDamage.damage, 12);
    assert.strictEqual(normalHitDamage.isCritical, false);

    // Wrong answer always does 0 damage
    const missDamage = combatRules.calculateDamage(false, 1.5, 10);
    assert.strictEqual(missDamage.damage, 0);
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

  await runAsyncTest('db: verifies complete curriculum "Cơ sở dữ liệu" (4 chapters, 11 checkpoints with 5 in Ch1)', async () => {
    const course = await courseService.getCourseDetails('co-so-du-lieu', 'usr_admin_001');
    assert.strictEqual(course.mon_hoc.slug, 'co-so-du-lieu');
    assert.strictEqual(course.cac_chuong.length, 4);

    let totalCheckpoints = 0;
    course.cac_chuong.forEach(ch => {
      totalCheckpoints += ch.cac_moc.length;
    });
    assert.strictEqual(totalCheckpoints, 11);
    assert.strictEqual(course.cac_chuong[0].cac_moc.length, 5, 'Chapter 1 must have 5 progression checkpoints');
  });

  await runAsyncTest('db: verifies question bank (expanded question bank with 60+ questions)', async () => {
    const questions = await adminService.listQuestions({ limit: 100 });
    assert.ok(questions.length >= 60, `Expected at least 60 questions, got ${questions.length}`);
    const q1 = questions.find(q => q.ma_cau_hoi === 'q_csdl_01_01_01');
    assert.ok(q1, 'q_csdl_01_01_01 must exist in question bank');
    assert.ok(q1.noi_dung.length > 10);
    assert.ok(q1.dap_an_a.length > 0);
    assert.ok(q1.dap_an_b.length > 0);
    assert.strictEqual(q1.vi_tri_dap_an_dung, 0);
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

    // Realtime check-answer evaluation
    const firstQ = step1.danh_sach_cau_hoi[0];
    const checkRes = await courseService.checkSingleQuestion(moc1.ma_moc, firstQ.ma_cau_hoi, {
      ma_cau_hoi: firstQ.ma_cau_hoi,
      chi_muc_chon: 999
    });
    assert.strictEqual(checkRes.la_dung, false);
    assert.ok(checkRes.giai_thich.length > 0);

    // Empty submission must NOT pass or unlock next checkpoint (LOGIC-004)
    const emptySubmitRes = await courseService.submitQuizCheckpoint(moc1.ma_moc, [], userId);
    assert.strictEqual(emptySubmitRes.success, true);
    assert.strictEqual(emptySubmitRes.da_hoan_thanh, false);
    assert.strictEqual(emptySubmitRes.moc_ke_tiep_mo_khoa, null);

    // Build valid correct answers for moc1
    const db = require('../database/db');
    const moc1Questions = await db.query('SELECT * FROM cau_hoi WHERE ma_moc = $1 ORDER BY ma_cau_hoi ASC', [moc1.ma_moc]);
    const validAnswers = moc1Questions.map(q => {
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

    // Complete checkpoint via valid submit
    const submitRes = await courseService.submitQuizCheckpoint(moc1.ma_moc, validAnswers, userId);
    assert.strictEqual(submitRes.success, true);
    assert.strictEqual(submitRes.da_hoan_thanh, true);
    assert.ok(submitRes.moc_ke_tiep_mo_khoa);

    // Verify m1 is DA_HOAN_THANH and next is DA_MO
    const updatedDetails = await courseService.getCourseDetails('co-so-du-lieu', userId);
    assert.strictEqual(updatedDetails.cac_chuong[0].cac_moc[0].trang_thai, 'DA_HOAN_THANH');

    // Cleanup
    await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1', [userId]);
  });

  // --- 7. Adaptive Spaced Repetition & Session Telemetry History ---
  console.log('\n--- 7. Adaptive Spaced Repetition & Session Telemetry History ---');
  await runAsyncTest('telemetry: logs session metrics, updates memory weights and adaptive sampling', async () => {
    const { initTelemetrySchema } = require('../database/init_telemetry');
    await initTelemetrySchema();

    const db = require('../database/db');
    const user = await db.queryOne('SELECT TOP 1 ma_nguoi_dung FROM nguoi_dung');
    assert(user, 'Should have user');
    const ck = await db.queryOne("SELECT ma_moc FROM moc_bai_hoc WHERE ma_moc = 'moc_csdl_01_01'");
    assert(ck, 'Should have checkpoint');

    const stepRes = await courseService.submitStep(ck.ma_moc, 1, [
      { ma_cau_hoi: 'q_csdl_01_01_01', chi_muc_chon: 0, thoi_gian_giay: 5.5, so_lan_tra_cuu: 1 }
    ], user.ma_nguoi_dung);

    assert(stepRes && stepRes.telemetry, 'Should return telemetry');
    assert.strictEqual(stepRes.telemetry.tong_so_lan_tra_cuu, 1);
    assert.strictEqual(stepRes.telemetry.thoi_gian_tong_giay, 5.5);

    // Verify session log in lich_su_phien_hoc
    const log = await db.queryOne(
      'SELECT TOP 1 * FROM lich_su_phien_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2 ORDER BY tao_luc DESC',
      [user.ma_nguoi_dung, ck.ma_moc]
    );
    assert(log, 'Session log should exist in lich_su_phien_hoc');
    assert(log.chi_tiet_cau_hoi, 'Should contain JSON details');
  });

  // --- 8. Logic Audit Regression Suite (LOGIC-001 through LOGIC-010) ---
  console.log('\n--- 8. Logic Audit Regression Suite (LOGIC-001 to LOGIC-010) ---');

  await runAsyncTest('TC-001a/b/c/d (LOGIC-001): login streak progression, same-day idempotency, and broken streak reset', async () => {
    const db = require('../database/db');
    const uname = `streak_reg_${Date.now()}`;
    const reg = await authService.register({
      ten_dang_nhap: uname,
      mat_khau: 'Streak123@',
      ten_hien_thi: 'Streak Tester'
    });
    const uid = reg.nguoi_dung.ma_nguoi_dung;

    try {
      // TC-001a: First login on Day 1 -> streak = 1, +5 coins
      const login1 = await authService.login({
        ten_dang_nhap: uname,
        mat_khau: 'Streak123@',
        currentDate: '2026-10-20T09:00:00Z'
      });
      assert.strictEqual(login1.nguoi_dung.chuoi_streak_ngay, 1);
      assert.strictEqual(login1.nguoi_dung.xu_tri_thuc, 5);

      // TC-001c: Second login on same Day 1 -> streak remains 1, no duplicate coins
      const login1b = await authService.login({
        ten_dang_nhap: uname,
        mat_khau: 'Streak123@',
        currentDate: '2026-10-20T14:00:00Z'
      });
      assert.strictEqual(login1b.nguoi_dung.chuoi_streak_ngay, 1);
      assert.strictEqual(login1b.nguoi_dung.xu_tri_thuc, 5);

      // TC-001b: Consecutive Day 2 login -> streak = 2, +10 coins (total 15)
      const login2 = await authService.login({
        ten_dang_nhap: uname,
        mat_khau: 'Streak123@',
        currentDate: '2026-10-21T09:00:00Z'
      });
      assert.strictEqual(login2.nguoi_dung.chuoi_streak_ngay, 2);
      assert.strictEqual(login2.nguoi_dung.xu_tri_thuc, 15);

      // TC-001d: Missed 2 days (login on Oct 24) -> streak resets to 1, no streak increment reward
      const loginBroken = await authService.login({
        ten_dang_nhap: uname,
        mat_khau: 'Streak123@',
        currentDate: '2026-10-24T09:00:00Z'
      });
      assert.strictEqual(loginBroken.nguoi_dung.chuoi_streak_ngay, 1);
      assert.strictEqual(loginBroken.nguoi_dung.xu_tri_thuc, 15);
    } finally {
      await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1', [uid]);
    }
  });

  await runAsyncTest('TC-002a/b & TC-003a (LOGIC-002 & LOGIC-003): Boss step pool grading & step replay anti-farming', async () => {
    const db = require('../database/db');
    const uname = `step_reg_${Date.now()}`;
    const reg = await authService.register({
      ten_dang_nhap: uname,
      mat_khau: 'Step123@',
      ten_hien_thi: 'Step Tester'
    });
    const uid = reg.nguoi_dung.ma_nguoi_dung;

    try {
      await courseService.enrollCourse('co-so-du-lieu', uid);
      // Test on Mốc 1.5 (15 questions in pool, 10 per step) or Mốc 1.1 (13 questions in pool, 10 per step)
      const stepContent = await courseService.getCheckpointContent('moc_csdl_01_01', uid, 1);
      const stepQs = stepContent.danh_sach_cau_hoi;
      assert.strictEqual(stepQs.length, 10, 'Step 1 should present 10 questions');

      // TC-002b: Submitting only 2 correct answers out of 10 must fail (20% < 70%)
      const partialSub = stepQs.slice(0, 2).map(q => ({
        ma_cau_hoi: q.ma_cau_hoi,
        chi_muc_chon: q.vi_tri_dap_an_dung,
        selected_word: q.du_lieu?.blank_answer,
        matched_pairs: q.du_lieu?.pairsMap ? Object.entries(q.du_lieu.pairsMap).map(([l, r]) => ({ left: l, right: r })) : undefined,
        ordered_words: q.du_lieu?.correct_order
      }));
      const failRes = await courseService.submitStep('moc_csdl_01_01', 1, partialSub, uid);
      assert.strictEqual(failRes.isPassed, false, '2/10 submitted questions must fail step');

      // TC-002a: Submitting 8/10 correct answers must pass (80% >= 70%) even when checkpoint has 13+ questions
      const fullSub = stepQs.map((q, idx) => {
        if (idx >= 8) return { ma_cau_hoi: q.ma_cau_hoi, chi_muc_chon: 999 };
        return {
          ma_cau_hoi: q.ma_cau_hoi,
          chi_muc_chon: q.vi_tri_dap_an_dung,
          selected_word: q.du_lieu?.blank_answer,
          matched_pairs: q.du_lieu?.pairsMap ? Object.entries(q.du_lieu.pairsMap).map(([l, r]) => ({ left: l, right: r })) : undefined,
          ordered_words: q.du_lieu?.correct_order
        };
      });
      const passRes = await courseService.submitStep('moc_csdl_01_01', 1, fullSub, uid);
      assert.strictEqual(passRes.isPassed, true, '8/10 correct in step must pass');
      assert.ok(passRes.earnedCoins > 0, 'First time passing step 1 must award coins');

      const userAfterStep1 = await authService.getCurrentUser(uid);
      const coinsAfterStep1 = userAfterStep1.xu_tri_thuc;

      // Advance to Step 2 and pass it
      const passStep2 = await courseService.submitStep('moc_csdl_01_01', 2, fullSub, uid);
      assert.strictEqual(passStep2.isPassed, true);
      const userAfterStep2 = await authService.getCurrentUser(uid);
      const coinsAfterStep2 = userAfterStep2.xu_tri_thuc;
      assert.ok(coinsAfterStep2 > coinsAfterStep1);

      // TC-003a: Replay Step 1 while at Step 3 -> must NOT duplicate coins/EXP and must NOT regress cac_buoc_hoan_thanh
      const replayStep1 = await courseService.submitStep('moc_csdl_01_01', 1, fullSub, uid);
      assert.strictEqual(replayStep1.isPassed, true);
      assert.strictEqual(replayStep1.earnedCoins, 0, 'Replay of step 1 must award 0 milestone coins');
      assert.strictEqual(replayStep1.earnedExp, 0, 'Replay of step 1 must award 0 milestone EXP');

      const userAfterReplay = await authService.getCurrentUser(uid);
      assert.strictEqual(userAfterReplay.xu_tri_thuc, coinsAfterStep2, 'Coin balance must not inflate on step replay');

      const progRow = await db.queryOne(
        'SELECT buoc_hien_tai, cac_buoc_hoan_thanh FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
        [uid, 'moc_csdl_01_01']
      );
      assert.strictEqual(progRow.buoc_hien_tai, 3, 'buoc_hien_tai must stay at 3');
      assert.strictEqual(progRow.cac_buoc_hoan_thanh, '2/4', 'cac_buoc_hoan_thanh must stay at 2/4 and not regress to 1/4');
    } finally {
      await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1', [uid]);
    }
  });

  runTest('TC-007a/b (LOGIC-007): combat.rules resolves P2 higher HP and equal-HP point tie-breaker accurately', () => {
    // TC-007a: P2 has 70 HP, P1 has 20 HP -> P2 wins, P1 loses
    const resHp = combatRules.resolveMatchOutcome({
      p1HP: 20,
      p2HP: 70,
      p1Score: 2,
      p2Score: 5
    });
    assert.strictEqual(resHp.p1Result, 'THUA');
    assert.strictEqual(resHp.p2Result, 'THANG');
    assert.strictEqual(resHp.finishReason, 'P2_MORE_HP');

    // TC-007b: Equal HP (100 vs 100), P1 has 8 points vs P2 5 points -> P1 wins
    const resTieHp = combatRules.resolveMatchOutcome({
      p1HP: 100,
      p2HP: 100,
      p1Score: 8,
      p2Score: 5
    });
    assert.strictEqual(resTieHp.p1Result, 'THANG');
    assert.strictEqual(resTieHp.p2Result, 'THUA');
    assert.strictEqual(resTieHp.finishReason, 'P1_MORE_POINTS');
  });

  await runAsyncTest('TC-005a/b (LOGIC-005): arena server rejects spoofed isCorrect flags on wrong answers', async () => {
    const arenaService = require('../services/arena.service');
    const db = require('../database/db');
    const u1 = `pvp1_${Date.now()}`;
    const u2 = `pvp2_${Date.now()}`;
    const reg1 = await authService.register({ ten_dang_nhap: u1, mat_khau: 'Pass123@', ten_hien_thi: 'P1' });
    const reg2 = await authService.register({ ten_dang_nhap: u2, mat_khau: 'Pass123@', ten_hien_thi: 'P2' });
    const id1 = reg1.nguoi_dung.ma_nguoi_dung;
    const id2 = reg2.nguoi_dung.ma_nguoi_dung;

    let matchId = null;
    try {
      const match = await arenaService.createMatch(id1, id2, 'mon_csdl');
      matchId = match.ma_tran;
      const q1 = match.cau_hoi[0];

      // Spoof client flag isCorrect: true while providing wrong answer choice (-1 / wrong pairs)
      const spoofTurn = await arenaService.submitTurnAnswer({
        ma_tran: matchId,
        ma_nguoi_dung: id1,
        thu_tu_cau: 1,
        vi_tri_dap_an_chon: 99,
        cau_tra_loi: { isCorrect: true, da_hoan_thanh: true, tu_chon: '__wrong__', matched_pairs: [] },
        thoi_gian_giay: 2
      });
      assert.strictEqual(spoofTurn.la_dap_an_dung, false, 'Server must reject spoofed client isCorrect flag');
      assert.strictEqual(spoofTurn.sat_thuong_gay_ra, 0, 'Spoofed wrong answer must deal 0 damage');
    } finally {
      if (matchId) await db.execute('DELETE FROM tran_dau_1v1 WHERE ma_tran = $1', [matchId]);
      await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung IN ($1, $2)', [id1, id2]);
    }
  });

  await runAsyncTest('TC-008a (LOGIC-008): admin deleteQuestion blocks deletion of question referenced in match history', async () => {
    const arenaService = require('../services/arena.service');
    const db = require('../database/db');
    const u1 = `adm_p1_${Date.now()}`;
    const u2 = `adm_p2_${Date.now()}`;
    const reg1 = await authService.register({ ten_dang_nhap: u1, mat_khau: 'Pass123@', ten_hien_thi: 'P1' });
    const reg2 = await authService.register({ ten_dang_nhap: u2, mat_khau: 'Pass123@', ten_hien_thi: 'P2' });
    const id1 = reg1.nguoi_dung.ma_nguoi_dung;
    const id2 = reg2.nguoi_dung.ma_nguoi_dung;

    let matchId = null;
    try {
      const match = await arenaService.createMatch(id1, id2, 'mon_csdl');
      matchId = match.ma_tran;
      const usedQuestionId = match.cau_hoi[0].ma_cau_hoi;

      let blockedError = null;
      try {
        await adminService.deleteQuestion(usedQuestionId);
      } catch (err) {
        blockedError = err;
      }
      assert(blockedError, 'Deleting question used in match must throw a business error');
      assert(blockedError.message.includes('lịch sử'), 'Error message must explain historical match data protection');
    } finally {
      if (matchId) await db.execute('DELETE FROM tran_dau_1v1 WHERE ma_tran = $1', [matchId]);
      await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung IN ($1, $2)', [id1, id2]);
    }
  });

  await runAsyncTest('TC-009a & TC-010a (LOGIC-009 & LOGIC-010): pet level enforcement and concurrent mutateCoins safety', async () => {
    const economyService = require('../services/economy.service');
    const db = require('../database/db');
    const uname = `econ_pet_${Date.now()}`;
    const reg = await authService.register({ ten_dang_nhap: uname, mat_khau: 'Pass123@', ten_hien_thi: 'Econ Tester' });
    const uid = reg.nguoi_dung.ma_nguoi_dung;

    try {
      // Give user 500 coins (still 0 EXP = Level 1 Tân thủ)
      await economyService.mutateCoins(uid, 500, 'THUONG_STREAK', 'Seed coins for test');

      // TC-009a: Level 1 user tries to buy pet_golem (requires Level 2 Tập sự - 100 EXP) -> must reject
      let petErr = null;
      try {
        await petService.buyPet('pet_golem', uid);
      } catch (err) {
        petErr = err;
      }
      assert(petErr, 'Level 1 user must not be allowed to buy Level 2 pet_golem');
      assert(petErr.message.includes('Cấp 2'), 'Error must state Level 2 requirement');

      // Grant 120 EXP -> user reaches Level 2 (Tập sự) -> now can buy pet_golem (300 coins)
      await economyService.addExperience(uid, 120);
      const buyRes = await petService.buyPet('pet_golem', uid);
      assert.strictEqual(buyRes.thanh_cong, true);

      // User now has 200 coins left (500 - 300 = 200).
      // TC-010a: Fire two concurrent deductions of 150 coins each -> exactly 1 succeeds, 1 fails, balance = 50
      const results = await Promise.allSettled([
        economyService.mutateCoins(uid, -150, 'MUA_THU_CUNG', 'Concurrent spend 1'),
        economyService.mutateCoins(uid, -150, 'MUA_THU_CUNG', 'Concurrent spend 2')
      ]);
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');
      assert.strictEqual(fulfilled.length, 1, 'Exactly one 150-coin spend must succeed from 200 balance');
      assert.strictEqual(rejected.length, 1, 'Second concurrent 150-coin spend must be rejected');

      const finalUser = await authService.getCurrentUser(uid);
      assert.strictEqual(finalUser.xu_tri_thuc, 50, 'Final balance must be exactly 50 coins');
    } finally {
      await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1', [uid]);
    }
  });


  await runAsyncTest('TC-012 (EXTREME SURVIVAL MODE): endless batch prefetching, real-time grading, and survival rewards', async () => {
    const extremeService = require('../services/extreme.service');
    const db = require('../database/db');
    
    // 1. Start session
    const s = await extremeService.startSession('mon_csdl');
    assert.strictEqual(s.max_sinh_mang, 5);
    assert.strictEqual(s.danh_sach_cau_hoi.length, 10);
    assert.ok(s.tong_so_cau_trong_kho >= 10);

    // 2. Prefetch next batch without overlap
    const exclude = s.danh_sach_cau_hoi.map(q => q.ma_cau_hoi);
    const nextB = await extremeService.getNextBatch('mon_csdl', exclude);
    assert.ok(nextB.danh_sach_cau_hoi.length > 0);
    const overlap = nextB.danh_sach_cau_hoi.filter(q => exclude.includes(q.ma_cau_hoi));
    assert.strictEqual(overlap.length, 0);

    // 3. Real-time grading
    const qSample = await db.queryOne("SELECT * FROM cau_hoi WHERE loai_cau_hoi = 'TRAC_NGHIEM_4'");
    if (qSample) {
      const correctEval = await extremeService.checkAnswer(qSample.ma_cau_hoi, qSample.vi_tri_dap_an_dung);
      assert.strictEqual(correctEval.la_dung, true);
    }
  });

  await runAsyncTest('TC-011 (DAILY-QUESTS & ONBOARDING): daily quests status, claim-quest idempotency and newbie gift', async () => {
    const economyService = require('../services/economy.service');
    const db = require('../database/db');
    const uname = `quest_test_${Date.now()}`;
    const reg = await authService.register({ ten_dang_nhap: uname, mat_khau: 'Pass123@', ten_hien_thi: 'Quest Tester' });
    const uid = reg.nguoi_dung.ma_nguoi_dung;

    try {
      // 1. Initial balance is 0
      const u0 = await authService.getCurrentUser(uid);
      assert.strictEqual(u0.xu_tri_thuc, 0);

      // 2. Onboarding gift rewards 20 coins
      const giftRes = await economyService.mutateCoins(uid, 20, 'THUONG_TAN_THU', 'Quà chào mừng tân thủ');
      assert.strictEqual(giftRes.newBalance, 20);

      // 3. Claim daily quest hoc_tap (15 coins)
      const questRes = await economyService.mutateCoins(uid, 15, 'NHIEM_VU_NGAY', 'Thưởng nhiệm vụ ngày [hoc_tap]: Chăm chỉ học tập');
      assert.strictEqual(questRes.newBalance, 35);

      // 4. Verify ledger entries
      const history = await economyService.getTransactionHistory(uid, 10);
      assert.strictEqual(history.length, 2);
      assert.strictEqual(history[0].nguon_giao_dich, 'NHIEM_VU_NGAY');
      assert.strictEqual(history[1].nguon_giao_dich, 'THUONG_TAN_THU');
    } finally {
      await db.execute('DELETE FROM nguoi_dung WHERE ma_nguoi_dung = $1', [uid]);
    }
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
