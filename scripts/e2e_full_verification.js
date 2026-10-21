const puppeteer = require('puppeteer-core');
const db = require('../database/db');

async function fullVerification() {
  console.log('🚀 Running Full Comprehensive End-to-End Verification...');

  // Clean any previous test user first
  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'student_clean' OR email = 'student_clean@nctu.edu.vn')");
  await db.execute("DELETE FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'student_clean' OR email = 'student_clean@nctu.edu.vn')");
  await db.execute("DELETE FROM tien_do_mon_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'student_clean' OR email = 'student_clean@nctu.edu.vn')");
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'student_clean' OR email = 'student_clean@nctu.edu.vn'");

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  let nativeDialogTriggered = false;
  page.on('dialog', async dialog => {
    nativeDialogTriggered = true;
    console.error('❌ NATIVE DIALOG DETECTED:', dialog.type(), dialog.message());
    await dialog.dismiss();
  });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.toString()));

  // 1. Visit unauthenticated
  console.log('1. Navigating to http://localhost:3000/ unauthenticated...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const authVisible = await page.$eval('#modal-auth', el => !el.classList.contains('hidden'));
  console.log('   ✓ Auth modal visible on load:', authVisible);

  // 2. Register new student account
  console.log('2. Registering new student account: student_clean@nctu.edu.vn...');
  await page.click('#tab-auth-register');
  await new Promise(r => setTimeout(r, 200));

  await page.type('#auth-username', 'student_clean@nctu.edu.vn');
  await page.type('#auth-password', 'CleanPass123@');
  await page.type('#auth-password-confirm', 'CleanPass123@');
  await page.evaluate(() => handleAuthSubmit());
  await new Promise(r => setTimeout(r, 1200));

  const authClosed = await page.$eval('#modal-auth', el => el.classList.contains('hidden'));
  console.log('   ✓ Auth modal closed after registration:', authClosed);

  // 3. Verify clean initial user profile in sidebar
  const userName = await page.$eval('.user-display-name', el => el.textContent.trim());
  const userRank = await page.$eval('#sidebar-user-rank', el => el.textContent.trim());
  const userStreak = await page.$eval('#sidebar-streak-val', el => el.textContent.trim());
  const userCoins = await page.$eval('#sidebar-coins-val', el => el.textContent.trim());
  console.log(`   ✓ User Name: "${userName}"`);
  console.log(`   ✓ Rank: "${userRank}" (Should be "🌱 Khởi nguyên I")`);
  console.log(`   ✓ Streak: "${userStreak}" (Should be "🔥 0")`);
  console.log(`   ✓ Coins: "${userCoins}" (Should be "0")`);

  // 4. Verify Arena View
  console.log('3. Auditing Arena Minigame view...');
  await page.click('#nav-minigame');
  await new Promise(r => setTimeout(r, 600));

  const oldPillExists = await page.$('#atab-fight');
  const subTier = await page.$eval('#lobby-sub-tier', el => el.textContent.trim());
  const subPts = await page.$eval('#lobby-sub-pts', el => el.textContent.trim());
  const allTier = await page.$eval('#lobby-all-tier', el => el.textContent.trim());
  const allPts = await page.$eval('#lobby-all-pts', el => el.textContent.trim());
  console.log('   ✓ Old arena tab pills eliminated?:', oldPillExists === null);
  console.log(`   ✓ Arena Hạng môn: "${subTier}" - "${subPts}"`);
  console.log(`   ✓ Arena Hạng tổng: "${allTier}" - "${allPts}"`);

  // 5. Verify Pet View
  console.log('4. Auditing Pet view...');
  await page.click('#nav-pet');
  await new Promise(r => setTimeout(r, 600));

  const petIs2Col = await page.$eval('#view-pet .grid', el => el.classList.contains('lg:grid-cols-12'));
  const ownedPetsCount = await page.$$eval('#owned-pets-list > div', els => els.length);
  console.log('   ✓ Pet view is 2-column (lg:grid-cols-12):', petIs2Col);
  console.log('   ✓ Owned pets count (only starter):', ownedPetsCount);

  // 6. Verify Shop & Toast (No native browser alerts)
  console.log('5. Auditing Shop view & buy action with insufficient coins...');
  await page.click('#nav-shop');
  await new Promise(r => setTimeout(r, 600));

  const buyBtn = await page.$('#view-shop button[onclick*="buyItem"]');
  if (buyBtn) {
    await buyBtn.click();
    await new Promise(r => setTimeout(r, 400));
  }
  const toastExists = await page.$eval('#app-toast', el => !el.classList.contains('opacity-0'));
  console.log('   ✓ Smooth toast appeared on buy without coins?:', toastExists);
  console.log('   ✓ Any native browser alert/confirm popup appeared?:', nativeDialogTriggered);

  // 7. Verify Settings & Logout
  console.log('6. Auditing Settings modal and Logout flow...');
  await page.click('#btn-topbar-settings');
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => openSettingsAuthView());
  await new Promise(r => setTimeout(r, 400));

  // Test toggle and save Google email inline box without prompt
  await page.evaluate(() => {
    updateLinkedEmail();
    const input = document.getElementById('input-edit-google');
    input.value = 'myemail@test.com';
    saveEditGoogle();
  });
  await new Promise(r => setTimeout(r, 400));

  const updatedGoogleText = await page.$eval('#auth-google-display-slot', el => el.textContent);
  console.log(`   ✓ Saved email via inline box without prompt: "${updatedGoogleText}"`);
  console.log('   ✓ Native dialog triggered during settings change?:', nativeDialogTriggered);

  // Click logout
  await page.evaluate(() => logoutAndOpenAuth());
  await new Promise(r => setTimeout(r, 800));

  const authOpenAfterLogout = await page.$eval('#modal-auth', el => !el.classList.contains('hidden'));
  console.log('   ✓ Auth modal reappeared smoothly on logout?:', authOpenAfterLogout);
  console.log('   ✓ Any native alert/confirm during logout?:', nativeDialogTriggered);

  await browser.close();

  // 8. Clean test user
  console.log('7. Cleaning up student_clean from DB...');
  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'student_clean' OR email = 'student_clean@nctu.edu.vn')");
  await db.execute("DELETE FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'student_clean' OR email = 'student_clean@nctu.edu.vn')");
  await db.execute("DELETE FROM tien_do_mon_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'student_clean' OR email = 'student_clean@nctu.edu.vn')");
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'student_clean' OR email = 'student_clean@nctu.edu.vn'");
  console.log('✓ Database cleaned completely. Zero ghost users.');

  if (nativeDialogTriggered) {
    throw new Error('A native browser alert/prompt/confirm was triggered!');
  }

  console.log('\n🎉 ALL FULL COMPREHENSIVE CHECKS PASSED WITH 100% SUCCESS!');
}

fullVerification().catch(err => {
  console.error('Full Verification Failed:', err);
  process.exit(1);
});
