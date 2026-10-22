const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runE2E() {
  console.log('--- KHỞI ĐỘNG E2E PUPPETEER: 2 THIẾT BỊ ĐẤU TRƯỜNG & ĐẦU HÀNG ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const ctx1 = await browser.createBrowserContext();
  const ctx2 = await browser.createBrowserContext();

  const page1 = await ctx1.newPage();
  const page2 = await ctx2.newPage();

  await page1.setViewport({ width: 1280, height: 800 });
  await page2.setViewport({ width: 1280, height: 800 });

  page1.on('console', msg => console.log('[P1 Console]:', msg.text()));
  page1.on('pageerror', err => console.error('[P1 PageError]:', err.message));
  page2.on('console', msg => console.log('[P2 Console]:', msg.text()));
  page2.on('pageerror', err => console.error('[P2 PageError]:', err.message));

  console.log('1. Mở trang chủ trên cả 2 thiết bị...');
  await page1.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page2.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Đăng ký/đăng nhập User 1
  console.log('2. Đăng nhập User 1 trên Thiết bị 1...');
  const u1Name = 'Player_Alpha_' + Math.floor(Math.random() * 1000);
  await page1.evaluate(async (uname) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ten_dang_nhap: uname.toLowerCase(),
        mat_khau: 'Password123!',
        ten_hien_thi: uname
      })
    });
    const d = await res.json();
    if (d.success && d.data) {
      localStorage.setItem('tok_token', d.data.token);
      applyUserData(d.data.nguoi_dung);
      closeAuthModal(true);
    }
  }, u1Name);

  // Đăng ký/đăng nhập User 2
  console.log('3. Đăng nhập User 2 trên Thiết bị 2...');
  const u2Name = 'Player_Beta_' + Math.floor(Math.random() * 1000);
  await page2.evaluate(async (uname) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ten_dang_nhap: uname.toLowerCase(),
        mat_khau: 'Password123!',
        ten_hien_thi: uname
      })
    });
    const d = await res.json();
    if (d.success && d.data) {
      localStorage.setItem('tok_token', d.data.token);
      applyUserData(d.data.nguoi_dung);
      closeAuthModal(true);
    }
  }, u2Name);

  await new Promise(r => setTimeout(r, 800));

  console.log('4. Điều hướng cả 2 thiết bị vào tab Đấu trường 1v1...');
  await page1.evaluate(() => {
    navTo('minigame');
    arenaTab('fight');
  });
  await page2.evaluate(() => {
    navTo('minigame');
    arenaTab('fight');
  });

  await new Promise(r => setTimeout(r, 600));

  console.log('5. Cả 2 thiết bị nhấn "Tìm trận" (startMatchmaking)...');
  await page1.evaluate(() => startMatchmaking());
  await new Promise(r => setTimeout(r, 600));
  await page2.evaluate(() => startMatchmaking());

  console.log('6. Chờ ghép nối người vs người...');
  // Chờ cho đến khi modal-versus hiển thị hoặc battle mở ra
  await page1.waitForFunction(() => {
    const vs = document.getElementById('modal-versus');
    const battle = document.getElementById('view-battle');
    return (vs && !vs.classList.contains('hidden')) || (battle && !battle.classList.contains('hidden'));
  }, { timeout: 10000 });

  console.log('✓ Đã ghép trận thành công! Chờ vào sàn đấu (2.5s)...');
  await new Promise(r => setTimeout(r, 2600));

  // Chụp ảnh sàn đấu trên Thiết bị 1
  const screenshotBattle1 = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29\\prod_arena_p1_multitype.png';
  await page1.screenshot({ path: screenshotBattle1, fullPage: false });
  console.log(`✓ Đã chụp ảnh sàn đấu Thiết bị 1: ${screenshotBattle1}`);

  // Thiết bị 1 mở modal đầu hàng
  console.log('7. Thiết bị 1 bấm nút "Đầu hàng" (openSurrenderModal)...');
  await page1.evaluate(() => openSurrenderModal());
  await new Promise(r => setTimeout(r, 500));

  const screenshotSurrenderModal = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29\\prod_arena_surrender_modal.png';
  await page1.screenshot({ path: screenshotSurrenderModal, fullPage: false });
  console.log(`✓ Đã chụp ảnh modal xác nhận đầu hàng: ${screenshotSurrenderModal}`);

  // Thiết bị 1 xác nhận đầu hàng
  console.log('8. Thiết bị 1 xác nhận đầu hàng (executeSurrender)...');
  await page1.evaluate(() => executeSurrender());

  console.log('9. Chờ màn hình tổng kết trận đấu xuất hiện trên cả 2 thiết bị...');
  await page1.waitForFunction(() => {
    const res = document.getElementById('b-result');
    return res && !res.classList.contains('hidden');
  }, { timeout: 10000 });

  await page2.waitForFunction(() => {
    const res = document.getElementById('b-result');
    return res && !res.classList.contains('hidden');
  }, { timeout: 10000 });

  await new Promise(r => setTimeout(r, 600));

  // Chụp ảnh tổng kết trên cả 2 thiết bị
  const screenshotResultP1 = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29\\prod_arena_p1_surrender_result.png';
  await page1.screenshot({ path: screenshotResultP1, fullPage: false });
  console.log(`✓ Đã chụp ảnh kết quả đầu hàng Thiết bị 1: ${screenshotResultP1}`);

  const screenshotResultP2 = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29\\prod_arena_p2_victory_result.png';
  await page2.screenshot({ path: screenshotResultP2, fullPage: false });
  console.log(`✓ Đã chụp ảnh chiến thắng Thiết bị 2: ${screenshotResultP2}`);

  await browser.close();
  console.log('=== E2E HOÀN TẤT XUẤT SẮC! ===');
  process.exit(0);
}

runE2E().catch(err => {
  console.error('❌ E2E Failed:', err);
  process.exit(1);
});
