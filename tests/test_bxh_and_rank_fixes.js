const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('================================================================');
  console.log('🔍 KIỂM THỬ: RANK TỔNG KHÔNG CHIA 2 & BXH HIỆN "BẠN" TOÀN BỘ 4 TAB');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Đăng nhập tài khoản tên "anh"
    const uName = 'anh_' + Date.now().toString().slice(-4);
    await page.evaluate(async (uname) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ten_dang_nhap: uname.toLowerCase(),
          mat_khau: 'Password123!',
          ten_hien_thi: 'anh'
        })
      });
      const d = await res.json();
      localStorage.setItem('tok_token', d.data.token);
      applyUserData(d.data.nguoi_dung);
      closeAuthModal(true);
    }, uName);

    await new Promise(r => setTimeout(r, 600));

    // 1. Kiểm tra công thức Rank Tổng không bị chia 2
    const rankCalc = await page.evaluate(() => {
      RANKS.csdl = 210;
      RANKS.ctdl = 0;
      return {
        subPts: RANKS.csdl,
        subTier: tierOf(RANKS.csdl, false),
        totPts: overallPts(),
        totTier: tierOf(overallPts(), true)
      };
    });

    console.log('\n--- 1. Kiểm tra Công thức Rank Tổng ---');
    console.log('Kết quả tính toán:', rankCalc);
    if (rankCalc.totPts !== 210) {
      throw new Error(`Lỗi: Rank Tổng bị chia đôi! Kỳ vọng 210, thực tế: ${rankCalc.totPts}`);
    }
    if (rankCalc.totTier !== rankCalc.subTier) {
      throw new Error(`Lỗi: Danh hiệu bị lệch! Môn: ${rankCalc.subTier}, Tổng: ${rankCalc.totTier}`);
    }
    console.log('✓ XÁC NHẬN: Rank Tổng = 210 điểm (Khởi nguyên II), không còn bị chia 2!');

    // 2. Mở Đấu trường & Tab Bảng Xếp Hạng
    await page.evaluate(() => {
      navTo('minigame');
      arenaTab('rank');
    });

    await new Promise(r => setTimeout(r, 1000));

    // 3. Kiểm tra cả 4 Tab BXH đều hiển thị "Bạn" và không có người dùng "Đối thủ"
    const tabs = [
      { id: 'hang', name: 'Hạng' },
      { id: 'speed', name: 'Tốc độ' },
      { id: 'acc', name: 'Chính xác' },
      { id: 'streak', name: 'Chuỗi thắng' }
    ];

    console.log('\n--- 2. Kiểm tra hiển thị "Bạn" và lọc "Đối thủ" trên 4 Tab ---');

    for (const tab of tabs) {
      await page.evaluate((tid) => {
        setRank(tid);
      }, tab.id);

      await new Promise(r => setTimeout(r, 400));

      const tabState = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#rank-list > div'));
        const rowTexts = rows.map(r => r.innerText.trim().replace(/\s+/g, ' '));
        const banRow = rows.find(r => r.innerText.includes('Bạn'));
        const hasDoiThu = rowTexts.some(t => t.includes('Đối thủ') || t.includes('Người chơi 1'));
        return {
          count: rows.length,
          hasBanRow: !!banRow,
          banRowText: banRow ? banRow.innerText.trim().replace(/\s+/g, ' ') : null,
          banRowGreen: banRow ? banRow.classList.contains('bg-emerald-500/10') : false,
          hasDoiThu,
          sampleTop3: rowTexts.slice(0, 3)
        };
      });

      console.log(`\nTab [${tab.name}]:`);
      console.log(`- Tìm thấy hàng của "Bạn": ${tabState.hasBanRow} (Nội dung: "${tabState.banRowText}")`);
      console.log(`- Hàng có viền xanh nổi bật (me): ${tabState.banRowGreen}`);
      console.log(`- Tồn tại người tên "Đối thủ": ${tabState.hasDoiThu}`);

      if (!tabState.hasBanRow) {
        throw new Error(`Tab ${tab.name} không hiển thị "Bạn" ở hàng của mình!`);
      }
      if (tabState.hasDoiThu) {
        throw new Error(`Tab ${tab.name} vẫn còn xuất hiện người dùng ảo "Đối thủ"!`);
      }
    }

    const artDir = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29';
    await page.screenshot({ path: path.join(artDir, 'prod_bxh_fixed_all_tabs.png') });

    console.log('\n================================================================');
    console.log('🎉 TẤT CẢ KIỂM THỬ THÀNH CÔNG RỰC RỠ 100%!');
    console.log('================================================================');
  } finally {
    await browser.close();
  }
}

run().catch(e => {
  console.error('❌ KIỂM THỬ THẤT BẠI:', e);
  process.exit(1);
});
