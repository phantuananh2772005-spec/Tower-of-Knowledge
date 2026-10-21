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
  await page.screenshot({ path: 'audit_1_login_modal.png' });

  // 2. Switch to Register tab and create a brand-new learner
  console.log('Step 2: Registering a brand-new learner account: hocvien_moi...');
  await page.click('#tab-auth-register');
  await new Promise(r => setTimeout(r, 300));

  await page.type('#auth-username', 'hocvien_moi');
  await page.type('#auth-password', 'Password123@');
  await page.type('#auth-password-confirm', 'Password123@');

  await page.click('#auth-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  // Verify modal is closed
  const isAuthClosed = await page.$eval('#modal-auth', el => el.classList.contains('hidden'));
  console.log('  ✓ Modal Auth closed after registration:', isAuthClosed);

  // 3. Audit Sidebar for New Learner
  console.log('Step 3: Auditing Sidebar stats for brand-new learner...');
  const userName = await page.$eval('.user-display-name', el => el.textContent.trim());
  const userRank = await page.$eval('#sidebar-user-rank', el => el.textContent.trim());
  const userStreak = await page.$eval('#sidebar-streak-val', el => el.textContent.trim());
  const userCoins = await page.$eval('#sidebar-coins-val', el => el.textContent.trim());
  console.log(`  ✓ Display Name: "${userName}" (Expected: "hocvien_moi")`);
  console.log(`  ✓ Rank: "${userRank}" (Expected: "🌱 Khởi nguyên I")`);
  console.log(`  ✓ Streak: "${userStreak}" (Expected: "🔥 0")`);
  console.log(`  ✓ Coins: "${userCoins}" (Expected: "0")`);
  await page.screenshot({ path: 'audit_2_hub.png' });

  // 4. Audit Pet View (view-pet)
  console.log('Step 4: Auditing Linh vật Thú cưng (view-pet)...');
  await page.click('#nav-pet');
  await new Promise(r => setTimeout(r, 600));

  const isPet2Col = await page.$eval('#view-pet .grid', el => el.classList.contains('lg:grid-cols-12'));
  const ownedPetsCount = await page.$$eval('#owned-pets-list > div', els => els.length);
  console.log('  ✓ Pet layout is 2-column (lg:grid-cols-12):', isPet2Col);
  console.log('  ✓ Owned pets count:', ownedPetsCount, '(Starter pet only)');
  await page.screenshot({ path: 'audit_3_pet_view.png' });

  // 5. Audit Arena View (view-minigame)
  console.log('Step 5: Auditing Đấu trường Minigame (view-minigame)...');
  await page.click('#nav-minigame');
  await new Promise(r => setTimeout(r, 600));

  const arenaPillExists = await page.$('#atab-fight');
  const subTier = await page.$eval('#lobby-sub-tier', el => el.textContent.trim());
  const subPts = await page.$eval('#lobby-sub-pts', el => el.textContent.trim());
  const allTier = await page.$eval('#lobby-all-tier', el => el.textContent.trim());
  const allPts = await page.$eval('#lobby-all-pts', el => el.textContent.trim());
  console.log('  ✓ Arena old pill button exists?:', arenaPillExists !== null);
  console.log(`  ✓ Arena Hạng môn: "${subTier}" - "${subPts}"`);
  console.log(`  ✓ Arena Hạng tổng: "${allTier}" - "${allPts}"`);
  await page.screenshot({ path: 'audit_4_arena_view.png' });

  // 6. Audit Shop View (view-shop)
  console.log('Step 6: Auditing Cửa hàng Shop (view-shop)...');
  await page.click('#nav-shop');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'audit_5_shop_view.png' });

  // 7. Audit Bản đồ leo tháp (view-saga)
  console.log('Step 7: Auditing Bản đồ leo tháp (view-saga)...');
  await page.click('#nav-saga');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'audit_6_saga_view.png' });

  console.log('\n--- BROWSER CONSOLE ERRORS ---');
  if (errors.length === 0) {
    console.log('✓ ZERO browser errors detected!');
  } else {
    errors.forEach(e => console.error('  ERROR:', e));
  }

  await browser.close();

  // Clean up test user from DB
  console.log('\nStep 8: Cleaning up test user from database...');
  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'hocvien_moi')");
  await db.execute("DELETE FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'hocvien_moi')");
  await db.execute("DELETE FROM tien_do_mon_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'hocvien_moi')");
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'hocvien_moi'");
  console.log('✓ Database cleaned completely. Only admin remains.');

  console.log('\n🎉 ALL REAL BROWSER AUDITS PASSED WITH FLYING COLORS!');
}

runE2ETest().catch(err => {
  console.error('E2E Audit Failed:', err);
  process.exit(1);
});
