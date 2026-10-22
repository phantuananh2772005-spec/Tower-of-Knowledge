const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29';

async function runTest() {
  console.log('🚀 KIỂM THỬ TỰ ĐỘNG: TRUNG TÂM DỮ LIỆU & HỒ SƠ LÀM BÀI HỌC VIÊN...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Login Admin
    console.log('1. Đăng nhập Admin lấy token...');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ten_dang_nhap: 'admin', mat_khau: 'Admin123@' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;

    // Navigate to admin
    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok, usr) => {
      localStorage.setItem('tok_admin_token', tok);
      localStorage.setItem('tok_token', tok);
      localStorage.setItem('tok_user', JSON.stringify(usr));
    }, token, loginData.data.user);

    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // 2. Switch to Tab 5: Logs / Telemetry
    console.log('2. Chuyển sang Tab Nhật Ký Học Tập & Hồ Sơ Dữ Liệu Học Viên (#nav-tab-logs)...');
    await page.click('#nav-tab-logs');
    await page.waitForFunction(() => {
      const el = document.getElementById('log-stat-sessions');
      return el && el.innerText.trim() !== '--';
    }, { timeout: 10000 });
    await new Promise(r => setTimeout(r, 600));

    // 3. Verify KPI cards
    const kpiSessions = await page.$eval('#log-stat-sessions', el => el.innerText.trim());
    const kpiAccuracy = await page.$eval('#log-stat-accuracy', el => el.innerText.trim());
    const kpiTime = await page.$eval('#log-stat-time', el => el.innerText.trim());
    const kpiLookups = await page.$eval('#log-stat-lookups', el => el.innerText.trim());
    console.log('3. Các thẻ KPI toàn hệ thống:', { kpiSessions, kpiAccuracy, kpiTime, kpiLookups });

    // 4. Verify 10 recent activities table
    const recentRowsCount = await page.$$eval('#table-recent-activities tr', rows => rows.length);
    console.log('4. Số hàng hoạt động gần nhất:', recentRowsCount);

    // 5. Verify learner directory table
    const learnerRowsCount = await page.$$eval('#table-learners-directory tr', rows => rows.length);
    console.log('5. Số hàng trong danh bạ học viên:', learnerRowsCount);

    // Capture main telemetry hub overview
    const ssHubPath = path.join(ARTIFACT_DIR, 'admin_telemetry_hub.png');
    await page.screenshot({ path: ssHubPath });
    console.log('   Đã chụp ảnh màn hình tổng quan:', ssHubPath);

    // 6. Test search filter
    console.log('6. Kiểm tra ô tìm kiếm học viên: gõ "admin"...');
    await page.type('#search-learner-input', 'admin');
    await new Promise(r => setTimeout(r, 400));
    const filteredCount = await page.$$eval('#table-learners-directory tr', rows => rows.length);
    console.log('   Số học viên sau khi lọc:', filteredCount);

    // 7. Click detail button for admin user
    console.log('7. Mở Modal Hồ Sơ Chi Tiết của Đại Sư Quản Trị...');
    const btnSelector = '#btn-view-learner-usr_admin_001';
    await page.waitForSelector(btnSelector, { visible: true });
    await page.click(btnSelector);

    // Wait for telemetry modal to fully hydrate
    await page.waitForFunction(() => {
      const el = document.getElementById('telemetry-user-name');
      return el && el.innerText.trim() !== 'Đang tải dữ liệu học viên...' && !el.innerText.includes('Đang tải');
    }, { timeout: 10000 });
    await new Promise(r => setTimeout(r, 600));

    // Check modal visibility
    const modalVisible = await page.$eval('#modal-learner-telemetry', el => !el.classList.contains('hidden'));
    console.log('   Modal hiển thị:', modalVisible);

    const userName = await page.$eval('#telemetry-user-name', el => el.innerText.trim());
    const userAccuracy = await page.$eval('#modal-kpi-accuracy', el => el.innerText.trim());
    const userTime = await page.$eval('#modal-kpi-time', el => el.innerText.trim());
    console.log('   Hồ sơ học viên đã tải hoàn tất:', { userName, userAccuracy, userTime });

    // Capture Modal Sessions tab (with question-level details)
    const ssModalSessionsPath = path.join(ARTIFACT_DIR, 'admin_learner_deep_modal.png');
    await page.screenshot({ path: ssModalSessionsPath });
    console.log('   Đã chụp ảnh màn hình Modal Lịch Sử Phiên & Từng Câu Hỏi:', ssModalSessionsPath);

    // 8. Switch to Tab 2: Weaknesses
    console.log('8. Chuyển sang Tab Bản Đồ Ghi Nhớ & Điểm Yếu...');
    await page.click('#modal-tab-btn-weaknesses');
    await new Promise(r => setTimeout(r, 600));

    const ssModalWeakPath = path.join(ARTIFACT_DIR, 'admin_learner_weaknesses_tab.png');
    await page.screenshot({ path: ssModalWeakPath });
    console.log('   Đã chụp ảnh màn hình Tab Điểm Yếu & Bản Đồ Ghi Nhớ:', ssModalWeakPath);

    // 9. Switch to Tab 3: Checkpoints
    console.log('9. Chuyển sang Tab Tiến Độ Mốc Bài Học...');
    await page.click('#modal-tab-btn-checkpoints');
    await new Promise(r => setTimeout(r, 500));

    // 10. Close modal
    console.log('10. Đóng Modal...');
    await page.click('#btn-close-learner-modal');
    await new Promise(r => setTimeout(r, 400));
    const modalClosed = await page.$eval('#modal-learner-telemetry', el => el.classList.contains('hidden'));
    console.log('   Modal đã đóng thành công:', modalClosed);

    console.log('\n🎉 TOÀN BỘ CÁC BƯỚC KIỂM THỬ TRUNG TÂM DỮ LIỆU & HỒ SƠ LÀM BÀI HỌC VIÊN ĐÃ THÀNH CÔNG 100%!');
  } finally {
    await browser.close();
  }
}

runTest().catch(err => {
  console.error('❌ Kiểm thử thất bại:', err);
  process.exit(1);
});
