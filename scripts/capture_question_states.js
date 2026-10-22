const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29';

async function captureDetailedStates() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ten_dang_nhap: 'admin', mat_khau: 'Admin123@' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;

  await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
  await page.evaluate((tok, usr) => {
    localStorage.setItem('tok_admin_token', tok);
    localStorage.setItem('tok_token', tok);
    localStorage.setItem('tok_user', JSON.stringify(usr));
  }, token, loginData.data.user);

  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction(() => {
    const m = document.getElementById('modal-admin-login');
    return m && m.classList.contains('hidden');
  });

  // Switch to Questions tab
  await page.click('#nav-tab-questions');
  await page.waitForSelector('#panel-questions:not(.hidden)');
  await page.waitForFunction(() => document.getElementById('filter-q-course').options.length > 1);
  await new Promise(r => setTimeout(r, 1000));

  // 1. State 1: Filtered by Course
  await page.select('#filter-q-course', 'mon_csdl');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_questions_course_selected.png') });

  // 2. State 2: Edit Modal with Delete Button
  const firstQ = await page.evaluate(() => allLoadedQuestions[0]?.ma_cau_hoi);
  if (firstQ) {
    await page.click(`#btn-edit-q-${firstQ}`);
    await page.waitForSelector('#modal-edit-question:not(.hidden)');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_question_edit_modal_with_delete_btn.png') });

    // Close edit modal
    await page.click('#modal-edit-question button[onclick="closeQuestionModal()"]');
    await new Promise(r => setTimeout(r, 500));
  }

  // 3. State 3: Custom Confirm Delete Modal
  if (firstQ) {
    await page.click(`#btn-del-q-${firstQ}`);
    await page.waitForSelector('#modal-confirm-delete-question:not(.hidden)');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_question_delete_confirm_modal.png') });
    await page.click('#modal-confirm-delete-question button[onclick="closeConfirmDeleteQuestionModal()"]');
  }

  await browser.close();
  console.log('✅ Captured all detailed state screenshots successfully!');
}

captureDetailedStates().catch(console.error);
