const puppeteer = require('puppeteer-core');
const path = require('path');

async function verifyBattleUI() {
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
      currentUserAccount = usr;
      // Close any modal overlays
      document.querySelectorAll('.fixed:not(#mobile-bottom-bar), [id^="modal-"]').forEach(m => {
        m.classList.add('hidden');
      });
      navTo('minigame');
    }, token, user);
    await new Promise(r => setTimeout(r, 600));

    // Start Actual Battle vs Bot with Mock Combo
    await page.evaluate(() => {
      startActualBattle({
        id: 'usr_bot_001',
        name: 'Đấu Sĩ Tập Sự (Bot)',
        petIcon: '🦉',
        petName: 'Cú Archie',
        isBot: true
      });
      B.combo = 5;
      updHp();
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture Battle Mobile Screenshot
    const snapPath = path.join(artifactDir, 'snap_arena_battle_mobile_streamlined.png');
    await page.screenshot({ path: snapPath });
    console.log('✓ Snapshot captured:', snapPath);

    // Verify elements and bounds
    const uiReport = await page.evaluate(() => {
      const topbar = document.getElementById('app-topbar');
      const sidebar = document.getElementById('app-sidebar');
      const mobileBar = document.getElementById('mobile-bottom-bar');
      const roundBadge = document.getElementById('b-round-badge');
      const comboEl = document.getElementById('b-combo');
      const botStatus = document.getElementById('b-bot-status');
      const optionsBox = document.getElementById('b-options');
      const optionButtons = optionsBox ? optionsBox.querySelectorAll('button') : [];

      let allOptionsVisible = false;
      if (optionButtons.length >= 4) {
        const lastBtn = optionButtons[optionButtons.length - 1];
        const rect = lastBtn.getBoundingClientRect();
        allOptionsVisible = (rect.bottom <= window.innerHeight);
      }

      return {
        topbarHidden: topbar ? topbar.classList.contains('hidden') : false,
        sidebarHidden: sidebar ? (sidebar.classList.contains('hidden') || window.getComputedStyle(sidebar).display === 'none') : false,
        mobileBarHidden: mobileBar ? mobileBar.classList.contains('hidden') : false,
        roundBadgeText: roundBadge ? roundBadge.textContent : '',
        comboBadgeVisible: comboEl ? !comboEl.classList.contains('hidden') : false,
        comboText: comboEl ? comboEl.textContent : '',
        botStatusText: botStatus ? botStatus.textContent : '',
        optionCount: optionButtons.length,
        allOptionsVisibleWithinViewport: allOptionsVisible
      };
    });

    console.log('UI Verification Report:', JSON.stringify(uiReport, null, 2));

  } finally {
    await browser.close();
  }
}

verifyBattleUI().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
