const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const artifactDir = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29');

  // 1. Desktop Test: enter ranked, scroll down, click BXH, then scroll down in BXH
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 750 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));
    navTo('minigame');
    selectArenaMode('ranked');
  });
  await new Promise(r => setTimeout(r, 400));
  // User scrolls down in ranked lobby and clicks BXH
  await page.evaluate(() => {
    const sc = document.getElementById('app-main-scroll');
    if (sc) sc.scrollTop = 300;
    arenaTab('rank');
  });
  await new Promise(r => setTimeout(r, 600));

  // Take screenshot 1: at top of BXH
  const snap1 = path.join(artifactDir, 'snap_bxh_fixed_top.png');
  await page.screenshot({ path: snap1 });
  console.log('Saved snap1:', snap1);

  // User scrolls down in BXH
  await page.evaluate(() => {
    const sc = document.getElementById('app-main-scroll');
    if (sc) sc.scrollTop = 400;
  });
  await new Promise(r => setTimeout(r, 300));

  // Take screenshot 2: scrolled down in BXH (sticky header & topbar check)
  const snap2 = path.join(artifactDir, 'snap_bxh_fixed_scrolled.png');
  await page.screenshot({ path: snap2 });
  console.log('Saved snap2:', snap2);

  // Click back button to verify return to modes
  await page.evaluate(() => {
    const btn = document.getElementById('btn_ve_sanh_dau');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  const snap3 = path.join(artifactDir, 'snap_bxh_returned_lobby.png');
  await page.screenshot({ path: snap3 });
  console.log('Saved snap3:', snap3);

  // 2. Mobile Test (390px)
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await mobilePage.evaluate(() => {
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));
    navTo('minigame');
    arenaTab('rank');
  });
  await new Promise(r => setTimeout(r, 600));
  const snapMobile = path.join(artifactDir, 'snap_bxh_mobile_fixed.png');
  await mobilePage.screenshot({ path: snapMobile });
  console.log('Saved snapMobile:', snapMobile);

  await browser.close();
})();
