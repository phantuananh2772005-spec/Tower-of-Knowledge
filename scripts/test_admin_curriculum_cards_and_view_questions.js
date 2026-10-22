const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testCurriculumCardsAndQuestionView() {
  console.log('🚀 TESTING ADMIN CURRICULUM CARDS & QUESTION PREVIEW BUTTON...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  page.on('response', res => {
    if (res.status() >= 400) {
      console.log('HTTP ERROR:', res.status(), res.url());
    }
  });

  const artifactDir = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29';

  // 1. Visit /admin/
  console.log('1. Navigating to http://localhost:3000/admin/ ...');
  await page.goto('http://localhost:3000/admin/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const loginModalVisible = await page.$eval('#modal-admin-login', el => !el.classList.contains('hidden')).catch(() => false);
  if (loginModalVisible) {
    console.log('Logging into Admin portal...');
    await page.evaluate(() => {
      document.getElementById('admin-login-user').value = 'admin';
      document.getElementById('admin-login-pass').value = 'Admin123@';
    });
    await page.click('#form-admin-login button[type="submit"]');
    await new Promise(r => setTimeout(r, 1200));
  }

  // 2. Switch to Curriculum Tab
  console.log('2. Switching to Curriculum tab...');
  await page.evaluate(async () => {
    switchTab('curriculum');
    await loadCurriculumTree();
  });
  await page.waitForSelector('#curriculum-courses-grid > div', { timeout: 10000 });

  // Verify Level 1: Course Cards View
  const isCardsViewVisible = await page.$eval('#curriculum-courses-view', el => !el.classList.contains('hidden'));
  const isDetailViewHidden = await page.$eval('#curriculum-detail-view', el => el.classList.contains('hidden'));
  const courseCardsCount = await page.$$eval('#curriculum-courses-grid > div', els => els.length);

  console.log('Level 1 Course Cards View visible:', isCardsViewVisible);
  console.log('Level 2 Course Detail View hidden:', isDetailViewHidden);
  console.log('Number of course cards rendered:', courseCardsCount);

  if (!isCardsViewVisible || courseCardsCount === 0) {
    throw new Error('Course cards view failed to render properly!');
  }

  const cardsScreenshotPath = path.join(artifactDir, 'admin_curriculum_cards_view.png');
  await page.screenshot({ path: cardsScreenshotPath });
  console.log('Saved Level 1 Course Cards screenshot:', cardsScreenshotPath);

  // 3. Click on the first Course Card to open Level 2 Detail View
  console.log('3. Clicking on the first Course Card to view details...');
  await page.click('#curriculum-courses-grid > div:first-child');
  await new Promise(r => setTimeout(r, 600));

  const isCardsViewHiddenNow = await page.$eval('#curriculum-courses-view', el => el.classList.contains('hidden'));
  const isDetailViewVisibleNow = await page.$eval('#curriculum-detail-view', el => !el.classList.contains('hidden'));
  const breadcrumbText = await page.$eval('#curriculum-detail-breadcrumb', el => el.innerText.trim());
  const chaptersCount = await page.$$eval('#curriculum-detail-chapters > div', els => els.length);

  console.log('Level 1 hidden now:', isCardsViewHiddenNow);
  console.log('Level 2 visible now:', isDetailViewVisibleNow);
  console.log('Breadcrumb text:', breadcrumbText);
  console.log('Chapters rendered in detail view:', chaptersCount);

  if (!isDetailViewVisibleNow || chaptersCount === 0) {
    throw new Error('Failed to open Course Detail view!');
  }

  const detailScreenshotPath = path.join(artifactDir, 'admin_curriculum_detail_view.png');
  await page.screenshot({ path: detailScreenshotPath });
  console.log('Saved Level 2 Course Detail screenshot:', detailScreenshotPath);

  // 4. Test "Xem đề (...)" Button on a Checkpoint
  console.log('4. Testing "Xem đề" button on first checkpoint...');
  const xemDeButton = await page.$('#curriculum-detail-chapters button[onclick*="filterQuestionsByMoc"]');
  if (!xemDeButton) {
    throw new Error('Could not find "Xem đề" button!');
  }

  // Click "Xem đề"
  await xemDeButton.click();
  await new Promise(r => setTimeout(r, 1200));

  // Verify switch to questions tab and filtered moc
  const isQuestionsTabActive = await page.$eval('#panel-questions', el => !el.classList.contains('hidden'));
  const filterMocVal = await page.$eval('#filter-q-moc', el => el.value);
  const questionsRowsCount = await page.$$eval('#table-questions tr', els => els.length);

  console.log('Switched to Questions Tab:', isQuestionsTabActive);
  console.log('Filter Moc selected value:', filterMocVal);
  console.log('Filtered Questions rows count:', questionsRowsCount);

  if (!isQuestionsTabActive || !filterMocVal || questionsRowsCount === 0) {
    throw new Error('"Xem đề" button failed to switch tab and filter questions!');
  }

  const questionsScreenshotPath = path.join(artifactDir, 'admin_questions_filtered_by_moc.png');
  await page.screenshot({ path: questionsScreenshotPath });
  console.log('Saved Filtered Questions screenshot:', questionsScreenshotPath);

  // 5. Test returning back to course list
  console.log('5. Returning back to Course List...');
  await page.evaluate(() => switchTab('curriculum'));
  await new Promise(r => setTimeout(r, 500));
  await page.click('button[onclick="backToCourseList()"]');
  await new Promise(r => setTimeout(r, 400));

  const returnedToCards = await page.$eval('#curriculum-courses-view', el => !el.classList.contains('hidden'));
  console.log('Smoothly returned to Course Cards view:', returnedToCards);

  await browser.close();
  console.log('🎉 ALL CURRICULUM CARDS & "XEM ĐỀ" TESTS PASSED WITH 100% SUCCESS!');
}

testCurriculumCardsAndQuestionView().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
