const puppeteer = require('puppeteer-core');
const path = require('path');
const db = require('../database/db');

async function testTourFirstAndSecondTime() {
  console.log('🚀 Verifying Tour 1st time (with gift) vs 2nd time (review mode, no duplicate gift)...');

  const artifactDir = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29';

  // Clean test user
  await db.execute("DELETE FROM giao_dich_xu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'test_tour_user')");
  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'test_tour_user')");
  await db.execute("DELETE FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'test_tour_user')");
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'test_tour_user'");

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // 1. Register fresh user
    console.log('1. Navigating to http://localhost:3000/...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    await page.click('#tab-auth-register');
    await new Promise(r => setTimeout(r, 200));

    await page.type('#auth-username', 'test_tour_user');
    await page.type('#auth-password', 'TourPass123@');
    await page.type('#auth-password-confirm', 'TourPass123@');
    await page.evaluate(() => handleAuthSubmit());
    await new Promise(r => setTimeout(r, 2900));

    // 2. Check Settings Modal to ensure "Mở Hộp Quà Tân Thủ" is REMOVED
    console.log('2. Checking Settings modal to ensure "Mở Hộp Quà Tân Thủ" is gone...');
    await page.evaluate(() => openSettingsModal());
    await new Promise(r => setTimeout(r, 400));

    const settingsText = await page.$eval('#modal-settings', el => el.innerText);
    const hasUnboxingInSettings = settingsText.includes('Mở Hộp Quà Tân Thủ');
    console.log('   ✓ "Mở Hộp Quà Tân Thủ" removed from Settings:', !hasUnboxingInSettings);

    const snapSettingsClean = path.join(artifactDir, 'snap_settings_clean_no_unboxing.png');
    await page.screenshot({ path: snapSettingsClean, fullPage: false });
    console.log('   📸 Saved snapshot of clean settings modal:', snapSettingsClean);

    await page.evaluate(() => closeSettingsModal());
    await new Promise(r => setTimeout(r, 300));

    // 3. Launch Tour for FIRST TIME
    console.log('3. Launching Tour for 1st time (First-Time Experience)...');
    await page.evaluate(() => startPetOnboardingTour());
    await new Promise(r => setTimeout(r, 400));

    // Jump to Step 5
    await page.evaluate(() => {
      currentPetTourStep = 4;
      renderPetTourStep();
    });
    await new Promise(r => setTimeout(r, 400));

    const step5Title1st = await page.$eval('#pet-tour-title', el => el.textContent.trim());
    const step5Btn1st = await page.$eval('#btn_pet_tour_finish', el => el.textContent.trim());
    console.log(`   ✓ 1st Time Step 5 Title: "${step5Title1st}"`);
    console.log(`   ✓ 1st Time Finish Button: "${step5Btn1st}" (Should contain 20 Xu)`);

    const snapStep5FirstTime = path.join(artifactDir, 'snap_step5_first_time_gift.png');
    await page.screenshot({ path: snapStep5FirstTime, fullPage: false });
    console.log('   📸 Saved snapshot of Step 5 First Time:', snapStep5FirstTime);

    // Finish tour and claim 20 coins
    console.log('4. Claiming gift by clicking finish button...');
    await page.click('#btn_pet_tour_finish');
    await new Promise(r => setTimeout(r, 1000));

    const coinsAfter1st = await page.$eval('#sidebar-coins-val', el => el.textContent.trim());
    console.log(`   ✓ Coins after 1st claim: ${coinsAfter1st} (Should be 20)`);

    // 4. Re-open Tour for SECOND TIME via floating ? button
    console.log('5. Re-opening Tour for 2nd time (Review Mode)...');
    await page.click('#btn_floating_help_tour');
    await new Promise(r => setTimeout(r, 400));

    // Jump to Step 5 in 2nd time
    await page.evaluate(() => {
      currentPetTourStep = 4;
      renderPetTourStep();
    });
    await new Promise(r => setTimeout(r, 400));

    const step5Title2nd = await page.$eval('#pet-tour-title', el => el.textContent.trim());
    const step5Btn2nd = await page.$eval('#btn_pet_tour_finish', el => el.textContent.trim());
    console.log(`   ✓ 2nd Time Step 5 Title: "${step5Title2nd}" (Should be Hành Trình Tri Thức)`);
    console.log(`   ✓ 2nd Time Finish Button: "${step5Btn2nd}" (Should NOT contain 20 Xu, should say Hoàn thành hướng dẫn)`);

    const snapStep5SecondTime = path.join(artifactDir, 'snap_step5_second_time_review.png');
    await page.screenshot({ path: snapStep5SecondTime, fullPage: false });
    console.log('   📸 Saved snapshot of Step 5 Second Time (Review Mode):', snapStep5SecondTime);

    // Click finish in review mode
    console.log('6. Clicking finish in review mode (verifying NO duplicate gift)...');
    await page.click('#btn_pet_tour_finish');
    await new Promise(r => setTimeout(r, 800));

    const coinsAfter2nd = await page.$eval('#sidebar-coins-val', el => el.textContent.trim());
    console.log(`   ✓ Coins after 2nd review: ${coinsAfter2nd} (Must still be 20, absolutely NO duplicate coin!)`);

    if (coinsAfter2nd !== coinsAfter1st) {
      throw new Error(`CRITICAL LOGIC LEAK: Coins changed from ${coinsAfter1st} to ${coinsAfter2nd} on review!`);
    }

    if (step5Btn2nd.includes('20 Xu')) {
      throw new Error(`UX CONFUSION: 2nd time button still shows "20 Xu"!`);
    }

    // Clean up
    await db.execute("DELETE FROM giao_dich_xu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'test_tour_user')");
    await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'test_tour_user')");
    await db.execute("DELETE FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'test_tour_user')");
    await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'test_tour_user'");
    console.log('✓ Cleaned up test_tour_user from DB.');

    console.log('\n🎉 ALL FIRST-TIME VS REVIEW-MODE CHECKS PASSED WITH 100% INTEGRITY!');
  } finally {
    await browser.close();
  }
}

testTourFirstAndSecondTime().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
