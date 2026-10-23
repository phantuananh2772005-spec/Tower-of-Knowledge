const puppeteer = require('puppeteer-core');
const path = require('path');

async function testCasualLobbyParty() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,800']
  });

  const artifactDir = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29');

  // 1. Desktop test (1200 x 750)
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 750 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));
    navTo('minigame');
    selectArenaMode('casual');
  });
  await new Promise(r => setTimeout(r, 500));

  const snap1 = path.join(artifactDir, 'snap_casual_lobby_desktop_fixed.png');
  await page.screenshot({ path: snap1 });
  console.log('Saved snap1:', snap1);

  // Invite bot / friend into lobby
  await page.evaluate(() => {
    if (typeof addBotToCasualParty === 'function') {
      addBotToCasualParty();
    }
  });
  await new Promise(r => setTimeout(r, 400));

  const snap2 = path.join(artifactDir, 'snap_casual_lobby_desktop_partner.png');
  await page.screenshot({ path: snap2 });
  console.log('Saved snap2:', snap2);

  // 2. Mobile view (390 x 844)
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await mobilePage.evaluate(() => {
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));
    navTo('minigame');
    selectArenaMode('casual');
  });
  await new Promise(r => setTimeout(r, 500));

  const snap3 = path.join(artifactDir, 'snap_casual_lobby_mobile.png');
  await mobilePage.screenshot({ path: snap3 });
  console.log('Saved snap3:', snap3);

  // Ranked mode test
  await page.evaluate(() => {
    selectArenaMode('ranked');
  });
  await new Promise(r => setTimeout(r, 400));
  const snap4 = path.join(artifactDir, 'snap_ranked_lobby_desktop.png');
  await page.screenshot({ path: snap4 });
  console.log('Saved snap4:', snap4);

  await browser.close();
}

testCasualLobbyParty().catch(err => {
  console.error(err);
  process.exit(1);
});
