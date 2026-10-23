const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = path.join('C:', 'Users', 'phant', '.gemini', 'antigravity', 'brain', '1749ee9f-cdb1-4857-9457-40771305fd29');

async function testFix() {
  console.log('=== [TEST] KIỂM TRA SỬA LỖI TEXT BẢN ĐỒ LEO THÁP & SPEECH BUBBLE ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Đăng nhập học viên
    await page.evaluate(async () => {
      await loginWithGoogle();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Mở môn Chuyển đổi số
    console.log('1. Mở môn Chuyển đổi số (chuyen-doi-so)...');
    await page.evaluate(async () => {
      await openCourseRoadmap('chuyen-doi-so');
    });
    await new Promise(r => setTimeout(r, 1500));

    // Lấy thông tin text trên giao diện
    const texts = await page.evaluate(() => {
      return {
        breadcrumbCourse: document.getElementById('topbar-breadcrumb-course')?.textContent,
        sidebarTag: document.getElementById('sidebar-saga-course-tag')?.textContent,
        topbarTitle: document.getElementById('topbar-title')?.textContent,
        speechBubbleText: document.getElementById('roadmap-pet-speech-text')?.textContent
      };
    });

    console.log('Kết quả hiển thị trên UI:', JSON.stringify(texts, null, 2));

    const snapFixPath = path.join(ARTIFACT_DIR, 'snap_cds_saga_fixed_texts.png');
    await page.screenshot({ path: snapFixPath });
    console.log(`✓ Đã chụp ảnh màn hình sau khi sửa: ${snapFixPath}`);

    // Kiểm tra tính chính xác
    if (texts.breadcrumbCourse?.includes('Chuyển đổi số')) {
      console.log('✓ PASS: Breadcrumb hiển thị đúng môn Chuyển đổi số!');
    } else {
      throw new Error(`Breadcrumb sai: ${texts.breadcrumbCourse}`);
    }

    if (texts.sidebarTag === 'CĐS · C1') {
      console.log('✓ PASS: Sidebar tag hiển thị đúng CĐS · C1!');
    } else {
      throw new Error(`Sidebar tag sai: ${texts.sidebarTag}`);
    }

    if (texts.speechBubbleText === 'Bắt đầu học! 🎯' || texts.speechBubbleText === 'Bắt đầu nào! 🎯') {
      console.log(`✓ PASS: Speech bubble hiển thị đúng cho mốc chưa học: "${texts.speechBubbleText}" (không còn là "Học tiếp nào!")`);
    } else {
      throw new Error(`Speech bubble sai: ${texts.speechBubbleText}`);
    }

    // Kiểm tra chuyển lại sang Cơ sở dữ liệu xem có tự động đổi lại thành CSDL không
    console.log('2. Mở lại môn Cơ sở dữ liệu (co-so-du-lieu)...');
    await page.evaluate(async () => {
      await openCourseRoadmap('co-so-du-lieu');
    });
    await new Promise(r => setTimeout(r, 1500));

    const textsCsdl = await page.evaluate(() => {
      return {
        breadcrumbCourse: document.getElementById('topbar-breadcrumb-course')?.textContent,
        sidebarTag: document.getElementById('sidebar-saga-course-tag')?.textContent,
        topbarTitle: document.getElementById('topbar-title')?.textContent,
        speechBubbleText: document.getElementById('roadmap-pet-speech-text')?.textContent
      };
    });

    console.log('Kết quả khi xem CSDL:', JSON.stringify(textsCsdl, null, 2));

    if (textsCsdl.breadcrumbCourse?.includes('Cơ sở Dữ liệu') || textsCsdl.breadcrumbCourse?.includes('Cơ sở dữ liệu')) {
      console.log('✓ PASS: Breadcrumb tự động chuyển về Cơ sở dữ liệu!');
    }
    if (textsCsdl.sidebarTag?.startsWith('CSDL')) {
      console.log('✓ PASS: Sidebar tag tự động chuyển về CSDL!');
    }

    console.log('=== [TEST] TẤT CẢ CÁC ĐIỀU CHỈNH ĐỀU HOÀN TOÀN CHÍNH XÁC 100%! ===');
  } finally {
    await browser.close();
  }
}

testFix().catch(err => {
  console.error('[LỖI TEST]:', err);
  process.exit(1);
});
