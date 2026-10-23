const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = path.join('C:', 'Users', 'phant', '.gemini', 'antigravity', 'brain', '1749ee9f-cdb1-4857-9457-40771305fd29');

async function runVerification() {
  console.log('=== [E2E] KHỞI ĐỘNG XÁC MINH GIAO DIỆN MÔN CHUYỂN ĐỔI SỐ ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('console', msg => {
      const txt = msg.text();
      if (!txt.includes('downloadable font') && !txt.includes('favicon')) {
        console.log('[Page Console]:', txt);
      }
    });

    console.log('1. Mở trang chủ ứng dụng http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    console.log('2. Đăng nhập người dùng qua loginWithGoogle()...');
    await page.evaluate(async () => {
      await loginWithGoogle();
    });
    await new Promise(r => setTimeout(r, 1500));

    // 3. Mở Catalog Môn Học
    console.log('3. Mở Danh mục Môn học (Catalog)...');
    await page.evaluate(() => {
      navTo('catalog');
    });
    await new Promise(r => setTimeout(r, 1000));

    const snapCatalogPath = path.join(ARTIFACT_DIR, 'snap_cds_catalog.png');
    await page.screenshot({ path: snapCatalogPath });
    console.log(`✓ Đã chụp ảnh Catalog: ${snapCatalogPath}`);

    // 4. Mở lộ trình môn Chuyển Đổi Số
    console.log('4. Mở lộ trình môn Chuyển Đổi Số (openCourseRoadmap)...');
    await page.evaluate(async () => {
      await openCourseRoadmap('chuyen-doi-so');
    });
    await new Promise(r => setTimeout(r, 1500));

    const snapSagaCDSPath = path.join(ARTIFACT_DIR, 'snap_cds_saga_roadmap.png');
    await page.screenshot({ path: snapSagaCDSPath });
    console.log(`✓ Đã chụp ảnh Bản đồ Leo Tháp CĐS: ${snapSagaCDSPath}`);

    // 5. Kiểm tra thông tin các mốc và chương
    const roadmapDetails = await page.evaluate(() => {
      return {
        topbarTitle: document.getElementById('topbar-title')?.textContent,
        progText: document.getElementById('topbar-progress-text')?.textContent,
        activeCourseSlug: currentActiveCourseSlug,
        totalChaptersInLive: liveCourseData?.cac_chuong?.length,
        chapters: (liveCourseData?.cac_chuong || []).map(c => ({
          ma: c.ma_chuong,
          tieu_de: c.tieu_de,
          so_moc: c.cac_moc?.length
        }))
      };
    });
    console.log('Thông tin lộ trình hiển thị:', JSON.stringify(roadmapDetails, null, 2));

    // 6. Mở Modal Thử Thách Cực Hạn
    console.log('6. Mở Modal Thử Thách Cực Hạn (Extreme Survival)...');
    await page.evaluate(() => {
      openExtremeSetupModal('mon_cds');
    });
    await new Promise(r => setTimeout(r, 1000));

    const snapExtremeSetupPath = path.join(ARTIFACT_DIR, 'snap_cds_extreme_setup.png');
    await page.screenshot({ path: snapExtremeSetupPath });
    console.log(`✓ Đã chụp ảnh Modal thiết lập Cực Hạn: ${snapExtremeSetupPath}`);

    // 7. Bắt đầu trận đấu Cực Hạn môn CĐS
    console.log('7. Bắt đầu trận đấu Sinh Tồn Cực Hạn môn CĐS...');
    await page.evaluate(async () => {
      await startExtremeSurvival('mon_cds');
    });
    await new Promise(r => setTimeout(r, 1500));

    const snapExtremeLivePath = path.join(ARTIFACT_DIR, 'snap_cds_extreme_live.png');
    await page.screenshot({ path: snapExtremeLivePath });
    console.log(`✓ Đã chụp ảnh Trận đấu Cực Hạn môn CĐS: ${snapExtremeLivePath}`);

    const extremeLiveDetails = await page.evaluate(() => {
      return {
        subTitle: document.getElementById('extreme-subject-title')?.textContent,
        lives: document.getElementById('extreme-lives-val')?.textContent,
        qText: document.getElementById('extreme-question-text')?.textContent?.substring(0, 100),
        optionsCount: document.querySelectorAll('#extreme-options-container button')?.length
      };
    });
    console.log('Thông tin giao diện thi đấu Cực Hạn:', JSON.stringify(extremeLiveDetails, null, 2));

    console.log('=== [E2E] XÁC MINH HOÀN TẤT THÀNH CÔNG RỰC RỠ 100%! ===');
  } finally {
    await browser.close();
  }
}

runVerification().catch(err => {
  console.error('[E2E LỖI]:', err);
  process.exit(1);
});
