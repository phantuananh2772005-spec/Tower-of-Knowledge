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

  // Start Tour
  await page.evaluate(() => {
    startPetOnboardingTour();
  });
  await new Promise(r => setTimeout(r, 600));

  // Step 1: Welcome
  await page.screenshot({ path: path.join(artifactDir, 'snap_pet_step1_welcome.png') });
  console.log('✓ Captured snap_pet_step1_welcome.png');

  // Step 2: Sidebar Saga
  await page.evaluate(() => nextPetTourStep());
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_pet_step2_saga.png') });
  console.log('✓ Captured snap_pet_step2_saga.png');

  // Step 3: Arena Modes Bar
  await page.evaluate(() => nextPetTourStep());
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_pet_step3_arena.png') });
  console.log('✓ Captured snap_pet_step3_arena.png');

  // Step 4: Daily Quests (Scrolled into focus, dialog above)
  await page.evaluate(() => nextPetTourStep());
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_pet_step4_quests_focused.png') });
  console.log('✓ Captured snap_pet_step4_quests_focused.png');

  // Step 5: Pet room (Clean positioning, finish button full text)
  await page.evaluate(() => nextPetTourStep());
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'snap_pet_step5_finish_button.png') });
  console.log('✓ Captured snap_pet_step5_finish_button.png');

  // Cleanup
  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'snap_user')");
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'snap_user'");

  await browser.close();
}

snap().catch(console.error);
