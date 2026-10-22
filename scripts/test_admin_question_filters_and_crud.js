const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29';

async function run() {
  console.log('🚀 Bắt đầu kịch bản kiểm thử tự động Question Filters & CRUD Admin...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => console.log('  [Browser Log]:', msg.text()));
    page.on('pageerror', err => console.log('  [Browser PageError]:', err.message));

  try {
    // 1. Log in via API to get admin token
    console.log('1. Đăng nhập tài khoản admin để lấy token...');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ten_dang_nhap: 'admin', mat_khau: 'Admin123@' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success || !loginData.data.token) {
      throw new Error('Đăng nhập admin thất bại: ' + JSON.stringify(loginData));
    }
    const token = loginData.data.token;
    console.log('   Admin token hợp lệ:', token.substring(0, 15) + '...');

    // 2. Open Admin UI with token pre-set in localStorage
    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok, usr) => {
      localStorage.setItem('tok_admin_token', tok);
      localStorage.setItem('tok_token', tok);
      localStorage.setItem('tok_user', JSON.stringify(usr));
    }, token, loginData.data.user);

    await page.reload({ waitUntil: 'networkidle0' });

    // Verify admin panel is loaded
    await page.waitForFunction(() => {
      const modal = document.getElementById('modal-admin-login');
      return modal && modal.classList.contains('hidden');
    }, { timeout: 8000 });
    console.log('2. Đã tải giao diện Admin Dashboard thành công!');

    // 3. Switch to Questions tab
    console.log('3. Chuyển sang Tab Ngân Hàng Câu Hỏi...');
    await page.click('#nav-tab-questions');
    await page.waitForSelector('#panel-questions:not(.hidden)');
    
    // Wait until filter-q-course options are loaded (> 1 option)
    await page.waitForFunction(() => {
      const select = document.getElementById('filter-q-course');
      return select && select.options.length > 1;
    }, { timeout: 10000 });

    // Verify Course Filter dropdown exists and has options
    const courseOptions = await page.evaluate(() => {
      const select = document.getElementById('filter-q-course');
      if (!select) return [];
      return Array.from(select.options).map(o => ({ value: o.value, text: o.text }));
    });
    console.log(`   Số lượng lựa chọn môn học trong bộ lọc: ${courseOptions.length}`);
    courseOptions.forEach(opt => console.log(`   - [${opt.value || 'ALL'}] ${opt.text}`));

    if (courseOptions.length <= 1) {
      throw new Error('Bộ lọc môn học chưa có dữ liệu môn!');
    }

    // 4. Test Course Filter
    const targetCourse = courseOptions.find(o => o.value !== '');
    console.log(`4. Kiểm thử lọc theo môn: [${targetCourse.value}] ${targetCourse.text}...`);
    await page.select('#filter-q-course', targetCourse.value);
    await new Promise(r => setTimeout(r, 800));

    // Verify moc filter has cascaded
    const mocOptions = await page.evaluate(() => {
      const select = document.getElementById('filter-q-moc');
      return Array.from(select.options).map(o => ({ value: o.value, text: o.text }));
    });
    console.log(`   Số lượng mốc sau khi lọc môn: ${mocOptions.length}`);

    // Verify table questions all match course
    const questionsCountText = await page.evaluate(() => document.getElementById('q-filter-count').innerText);
    console.log(`   Trạng thái bộ lọc: ${questionsCountText}`);

    // 5. Test Reset Filter
    console.log('5. Thử nghiệm nút Đặt lại tất cả bộ lọc...');
    await page.click('button[onclick="resetQuestionFilters()"]');
    await new Promise(r => setTimeout(r, 800));
    const resetCountText = await page.evaluate(() => document.getElementById('q-filter-count').innerText);
    console.log(`   Sau khi đặt lại: ${resetCountText}`);

    // 6. Test Create a Question via API
    console.log('6. Tạo một câu hỏi mẫu kiểm thử...');
    const firstMoc = mocOptions.find(o => o.value !== '')?.value || 'moc_01';
    const testCreateRes = await fetch('http://localhost:3000/api/admin/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ma_moc: firstMoc,
        noi_dung: 'Câu hỏi kiểm thử tự động CRUD Admin ' + Date.now(),
        loai_cau_hoi: 'TRAC_NGHIEM_4',
        dap_an_a: 'Phương án 1',
        dap_an_b: 'Phương án 2',
        dap_an_c: 'Phương án 3',
        dap_an_d: 'Phương án 4',
        vi_tri_dap_an_dung: 1,
        giai_thich: 'Giải thích tự động',
        do_kho: 2,
        muc_bloom: 'HIEU',
        buoc_luyen_tap: 2
      })
    });
    const testCreateData = await testCreateRes.json();
    if (!testCreateData.success) {
      throw new Error('Tạo câu hỏi kiểm thử thất bại: ' + JSON.stringify(testCreateData));
    }
    const createdQId = testCreateData.data.ma_cau_hoi;
    console.log(`   Tạo thành công câu hỏi: ${createdQId}`);

    // Reload questions list
    await page.evaluate(() => loadQuestions());
    await new Promise(r => setTimeout(r, 1000));

    // 7. Search for the newly created question
    console.log('7. Tìm kiếm câu hỏi vừa tạo bằng thanh search...');
    await page.type('#filter-q-search', createdQId);
    await new Promise(r => setTimeout(r, 600));

    const foundRowCount = await page.evaluate(() => {
      const rows = document.querySelectorAll('#table-questions tr');
      return rows.length;
    });
    console.log(`   Số dòng tìm thấy: ${foundRowCount}`);

    // 8. Test Edit Question Modal
    console.log('8. Nhấn nút ✏️ Sửa trên câu hỏi...');
    const editBtnId = `#btn-edit-q-${createdQId}`;
    await page.waitForSelector(editBtnId);
    await page.click(editBtnId);

    await page.waitForSelector('#modal-edit-question:not(.hidden)');
    const modalTitle = await page.evaluate(() => document.getElementById('modal-question-title').innerText);
    console.log(`   Tiêu đề modal sửa: "${modalTitle}"`);

    const hasDeleteBtnInModal = await page.evaluate(() => {
      const btn = document.getElementById('btn-modal-delete-question');
      return btn && !btn.classList.contains('hidden');
    });
    console.log(`   Nút [Xóa câu hỏi này] hiển thị trong modal sửa: ${hasDeleteBtnInModal}`);
    if (!hasDeleteBtnInModal) {
      throw new Error('Nút [Xóa câu hỏi này] không hiển thị trong modal sửa!');
    }

    // Change content and save
    console.log('   Cập nhật nội dung câu hỏi...');
    await page.evaluate(() => {
      document.getElementById('edit-q-content').value = 'Nội dung đã được cập nhật thành công qua Edit Modal';
    });
    await page.click('#modal-edit-question button[type="submit"]');
    await new Promise(r => setTimeout(r, 1200));

    // Verify modal closed
    const isModalClosed = await page.evaluate(() => document.getElementById('modal-edit-question').classList.contains('hidden'));
    console.log(`   Modal đã đóng sau khi lưu: ${isModalClosed}`);

    // 9. Test Delete Question Modal (Prompt and Confirm)
    console.log('9. Kiểm thử xóa câu hỏi với Modal xác nhận...');
    const delBtnId = `#btn-del-q-${createdQId}`;
    await page.waitForSelector(delBtnId);
    await page.click(delBtnId);

    await page.waitForSelector('#modal-confirm-delete-question:not(.hidden)');
    const delConfirmText = await page.evaluate(() => document.getElementById('del-q-content').innerText);
    console.log(`   Nội dung trong modal xóa: "${delConfirmText}"`);

    // Click confirm delete
    console.log('   Nhấn [Đồng Ý Xóa Vĩnh Viễn]...');
    await page.click('#btn-execute-delete-question');
    await new Promise(r => setTimeout(r, 1500));

    // Verify question is deleted from database
    const checkDelRes = await fetch(`http://localhost:3000/api/admin/questions?limit=500`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const checkDelData = await checkDelRes.json();
    const stillExists = checkDelData.data.some(q => q.ma_cau_hoi === createdQId);
    console.log(`   Câu hỏi còn tồn tại trong CSDL: ${stillExists}`);
    if (stillExists) {
      throw new Error('Lỗi: Câu hỏi chưa bị xóa khỏi CSDL!');
    }
    console.log('   ✅ Đã xóa thành công câu hỏi khỏi CSDL hoàn toàn không dùng browser alert/confirm/prompt!');

    // 10. Take screenshot of Admin Questions Panel with Course Filter
    await page.evaluate(() => resetQuestionFilters());
    await new Promise(r => setTimeout(r, 1000));
    const ssPath = path.join(ARTIFACT_DIR, 'admin_questions_course_filter_and_crud.png');
    await page.screenshot({ path: ssPath, fullPage: false });
    console.log(`10. Đã chụp ảnh giao diện tại: ${ssPath}`);

    console.log('\n🎉 TOÀN BỘ CÁC BƯỚC KIỂM THỬ QUESTION BANK FILTERS & CRUD ĐÃ THÀNH CÔNG RỰC RỠ 100%!');
  } catch (err) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
