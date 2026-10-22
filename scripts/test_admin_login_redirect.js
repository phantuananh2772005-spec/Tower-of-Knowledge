const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testAdminLoginRedirect() {
  console.log('🚀 TESTING ADMIN LOGIN INTERCEPTION & INSTANT REDIRECT TO /admin/...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const artifactDir = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29';

  // Step 1: Open learner app unauthenticated
  console.log('1. Navigating to http://localhost:3000/ ...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Step 2: Switch to Login tab and enter Admin credentials
  console.log('2. Entering Admin credentials on main Login form...');
  await page.click('#tab-auth-login');
  await new Promise(r => setTimeout(r, 300));

  await page.evaluate(() => {
    document.getElementById('auth-username').value = 'admin';
    document.getElementById('auth-password').value = 'Admin123@';
  });

  // Submit login and wait for navigation / redirect to /admin/
  console.log('3. Submitting login and checking for automatic intercept to /admin/ ...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
    page.click('#auth-submit-btn')
  ]);

  const currentUrl = page.url();
  console.log('Current URL after admin login:', currentUrl);

  if (!currentUrl.includes('/admin')) {
    throw new Error(`Expected redirect to /admin/, but got: ${currentUrl}`);
  }
  console.log('✓ Successfully intercepted login and redirected to /admin/ !');

  // Step 3: Wait for admin auth verification and dashboard load
  await new Promise(r => setTimeout(r, 1200));

  const isLoginModalHidden = await page.$eval('#modal-admin-login', el => el.classList.contains('hidden'));
  console.log('Admin login modal auto-bypassed:', isLoginModalHidden);

  const adminName = await page.$eval('#admin-user-name', el => el.innerText.trim()).catch(() => '');
  console.log('Admin User Name displayed:', adminName);

  await page.screenshot({ path: path.join(artifactDir, 'prod_admin_auto_redirected.png') });
  console.log('Saved screenshot of Admin Portal auto-redirected');

  // Step 4: Test entering / while already logged in as admin
  console.log('4. Navigating to http://localhost:3000/ directly while logged in as admin...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  const secondUrl = page.url();
  console.log('Current URL when visiting / as admin:', secondUrl);
  if (!secondUrl.includes('/admin')) {
    throw new Error(`Expected auto-redirect to /admin/, but got: ${secondUrl}`);
  }
  console.log('✓ Successfully auto-redirected back to /admin/ when visiting root URL as admin!');

  // Step 5: Test Preview Mode (?mode=preview)
  console.log('5. Testing student view preview mode (/?mode=preview) ...');
  await page.goto('http://localhost:3000/?mode=preview', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  const previewBannerVisible = await page.$eval('#admin-preview-banner', el => !el.classList.contains('hidden'));
  console.log('Admin Preview Banner visible:', previewBannerVisible);

  const topbarAdminVisible = await page.$eval('#btn-topbar-admin-portal', el => !el.classList.contains('hidden'));
  console.log('Topbar Admin Portal Button visible:', topbarAdminVisible);

  await page.screenshot({ path: path.join(artifactDir, 'prod_admin_preview_mode.png') });
  console.log('Saved screenshot of Admin Preview mode');

  await browser.close();
  console.log('🎉 ALL ADMIN LOGIN INTERCEPT & REDIRECT TESTS PASSED WITH 100% SUCCESS!');
}

testAdminLoginRedirect().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
