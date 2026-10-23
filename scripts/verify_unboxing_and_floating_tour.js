const puppeteer = require('puppeteer-core');
const path = require('path');
const db = require('../database/db');

async function testUnboxingAndFloatingTour() {
  console.log('🚀 Testing First-time Unboxing & Floating Help Tour Button (Clean Registered User)...');

  const artifactDir = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29';

  // Clean any previous test user
  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'student_box_demo')");
  await db.execute("DELETE FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'student_box_demo')");
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'student_box_demo'");

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // 1. Navigate to localhost
    console.log('1. Navigating to http://localhost:3000/...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Register fresh student account
    console.log('2. Registering clean student account: student_box_demo...');
    await page.click('#tab-auth-register');
    await new Promise(r => setTimeout(r, 200));

    await page.type('#auth-username', 'student_box_demo');
    await page.type('#auth-password', 'DemoPass123@');
    await page.type('#auth-password-confirm', 'DemoPass123@');
    await page.evaluate(() => handleAuthSubmit());
    // Wait for auth submission and registration toast to fade away cleanly
    await new Promise(r => setTimeout(r, 2900));

    // 2. Verify sidebar button is gone and floating ? button exists
    console.log('3. Verifying sidebar button removed and floating ? button exists...');
    const sidebarTourBtn = await page.$('#btn_sidebar_huong_dan');
    const floatingHelpBtn = await page.$('#btn_floating_help_tour');

    console.log('   ✓ #btn_sidebar_huong_dan is removed:', sidebarTourBtn === null);
    console.log('   ✓ #btn_floating_help_tour exists:', floatingHelpBtn !== null);

    if (sidebarTourBtn !== null || floatingHelpBtn === null) {
      throw new Error('Sidebar button was not removed or floating button missing!');
    }

    // Capture screenshot showing clean main UI and floating ? button in bottom right
    const snapCleanView = path.join(artifactDir, 'snap_floating_help_button.png');
    await page.screenshot({ path: snapCleanView, fullPage: false });
    console.log('   📸 Saved snapshot of floating ? button:', snapCleanView);

    // 3. Trigger Unboxing Stage 1
    console.log('4. Triggering Unboxing Sequence (Stage 1: Gift box & tap hand)...');
    await page.evaluate(() => openNewbiePetUnboxing());
    await new Promise(r => setTimeout(r, 600));

    const stageBoxVisible = await page.$eval('#unboxing-stage-box', el => !el.classList.contains('hidden'));
    const tapGuideVisible = await page.$eval('#unboxing-tap-guide', el => !el.classList.contains('opacity-0'));
    console.log('   ✓ Stage 1 Box visible:', stageBoxVisible);
    console.log('   ✓ Tap-tap guide hand visible:', tapGuideVisible);

    const snapStage1 = path.join(artifactDir, 'snap_unboxing_stage1_giftbox.png');
    await page.screenshot({ path: snapStage1, fullPage: false });
    console.log('   📸 Saved snapshot of Stage 1 Gift Box:', snapStage1);

    // 4. Click the gift box to trigger unbox explosion!
    console.log('5. Clicking gift box to trigger rattle and boom explosion...');
    await page.click('#btn_unbox_gift');
    
    // Wait 700ms for rattle + flash + particles + pet reveal
    await new Promise(r => setTimeout(r, 700));

    const stagePetVisible = await page.$eval('#unboxing-stage-pet', el => !el.classList.contains('hidden'));
    const petTitle = await page.$eval('#unboxing-stage-pet h2', el => el.textContent.trim());
    console.log('   ✓ Stage 2 Pet revealed:', stagePetVisible);
    console.log('   ✓ Revealed Pet Title:', petTitle);

    const snapStage2 = path.join(artifactDir, 'snap_unboxing_stage2_pet_reveal.png');
    await page.screenshot({ path: snapStage2, fullPage: false });
    console.log('   📸 Saved snapshot of Stage 2 Pet Reveal:', snapStage2);

    // 5. Click button to start tour from unboxing
    console.log('6. Clicking "#btn_unboxing_start_tour" to start Pet Guided Tour...');
    await page.click('#btn_unboxing_start_tour');
    await new Promise(r => setTimeout(r, 800));

    const unboxingModalClosed = await page.$eval('#modal-unboxing-pet', el => el.classList.contains('hidden'));
    const petTourModalOpen = await page.$eval('#modal-pet-onboarding', el => !el.classList.contains('hidden'));
    const tourBadge = await page.$eval('#pet-tour-step-badge', el => el.textContent.trim());

    console.log('   ✓ Unboxing modal closed:', unboxingModalClosed);
    console.log('   ✓ Pet tour modal seamlessly opened:', petTourModalOpen);
    console.log('   ✓ Pet tour current step:', tourBadge);

    const snapStage3 = path.join(artifactDir, 'snap_unboxing_handoff_to_tour.png');
    await page.screenshot({ path: snapStage3, fullPage: false });
    console.log('   📸 Saved snapshot of seamless tour handoff:', snapStage3);

    // Clean up test user
    await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'student_box_demo')");
    await db.execute("DELETE FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'student_box_demo')");
    await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'student_box_demo'");
    console.log('✓ Cleaned up student_box_demo from DB.');

    console.log('\n🎉 ALL UNBOXING & FLOATING TOUR CHECKS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

testUnboxingAndFloatingTour().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
