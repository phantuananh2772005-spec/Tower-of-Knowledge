const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29';

async function runTest() {
  console.log('🚀 KIỂM THỬ TỰ ĐỘNG: THU GỌN SIDEBAR & KHÔNG CUỘN NGANG (NO HORIZONTAL SCROLL)...');
  
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  // Standard laptop resolution: 1280x800
  await page.setViewport({ width: 1280, height: 800 });

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

    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok, usr) => {
      localStorage.setItem('tok_admin_token', tok);
      localStorage.setItem('tok_token', tok);
      localStorage.setItem('tok_user', JSON.stringify(usr));
      localStorage.removeItem('tok_admin_sidebar_collapsed');
    }, token, loginData.data.user);

    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForFunction(() => {
      const m = document.getElementById('modal-admin-login');
      return m && m.classList.contains('hidden');
    });

    // 2. Go to Questions tab
    console.log('2. Điều hướng đến tab Ngân Hàng Câu Hỏi...');
    await page.click('#nav-tab-questions');
    await page.waitForSelector('#panel-questions:not(.hidden)');
    await page.waitForFunction(() => document.getElementById('filter-q-course').options.length > 1);
    await new Promise(r => setTimeout(r, 800));

    // 3. Check Initial Sidebar Width (Expanded)
    const initialSidebarWidth = await page.evaluate(() => {
      const sb = document.getElementById('admin-sidebar');
      return sb.getBoundingClientRect().width;
    });
    console.log(`3. Độ rộng ban đầu của Sidebar (mở rộng): ${initialSidebarWidth}px (kỳ vọng ~256px)`);
    if (initialSidebarWidth < 240) {
      throw new Error(`Sidebar ban đầu quá hẹp: ${initialSidebarWidth}px`);
    }

    // 4. Verify ZERO Horizontal Scroll on 1280px screen
    const scrollStatusExpanded = await page.evaluate(() => {
      const bodyScrollable = document.documentElement.scrollWidth > document.documentElement.clientWidth;
      const mainEl = document.querySelector('main');
      const tableWrap = document.querySelector('#panel-questions table').parentElement;
      return {
        bodyScrollable,
        windowInnerWidth: window.innerWidth,
        docScrollWidth: document.documentElement.scrollWidth,
        mainScrollWidth: mainEl.scrollWidth,
        mainClientWidth: mainEl.clientWidth,
        tableWrapScrollWidth: tableWrap.scrollWidth,
        tableWrapClientWidth: tableWrap.clientWidth
      };
    });
    console.log('4. Kiểm tra cuộn ngang khi Sidebar Mở Rộng (Viewport 1280px):', scrollStatusExpanded);
    if (scrollStatusExpanded.bodyScrollable) {
      throw new Error('Cảnh báo: Toàn trang bị cuộn ngang!');
    }
    if (scrollStatusExpanded.tableWrapScrollWidth > scrollStatusExpanded.tableWrapClientWidth + 2) {
      throw new Error(`Bảng bị tràn ngang: scrollWidth=${scrollStatusExpanded.tableWrapScrollWidth} > clientWidth=${scrollStatusExpanded.tableWrapClientWidth}`);
    }
    console.log('   ✓ Tuyệt vời! 100% không bị cuộn ngang trên màn hình 1280px!');

    // 5. Test Shortened Question IDs
    const qIdsSample = await page.evaluate(() => {
      const idCells = document.querySelectorAll('#table-questions tr td:first-child span');
      return Array.from(idCells).slice(0, 3).map(el => ({ text: el.innerText, title: el.title }));
    });
    console.log('5. Mẫu mã câu hỏi sau khi thu gọn:', qIdsSample);

    // Save screenshot in expanded state
    const ssExpandedPath = path.join(ARTIFACT_DIR, 'admin_questions_no_scroll_expanded.png');
    await page.screenshot({ path: ssExpandedPath });
    console.log('   Đã chụp ảnh màn hình mở rộng không cuộn ngang:', ssExpandedPath);

    // 6. Test Collapse Sidebar via button
    console.log('6. Nhấn nút ◀ để thu gọn Sidebar...');
    await page.click('#btn-toggle-sidebar');
    await new Promise(r => setTimeout(r, 600));

    const collapsedSidebarWidth = await page.evaluate(() => {
      const sb = document.getElementById('admin-sidebar');
      return sb.getBoundingClientRect().width;
    });
    console.log(`   Độ rộng sau khi thu gọn: ${collapsedSidebarWidth}px (kỳ vọng ~72px)`);
    if (collapsedSidebarWidth > 85) {
      throw new Error(`Sidebar không thu gọn đúng: ${collapsedSidebarWidth}px`);
    }

    // Check localStorage persistence
    const savedState = await page.evaluate(() => localStorage.getItem('tok_admin_sidebar_collapsed'));
    console.log(`   Trạng thái lưu trong localStorage: ${savedState} (kỳ vọng '1')`);
    if (savedState !== '1') {
      throw new Error('Trạng thái thu gọn chưa được lưu vào localStorage!');
    }

    // 7. Check ZERO Horizontal Scroll when Collapsed
    const scrollStatusCollapsed = await page.evaluate(() => {
      const mainEl = document.querySelector('main');
      const tableWrap = document.querySelector('#panel-questions table').parentElement;
      return {
        tableWrapScrollWidth: tableWrap.scrollWidth,
        tableWrapClientWidth: tableWrap.clientWidth,
        isTableFit: tableWrap.scrollWidth <= tableWrap.clientWidth + 1
      };
    });
    console.log('7. Kiểm tra độ vừa vặn khi Sidebar Thu Gọn:', scrollStatusCollapsed);
    if (!scrollStatusCollapsed.isTableFit) {
      throw new Error('Bảng bị tràn khi Sidebar thu gọn!');
    }

    // Save screenshot in collapsed state
    const ssCollapsedPath = path.join(ARTIFACT_DIR, 'admin_questions_sidebar_collapsed.png');
    await page.screenshot({ path: ssCollapsedPath });
    console.log('   Đã chụp ảnh màn hình Sidebar thu gọn:', ssCollapsedPath);

    // 8. Test Expand via Topbar ☰ / ▶ Button
    console.log('8. Nhấn nút mở rộng trên Top Header...');
    await page.click('#btn-toggle-sidebar-top');
    await new Promise(r => setTimeout(r, 600));

    const reExpandedWidth = await page.evaluate(() => {
      const sb = document.getElementById('admin-sidebar');
      return sb.getBoundingClientRect().width;
    });
    console.log(`   Độ rộng sau khi mở rộng lại từ Topbar: ${reExpandedWidth}px (kỳ vọng ~256px)`);
    if (reExpandedWidth < 240) {
      throw new Error(`Sidebar không mở lại được: ${reExpandedWidth}px`);
    }

    // 9. Verify Action Buttons (Sửa & Xóa) are 100% visible inside viewport
    const actionButtonsVisible = await page.evaluate(() => {
      const firstRow = document.querySelector('#table-questions tr');
      if (!firstRow) return false;
      const lastCell = firstRow.querySelector('td:last-child');
      const rect = lastCell.getBoundingClientRect();
      return {
        visible: rect.right <= window.innerWidth && rect.left >= 0,
        rectRight: rect.right,
        windowWidth: window.innerWidth
      };
    });
    console.log('9. Kiểm tra hiển thị cột Thao tác (Sửa, Xóa):', actionButtonsVisible);
    if (!actionButtonsVisible.visible) {
      throw new Error('Cột thao tác bị lệch ra ngoài màn hình!');
    }
    console.log('   ✓ Cột Thao tác (✏️ Sửa, 🗑️ Xóa) hiển thị trọn vẹn 100% trong khung nhìn!');

    console.log('\n🎉 TOÀN BỘ CÁC BƯỚC KIỂM THỬ THU GỌN SIDEBAR & KHÔNG CUỘN NGANG ĐÃ THÀNH CÔNG 100%!');
  } catch (err) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
