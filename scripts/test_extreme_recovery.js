const puppeteer = require('puppeteer-core');
const path = require('path');
const db = require('../database/db');
const authService = require('../services/auth.service');
const extremeService = require('../services/extreme.service');

(async () => {
  console.log('--- TESTING EXTREME SESSION RECOVERY & RESUME ---');
  const user = await db.queryOne("SELECT * FROM nguoi_dung WHERE ten_dang_nhap = 'test_extreme_runner'");
  const token = authService.generateToken(user);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await page.evaluate(({ t, u }) => {
    localStorage.setItem('tok_token', t);
    localStorage.setItem('tok_user', JSON.stringify(u));
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));
  }, { t: token, u: user });

  // 1. Start a match
  await page.evaluate(async () => {
    await startExtremeSurvival('mon_cds');
  });
  await new Promise(r => setTimeout(r, 800));

  // 2. Answer 2 questions correctly
  for (let i = 1; i <= 2; i++) {
    const curQ = await page.evaluate(() => ({
      id: extremeSession?.currentQuestion?.ma_cau_hoi,
      opts: extremeSession?.currentQuestion?.currentShuffledOptions || extremeSession?.currentQuestion?.dap_an || []
    }));
    const evalData = await extremeService.checkAnswer(curQ.id, 0);
    const correctText = (evalData.dap_an_dung_text || '').trim().toLowerCase();
    let correctBtnIdx = curQ.opts.findIndex(o => (o || '').trim().toLowerCase() === correctText);
    if (correctBtnIdx < 0) correctBtnIdx = 0;

    await page.evaluate((btnIdx) => {
      document.getElementById(`btn_extreme_opt_${btnIdx}`).click();
    }, correctBtnIdx);

    await page.waitForFunction((expected) => extremeSession && extremeSession.currentQuestionIndex === expected, { timeout: 4000 }, i + 1);
  }

  const preState = await page.evaluate(() => ({
    index: extremeSession.currentQuestionIndex,
    score: extremeSession.score,
    streak: extremeSession.streak,
    hasLocalStorage: Boolean(localStorage.getItem('tok_extreme_session'))
  }));
  console.log('Pre-reload state:', preState);
  if (!preState.hasLocalStorage) throw new Error('Session was not saved to localStorage!');

  // 3. Simulate page reload (F5 / browser close)
  console.log('Simulating page refresh (F5)...');
  await page.reload({ waitUntil: 'networkidle0' });

  // 4. Open setup modal and check resume box
  const resumeVisible = await page.evaluate(async () => {
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));
    await openExtremeSetupModal();
    const box = document.getElementById('extreme-resume-box');
    const desc = document.getElementById('extreme-resume-desc');
    return {
      visible: box && !box.classList.contains('hidden'),
      desc: desc ? desc.textContent : ''
    };
  });
  console.log('Resume Box in Setup Modal:', resumeVisible);
  if (!resumeVisible.visible) throw new Error('Resume box should be visible!');

  // 5. Click resume button
  const restoredState = await page.evaluate(() => {
    resumeExtremeSession();
    return {
      active: extremeSession.active,
      index: extremeSession.currentQuestionIndex,
      score: extremeSession.score,
      streak: extremeSession.streak,
      hp: extremeSession.hp
    };
  });
  console.log('Restored State after Resume:', restoredState);
  if (restoredState.index !== preState.index || restoredState.score !== preState.score) {
    throw new Error(`State mismatch: expected Q#${preState.index} score=${preState.score}, got Q#${restoredState.index} score=${restoredState.score}`);
  }

  console.log('🎉 SESSION RECOVERY & RESUME VERIFIED 100% PERFECTLY!');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('❌ RECOVERY TEST FAILED:', err);
  process.exit(1);
});
