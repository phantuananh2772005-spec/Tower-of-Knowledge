const puppeteer = require('puppeteer-core');
const path = require('path');
const db = require('../database/db');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  const artifactDir = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29');

  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'tour_tester')");
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'tour_tester'");

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Register clean user
  await page.click('#tab-auth-register');
  await new Promise(r => setTimeout(r, 200));
  await page.type('#auth-username', 'tour_tester@nctu.edu.vn');
  await page.type('#auth-password', 'CleanPass123@');
  await page.type('#auth-password-confirm', 'CleanPass123@');
  await page.evaluate(() => handleAuthSubmit());
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss unboxing modal if opened
  await page.evaluate(() => {
    const unbox = document.getElementById('modal-newbie-giftbox');
    if (unbox) unbox.classList.add('hidden');
    const tour = document.getElementById('modal-pet-onboarding');
    if (tour) tour.classList.add('hidden');
  });

  // Navigate to Arena (minigame)
  console.log('--- Snapping Arena Mode Hub ---');
  await page.evaluate(() => {
    navTo('minigame');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactDir, 'snap_arena_mode_hub.png') });

  // Click Card 1: Ranked
  console.log('--- Snapping Arena Ranked Mode ---');
  await page.click('#card-mode-ranked');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactDir, 'snap_arena_mode_ranked.png') });

  // Click Card 2: Casual / Friend Match
  console.log('--- Snapping Arena Casual Friend Mode ---');
  await page.click('#card-mode-casual');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactDir, 'snap_arena_mode_casual.png') });

  // Click QR Button
  console.log('--- Snapping QR Modal ---');
  await page.click('#btn_show_room_qr');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactDir, 'snap_arena_qr_modal.png') });

  // Close QR modal
  await page.click('#btn_close_room_qr');
  await new Promise(r => setTimeout(r, 300));

  // Click "Đổi chế độ" to fold back
  await page.click('#btn_back_modes_casual');
  await new Promise(r => setTimeout(r, 300));

  // Now Test the 6-Step Pet Onboarding Tour
  console.log('--- Snapping 6-Step Tour ---');
  await page.evaluate(() => {
    navTo('hub');
    startPetOnboardingTour();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_tour_step1_hub.png') });

  // Step 2: Catalog
  await page.click('#btn_pet_tour_next');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_tour_step2_catalog.png') });

  // Step 3: Enrolled
  await page.click('#btn_pet_tour_next');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_tour_step3_enrolled.png') });

  // Step 4: Saga
  await page.click('#btn_pet_tour_next');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_tour_step4_saga.png') });

  // Step 5: Pet Companion
  await page.click('#btn_pet_tour_next');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_tour_step5_pet.png') });

  // Step 6: Arena Minigames & Gift Claim
  await page.click('#btn_pet_tour_next');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_tour_step6_minigame.png') });

  await browser.close();
  console.log('✅ ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
