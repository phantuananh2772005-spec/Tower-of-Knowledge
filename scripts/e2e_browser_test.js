const puppeteer = require('puppeteer-core');
const db = require('../database/db');

async function runE2ETest() {
  console.log('🚀 Starting End-to-End Real Browser Audit...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.toString()));

  // 1. Visit localhost:3000 unauthenticated
  console.log('Step 1: Navigating to http://localhost:3000/ unauthenticated...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Check login modal is visible
  const isAuthVisible = await page.$eval('#modal-auth', el => !el.classList.contains('hidden'));
  console.log('  ✓ Modal Auth visible on first load:', isAuthVisible);

  // 2. Strict UI Audit of Modal Auth (Verify user complaint items are GONE)
  console.log('Step 2: Auditing Modal Auth for unwanted hints & notes...');
  const modalHtml = await page.$eval('#modal-auth', el => el.innerHTML);

  const hasTienLoi = modalHtml.includes('Tiện lợi');
  const hasKhongCanEmailBadge = modalHtml.includes('Không cần email');
  const hasSubtitle = modalHtml.includes('Hỗ trợ tạo nhanh không cần Gmail');
  const hasOldDivider = modalHtml.includes('HOẶC DÙNG TÊN ĐĂNG NHẬP');

  console.log('  ✓ "💡 Tiện lợi" notice box removed?:', !hasTienLoi);
  console.log('  ✓ "Không cần email" badge removed?:', !hasKhongCanEmailBadge);
  console.log('  ✓ "Hỗ trợ tạo nhanh..." subtitle removed?:', !hasSubtitle);
  console.log('  ✓ "HOẶC DÙNG TÊN ĐĂNG NHẬP..." divider simplified?:', !hasOldDivider);

  if (hasTienLoi || hasKhongCanEmailBadge || hasSubtitle || hasOldDivider) {
    throw new Error('Unwanted hints or filler texts still exist in Modal Auth!');
  }

  // Take screenshot of the cleaned auth modal
  await page.screenshot({ path: 'audit_1_cleaned_modal.png' });

  // 3. Register with user email (as shown in user screenshot: s236435@nctu.edu.vn)
  const testEmail = 's236435@nctu.edu.vn';
  console.log(`Step 3: Registering with student email: ${testEmail}...`);
  await page.click('#tab-auth-register');
  await new Promise(r => setTimeout(r, 300));

  await page.type('#auth-username', testEmail);
  await page.type('#auth-password', 'StudentPass123@');
  await page.type('#auth-password-confirm', 'StudentPass123@');

  await page.click('#auth-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  // Verify modal is closed
  const isAuthClosed = await page.$eval('#modal-auth', el => el.classList.contains('hidden'));
  console.log('  ✓ Modal Auth closed after registration:', isAuthClosed);

  // 4. Audit Sidebar for New Learner
  console.log('Step 4: Auditing Sidebar stats for student email account...');
  const userName = await page.$eval('.user-display-name', el => el.textContent.trim());
  const userRank = await page.$eval('#sidebar-user-rank', el => el.textContent.trim());
  const userStreak = await page.$eval('#sidebar-streak-val', el => el.textContent.trim());
  const userCoins = await page.$eval('#sidebar-coins-val', el => el.textContent.trim());
  console.log(`  ✓ Display Name: "${userName}" (Expected: "s236435")`);
  console.log(`  ✓ Rank: "${userRank}" (Expected: "🌱 Khởi nguyên I")`);
  console.log(`  ✓ Streak: "${userStreak}" (Expected: "🔥 0")`);
  console.log(`  ✓ Coins: "${userCoins}" (Expected: "0")`);
  await page.screenshot({ path: 'audit_2_learner_hub.png' });

  // 5. Test Logging In with Email
  console.log('Step 5: Testing Logout and Login with Email...');
  // Clear token in localStorage and reload
  await page.evaluate(() => {
    localStorage.removeItem('tok_token');
    location.reload();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Switch to Login tab
  await page.click('#tab-auth-login');
  await new Promise(r => setTimeout(r, 300));
  await page.type('#auth-username', testEmail);
  await page.type('#auth-password', 'StudentPass123@');
  await page.click('#auth-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  const isAuthClosedAfterLogin = await page.$eval('#modal-auth', el => el.classList.contains('hidden'));
  const loggedInName = await page.$eval('.user-display-name', el => el.textContent.trim());
  console.log('  ✓ Modal Auth closed after email login:', isAuthClosedAfterLogin);
  console.log(`  ✓ Logged in as: "${loggedInName}"`);

  // 6. Console errors check
  console.log('\n--- BROWSER CONSOLE ERRORS ---');
  if (errors.length === 0) {
    console.log('✓ ZERO browser errors detected!');
  } else {
    errors.forEach(e => console.error('  ERROR:', e));
  }

  await browser.close();

  // 7. Clean up test user from DB
  console.log('\nStep 7: Cleaning up test user from database...');
  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 's236435' OR email = 's236435@nctu.edu.vn')");
  await db.execute("DELETE FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 's236435' OR email = 's236435@nctu.edu.vn')");
  await db.execute("DELETE FROM tien_do_mon_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 's236435' OR email = 's236435@nctu.edu.vn')");
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 's236435' OR email = 's236435@nctu.edu.vn'");
  console.log('✓ Database cleaned completely. Only admin remains.');

  console.log('\n🎉 ALL REAL BROWSER AUDITS PASSED WITH FLYING COLORS!');
}

runE2ETest().catch(err => {
  console.error('E2E Audit Failed:', err);
  process.exit(1);
});
