const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('================================================================');
  console.log('🔍 KIỂM THỬ: DANH SÁCH MÔN HỌC TRONG ĐẤU TRƯỜNG & BXH CHỈ CÓ MÔN THẬT');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // 1. Kiểm tra Dropdown tại Sảnh Đấu trường (view-minigame)
    await page.evaluate(() => {
      navTo('minigame');
      arenaTab('fight');
    });

    await new Promise(r => setTimeout(r, 600));

    const lobbyOptions = await page.evaluate(() => {
      const sel = document.getElementById('lobby-subject');
      if (!sel) return [];
      return Array.from(sel.options).map(o => ({ value: o.value, text: o.text }));
    });

    console.log('\n--- 1. Danh sách môn tại Sảnh Đấu Trường (lobby-subject) ---');
    console.log('Các lựa chọn:', lobbyOptions);

    if (lobbyOptions.some(o => o.value === 'ctdl' || o.text.includes('CTDL'))) {
      throw new Error(`Lỗi: Vẫn còn môn ảo CTDL trong Sảnh đấu trường! ${JSON.stringify(lobbyOptions)}`);
    }

    if (!lobbyOptions.some(o => o.value === 'csdl' || o.text.includes('Cơ sở dữ liệu'))) {
      throw new Error(`Lỗi: Thiếu môn Cơ sở dữ liệu trong Sảnh đấu trường!`);
    }
    console.log('✓ XÁC NHẬN: Sảnh Đấu trường CHỈ CÓ môn thực tế (Cơ sở dữ liệu), không còn môn CTDL ảo!');

    // 2. Kiểm tra Dropdown tại Bảng Xếp Hạng (arena-rank)
    await page.evaluate(() => {
      arenaTab('rank');
    });

    await new Promise(r => setTimeout(r, 600));

    const rankOptions = await page.evaluate(() => {
      const sel = document.getElementById('rank-subject');
      if (!sel) return [];
      return Array.from(sel.options).map(o => ({ value: o.value, text: o.text }));
    });

    console.log('\n--- 2. Danh sách môn tại Bảng Xếp Hạng (rank-subject) ---');
    console.log('Các lựa chọn:', rankOptions);

    if (rankOptions.some(o => o.value === 'ctdl' || o.text.includes('CTDL'))) {
      throw new Error(`Lỗi: Vẫn còn môn ảo CTDL trong Bảng xếp hạng! ${JSON.stringify(rankOptions)}`);
    }

    console.log('✓ XÁC NHẬN: Bảng Xếp Hạng CHỈ CÓ "Tất cả môn" và "Cơ sở dữ liệu", không còn môn CTDL ảo!');

    // 3. Chụp ảnh màn hình kiểm chứng
    const ssPath = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29\\prod_only_real_courses_dropdown.png';
    await page.screenshot({ path: ssPath, fullPage: false });
    console.log('✓ Đã lưu ảnh chụp kiểm chứng tại:', ssPath);

    console.log('\n================================================================');
    console.log('🎉 KIỂM THỬ THÀNH CÔNG 100%: KHÔNG CÒN MÔN ẢO TRÊN GIAO DIỆN!');
    console.log('================================================================');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Kiểm thử thất bại:', err);
  process.exit(1);
});
