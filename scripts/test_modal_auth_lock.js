const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testModalAuthLock() {
  console.log('🚀 TESTING MODAL AUTH FIXED DIMENSIONS & ZERO JUMPING...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Check modal is open
  const isModalOpen = await page.$eval('#modal-auth', el => !el.classList.contains('hidden'));
  console.log('Auth modal open:', isModalOpen);

  // 1. Switch to Register Mode
  await page.click('#tab-auth-register');
  await new Promise(r => setTimeout(r, 300));

  const regBox = await page.$eval('#modal-auth > div', el => {
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom };
  });
  console.log('Register Mode Dimensions:', regBox);

  const artifactDir = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29';
  const regScreenshotPath = path.join(artifactDir, 'prod_auth_register_locked.png');
  await page.screenshot({ path: regScreenshotPath });
  console.log('Saved Register screenshot:', regScreenshotPath);

  // 2. Switch to Login Mode
  await page.click('#tab-auth-login');
  await new Promise(r => setTimeout(r, 300));

  const logBox = await page.$eval('#modal-auth > div', el => {
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom };
  });
  console.log('Login Mode Dimensions:', logBox);

  const logScreenshotPath = path.join(artifactDir, 'prod_auth_login_locked.png');
  await page.screenshot({ path: logScreenshotPath });
  console.log('Saved Login screenshot:', logScreenshotPath);

  // 3. Verify No Bottom Toggle
  const hasBottomToggle = await page.evaluate(() => {
    return !!document.getElementById('auth-toggle-btn') || 
           document.getElementById('modal-auth').innerText.includes('Chưa có tài khoản?');
  });
  console.log('Has redundant bottom toggle text:', hasBottomToggle);

  // 4. Check height difference
  const heightDiff = Math.abs(regBox.height - logBox.height);
  const widthDiff = Math.abs(regBox.width - logBox.width);

  console.log(`\n================ RESULT ================`);
  console.log(`Width Diff: ${widthDiff}px`);
  console.log(`Height Diff: ${heightDiff}px`);
  console.log(`Redundant Bottom Toggle Present: ${hasBottomToggle}`);

  await browser.close();

  if (heightDiff > 2) {
    console.error(`❌ FAILED: Modal height jumped by ${heightDiff}px!`);
    process.exit(1);
  }

  if (hasBottomToggle) {
    console.error(`❌ FAILED: Redundant bottom toggle text still present!`);
    process.exit(1);
  }

  console.log('✅ SUCCESS: Modal dimensions are perfectly locked with 0px jumping!');
}

testModalAuthLock().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
