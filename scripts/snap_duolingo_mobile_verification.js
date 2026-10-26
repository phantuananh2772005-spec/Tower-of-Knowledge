const puppeteer = require('puppeteer-core');
const path = require('path');

async function verifyMobileUX() {
  // 1. Authenticate via API to get genuine token
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ten_dang_nhap: 'admin', mat_khau: 'Admin123@' })
  });
  const authData = await loginRes.json();
  if (!authData.success) {
    throw new Error('Failed to login via API: ' + JSON.stringify(authData));
  }
  const token = authData.data.token;
  const user = authData.data.user;

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactDir = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29');

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

    // Navigate and inject token
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await page.evaluate((tok, usr) => {
      localStorage.setItem('tok_token', tok);
      localStorage.setItem('tok_user', JSON.stringify(usr));
      currentUser = usr;
      // Close any modal overlays
      document.querySelectorAll('.fixed:not(#mobile-bottom-bar), [id^="modal-"]').forEach(m => {
        if (m.id !== 'modal-mobile-more') m.classList.add('hidden');
      });
      navTo('hub');
    }, token, user);
    await new Promise(r => setTimeout(r, 600));

    // 1. Snapshot Mobile Hub
    const snapHub = path.join(artifactDir, 'snap_duolingo_hub_mobile.png');
    await page.screenshot({ path: snapHub });
    console.log('✓ Snapshot 1 (Hub Mobile):', snapHub);

    // 2. Snapshot Mobile Bottom Sheet "Thêm"
    await page.evaluate(() => {
      openMobileMoreSheet();
    });
    await new Promise(r => setTimeout(r, 500));
    const snapSheet = path.join(artifactDir, 'snap_duolingo_bottom_sheet.png');
    await page.screenshot({ path: snapSheet });
    console.log('✓ Snapshot 2 (Bottom Sheet):', snapSheet);

    // 3. Snapshot Mobile Saga
    await page.evaluate(() => {
      closeMobileMoreSheet();
      navTo('saga');
    });
    await new Promise(r => setTimeout(r, 600));
    const snapSaga = path.join(artifactDir, 'snap_duolingo_saga_mobile.png');
    await page.screenshot({ path: snapSaga });
    console.log('✓ Snapshot 3 (Saga Mobile):', snapSaga);

    // 4. Start milestone lesson (Phase 1: Theory flashcards)
    await page.evaluate(async () => {
      await startMocLearning('moc_csdl_01_01');
    });
    await new Promise(r => setTimeout(r, 800));

    const snapTheory = path.join(artifactDir, 'snap_duolingo_play_theory.png');
    await page.screenshot({ path: snapTheory });
    console.log('✓ Snapshot 4 (Play Theory Flashcard):', snapTheory);

    // 5. Advance to Practice phase
    await page.evaluate(() => {
      startPracticePhase();
    });
    await new Promise(r => setTimeout(r, 800));

    const snapPractice = path.join(artifactDir, 'snap_duolingo_play_practice.png');
    await page.screenshot({ path: snapPractice });
    console.log('✓ Snapshot 5 (Play Practice NOI_CAP):', snapPractice);

    // Verify elements on mobile
    const checkState = await page.evaluate(() => {
      const sidebar = document.getElementById('app-sidebar');
      const topbar = document.getElementById('app-topbar');
      const mobileBar = document.getElementById('mobile-bottom-bar');
      const floatingHelp = document.getElementById('btn_floating_help_tour');
      const qBloomTag = document.getElementById('q-bloom-tag');
      const qCounter = document.getElementById('q-counter');
      const playHearts = document.getElementById('play-hearts-badge');
      const nextBtn = document.getElementById('btn-next-step');

      return {
        sidebarHidden: window.getComputedStyle(sidebar).display === 'none',
        topbarHidden: window.getComputedStyle(topbar).display === 'none',
        mobileBarHidden: window.getComputedStyle(mobileBar).display === 'none',
        floatingHelpHidden: window.getComputedStyle(floatingHelp).display === 'none',
        qBloomHidden: window.getComputedStyle(qBloomTag).display === 'none',
        qCounterHidden: window.getComputedStyle(qCounter).display === 'none',
        playHeartsVisible: playHearts && window.getComputedStyle(playHearts).display !== 'none',
        nextBtnFullWidth: nextBtn && nextBtn.classList.contains('w-full')
      };
    });

    console.log('Mobile Check State in Practice Focus Mode:');
    console.log(JSON.stringify(checkState, null, 2));

    if (!checkState.sidebarHidden || !checkState.topbarHidden || !checkState.mobileBarHidden || !checkState.floatingHelpHidden) {
      throw new Error('Focus mode failure: Navigation elements are not properly hidden during quiz!');
    }
    if (!checkState.qBloomHidden || !checkState.qCounterHidden) {
      throw new Error('Clutter failure: Debug Bloom chip or multi-line counter is still visible!');
    }
    console.log('🎉 ALL MOBILE UX CHECKS PASSED PERFECTLY!');
  } finally {
    await browser.close();
  }
}

verifyMobileUX().catch(err => {
  console.error('Mobile UX verification error:', err);
  process.exit(1);
});
