const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function captureAdminUI() {
  console.log('🚀 CAPTURING ADMIN PORTAL UI & VERIFYING ALL FEATURES...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const artifactDir = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29';

  // 1. Visit /admin/
  console.log('1. Navigating to http://localhost:3000/admin/ ...');
  await page.goto('http://localhost:3000/admin/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Check if login modal appears
  const loginModalVisible = await page.$eval('#modal-admin-login', el => !el.classList.contains('hidden')).catch(() => false);
  console.log('Admin login modal visible:', loginModalVisible);

  if (loginModalVisible) {
    // Fill credentials
    await page.evaluate(() => {
      document.getElementById('admin-login-user').value = 'admin';
      document.getElementById('admin-login-pass').value = 'Admin123@';
    });
    await page.click('#form-admin-login button[type="submit"]');
    await new Promise(r => setTimeout(r, 1500));
  }

  // 2. Capture Analytics / Dashboard
  console.log('2. Capturing Analytics Tab...');
  await page.screenshot({ path: path.join(artifactDir, 'admin_tab_analytics.png') });

  // 3. Switch to Curriculum / Lộ trình học tập
  console.log('3. Capturing Curriculum Tab...');
  await page.evaluate(() => switchTab('curriculum'));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'admin_tab_curriculum.png') });

  // 4. Switch to Questions / Ngân hàng câu hỏi
  console.log('4. Capturing Questions Tab...');
  await page.evaluate(() => switchTab('questions'));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'admin_tab_questions.png') });

  // 5. Open Question Modal (Thêm / Sửa câu hỏi)
  console.log('5. Capturing Add Question Modal...');
  await page.evaluate(() => openAddQuestionModal());
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactDir, 'admin_modal_add_question.png') });
  await page.evaluate(() => closeQuestionModal());
  await new Promise(r => setTimeout(r, 300));

  // 6. Open Add Course / Add Chapter / Add Checkpoint modals
  console.log('6. Capturing Add Course Modal...');
  await page.evaluate(() => switchTab('curriculum'));
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => openAddCourseModal());
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'admin_modal_add_course.png') });
  await page.evaluate(() => closeAddCourseModal());
  await new Promise(r => setTimeout(r, 300));

  // 7. Users Tab
  console.log('7. Capturing Users Tab...');
  await page.evaluate(() => switchTab('users'));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'admin_tab_users.png') });

  // 8. Pets Tab
  console.log('8. Capturing Pets Tab...');
  await page.evaluate(() => switchTab('pets'));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'admin_tab_pets.png') });

  console.log('✅ ALL ADMIN SCREENSHOTS CAPTURED SUCCESSFULLY!');
  await browser.close();
}

captureAdminUI().catch(err => {
  console.error('Fatal error in captureAdminUI:', err);
  process.exit(1);
});
