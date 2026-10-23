const puppeteer = require('puppeteer-core');
const path = require('path');
const db = require('../database/db');

async function snap() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  const artifactDir = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29');

  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'snap_user')");
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'snap_user'");

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Register clean user
  await page.click('#tab-auth-register');
  await new Promise(r => setTimeout(r, 200));
  await page.type('#auth-username', 'snap_user@nctu.edu.vn');
  await page.type('#auth-password', 'CleanPass123@');
  await page.type('#auth-password-confirm', 'CleanPass123@');
  await page.evaluate(() => handleAuthSubmit());
  await new Promise(r => setTimeout(r, 1200));

  // 1. Snap Hub with Daily Quests & Newbie Banner
  await page.evaluate(() => {
    navTo('hub');
    localStorage.removeItem('tok_onboarding_completed');
    initNewbieGuideAndQuests();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactDir, 'snap_hub_daily_quests.png') });
  console.log('✓ Captured snap_hub_daily_quests.png');

  // 2. Snap Sảnh Đấu Trường with Game Mode Cards
  await page.click('#nav-minigame');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_arena_game_modes.png') });
  console.log('✓ Captured snap_arena_game_modes.png');

  // 3. Snap Casual Mode Tab
  await page.click('#card-mode-casual');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'snap_arena_casual_mode.png') });
  console.log('✓ Captured snap_arena_casual_mode.png');

  // 4. Snap Pet Onboarding Tour Modal Step 1
  await page.evaluate(() => {
    startPetOnboardingTour();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_pet_onboarding_step1.png') });
  console.log('✓ Captured snap_pet_onboarding_step1.png');

  // 5. Step 2
  await page.evaluate(() => {
    nextPetTourStep();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_pet_onboarding_step2.png') });
  console.log('✓ Captured snap_pet_onboarding_step2.png');

  // Cleanup
  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'snap_user')");
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'snap_user'");

  await browser.close();
}

snap().catch(console.error);
