const puppeteer = require('puppeteer-core');
const path = require('path');

async function testHubScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactDir = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29');

  // 1. Desktop 1200 x 800
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));
    navTo('hub');
  });
  await new Promise(r => setTimeout(r, 600));
  const snapDesktop = path.join(artifactDir, 'snap_hub_command_center_desktop.png');
  await page.screenshot({ path: snapDesktop });
  console.log('Saved snapDesktop:', snapDesktop);

  // 2. Mobile 390 x 844
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await mobilePage.evaluate(() => {
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));
    navTo('hub');
  });
  await new Promise(r => setTimeout(r, 600));
  const snapMobile = path.join(artifactDir, 'snap_hub_command_center_mobile.png');
  await mobilePage.screenshot({ path: snapMobile });
  console.log('Saved snapMobile:', snapMobile);

  // 3. Narrow Mobile 360 x 740
  const narrowPage = await browser.newPage();
  await narrowPage.setViewport({ width: 360, height: 740, isMobile: true, hasTouch: true });
  await narrowPage.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await narrowPage.evaluate(() => {
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));
    navTo('hub');
  });
  await new Promise(r => setTimeout(r, 600));
  const snapNarrow = path.join(artifactDir, 'snap_hub_command_center_narrow.png');
  await narrowPage.screenshot({ path: snapNarrow });
  console.log('Saved snapNarrow:', snapNarrow);

  await browser.close();
}

testHubScreenshots().catch(err => {
  console.error(err);
  process.exit(1);
});
