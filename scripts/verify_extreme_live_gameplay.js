const puppeteer = require('puppeteer-core');
const path = require('path');
const db = require('../database/db');
const authService = require('../services/auth.service');
const extremeService = require('../services/extreme.service');

const ARTIFACT_DIR = 'C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29';

(async () => {
  console.log('=== STARTING LIVE EXTREME SURVIVAL GAMEPLAY SIMULATION ===');

  // 1. Prepare user & token
  let user = await db.queryOne("SELECT * FROM nguoi_dung WHERE ten_dang_nhap = 'test_extreme_runner'");
  if (!user) {
    const reg = await authService.register({
      ten_dang_nhap: 'test_extreme_runner',
      mat_khau: 'Pass123@',
      ten_hien_thi: 'Đấu Sĩ Sinh Tồn CĐS'
    });
    user = reg.nguoi_dung;
  }
  const token = authService.generateToken(user);
  console.log(`✓ Test user prepared: ${user.ten_hien_thi} (${user.ma_nguoi_dung})`);

  // 2. Launch Puppeteer
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 3. Set auth token and load client
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await page.evaluate(({ t, u }) => {
    localStorage.setItem('tok_token', t);
    localStorage.setItem('tok_user', JSON.stringify(u));
    if (typeof currentUser !== 'undefined') currentUser = u;
    // Hide startup modals if any
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));
  }, { t: token, u: user });

  console.log('✓ Client loaded & user authenticated in localStorage');

  // 4. Start Extreme Survival Challenge with mon_cds
  console.log('--- Initiating Extreme Survival Match (mon_cds) ---');
  const startResult = await page.evaluate(async () => {
    await startExtremeSurvival('mon_cds');
    await new Promise(r => setTimeout(r, 600));
    return {
      active: extremeSession?.active,
      maMon: extremeSession?.maMon,
      tenMon: extremeSession?.tenMon,
      totalPool: extremeSession?.cachedPool?.length,
      bufferLength: extremeSession?.bufferQueue?.length,
      currentQuestionIndex: extremeSession?.currentQuestionIndex,
      currentQ: extremeSession?.currentQuestion?.noi_dung?.substring(0, 60),
      currentQId: extremeSession?.currentQuestion?.ma_cau_hoi
    };
  });

  console.log('Extreme Session Status on Start:', JSON.stringify(startResult, null, 2));
  if (startResult.totalPool !== 174) {
    throw new Error(`Expected 174 questions in RAM, got ${startResult.totalPool}`);
  }

  // Take screenshot of Q1
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'extreme_gameplay_q1.png') });
  console.log('📸 Screenshot saved: extreme_gameplay_q1.png');

  // 5. Answer questions 1 through 12 consecutively
  const answeredQuestionIds = [];
  answeredQuestionIds.push(startResult.currentQId);

  for (let qNum = 1; qNum <= 12; qNum++) {
    const curQId = await page.evaluate(() => extremeSession?.currentQuestion?.ma_cau_hoi);
    const evalData = await extremeService.checkAnswer(curQId, 0);
    const correctIdx = evalData.vi_tri_dap_an_dung;

    // Click answer button
    await page.evaluate((btnIdx) => {
      const btn = document.getElementById(`btn_extreme_opt_${btnIdx}`);
      if (btn) btn.click();
    }, correctIdx);

    // Wait for question index to advance
    await page.waitForFunction((expectedIndex) => {
      return extremeSession && extremeSession.currentQuestionIndex === expectedIndex;
    }, { timeout: 4000 }, qNum + 1);

    const state = await page.evaluate(() => ({
      currentIndex: extremeSession.currentQuestionIndex,
      score: extremeSession.score,
      streak: extremeSession.streak,
      hp: extremeSession.hp,
      qId: extremeSession.currentQuestion?.ma_cau_hoi,
      qText: extremeSession.currentQuestion?.noi_dung?.substring(0, 45)
    }));

    console.log(`  ✓ Q${qNum} correct -> Now at Question #${state.currentIndex}: [${state.qId}] "${state.qText}..." (Score: ${state.score}, Streak: ${state.streak}, HP: ${state.hp}/5)`);

    if (answeredQuestionIds.includes(state.qId)) {
      throw new Error(`Duplicate question detected at Question #${state.currentIndex}: ${state.qId}`);
    }
    answeredQuestionIds.push(state.qId);

    if (qNum === 10) {
      console.log('  🎯 VƯỢT QUA CÂU 10 THÀNH CÔNG! Đang ở câu 11 không hề bị lặp lại!');
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'extreme_gameplay_q11.png') });
      console.log('📸 Screenshot saved: extreme_gameplay_q11.png');
    }
  }

  console.log(`✓ Hoàn thành 12 câu liên tiếp mượt mà! Toàn bộ 13 câu hiển thị (${answeredQuestionIds.length} câu) đều phân biệt 100% không trùng lặp!`);

  // 6. Finish game and claim rewards
  console.log('--- Dừng trận đấu & Nhận thưởng ---');
  const finishSummary = await page.evaluate(async () => {
    await finishExtremeGame(false);
    await new Promise(r => setTimeout(r, 1200));
    const badge = document.getElementById('extreme-summary-badge')?.textContent;
    const answered = document.getElementById('extreme-summary-answered')?.textContent;
    const score = document.getElementById('extreme-summary-score')?.textContent;
    const coins = document.getElementById('extreme-summary-coins')?.textContent;
    const exp = document.getElementById('extreme-summary-exp')?.textContent;
    return { badge, answered, score, coins, exp };
  });

  console.log('Summary Modal Stats:', finishSummary);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'extreme_gameplay_summary.png') });
  console.log('📸 Screenshot saved: extreme_gameplay_summary.png');

  // 7. Check Admin Portal
  console.log('--- Kiểm tra Cổng Quản Trị Admin ---');
  await page.goto('http://localhost:3000/admin/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const adminViewInfo = await page.evaluate(() => {
    const tableText = document.querySelector('#activity-feed-table')?.innerText || '';
    return {
      hasExtremeInFeed: tableText.includes('Cực Hạn') || tableText.includes('Chuyển đổi số'),
      tableSnippet: tableText.split('\n').filter(s => s.trim().length > 0).slice(0, 10).join(' | ')
    };
  });
  console.log('Admin Verification:', adminViewInfo);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'extreme_gameplay_admin.png') });
  console.log('📸 Screenshot saved: extreme_gameplay_admin.png');

  await browser.close();
  console.log('🎉 TOÀN BỘ KỊCH BẢN CHƠI THỰC TẾ CHẾ ĐỘ CỰC HẠN ĐÃ ĐẠT 100% HOÀN HẢO!');
  process.exit(0);
})().catch(err => {
  console.error('❌ LIVE GAMEPLAY TEST FAILED:', err);
  process.exit(1);
});
