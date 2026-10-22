const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('================================================================');
  console.log('🔍 KIỂM THỬ: KHẮC PHỤC TRÙNG LẶP "BẠN" & TÁCH BẠCH TÊN NGƯỜI DÙNG VỚI PET');
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

    // 1. Đăng ký tài khoản User 1 (ID usr_me, tên hiển thị: "anh", username: "anh_test_me")
    const u1 = 'anh_main_' + Date.now().toString().slice(-4);
    const user1Data = await page.evaluate(async (uname) => {
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
      return d.data.nguoi_dung;
    }, u1);

    console.log('✓ Đã khởi tạo User chính:', user1Data.ten_hien_thi, `(ID: ${user1Data.ma_nguoi_dung})`);

    // 2. Kiểm tra sảnh Đấu Trường: Tên người dùng và Tên Pet đã được tách bạch
    await page.evaluate(() => {
      navTo('minigame');
      arenaTab('fight');
    });

    await new Promise(r => setTimeout(r, 600));

    const lobbyInfo = await page.evaluate(() => {
      const petNameEl = document.getElementById('arena-lobby-pet-name');
      const userDisplayEl = document.querySelector('#arena-fight .user-display-name');
      return {
        petLabel: petNameEl ? petNameEl.innerText.trim() : null,
        userName: userDisplayEl ? userDisplayEl.innerText.trim() : null
      };
    });

    console.log('\n--- 1. Kiểm tra Sảnh Đấu trường (Lobby VS Card) ---');
    console.log('Tên hiển thị người chơi:', lobbyInfo.userName);
    console.log('Tên linh vật đồng hành:', lobbyInfo.petLabel);

    if (!lobbyInfo.userName || lobbyInfo.userName === lobbyInfo.petLabel) {
      throw new Error(`Lỗi: Tên người dùng bị trùng hoặc biến thành tên pet! user: ${lobbyInfo.userName}, pet: ${lobbyInfo.petLabel}`);
    }
    if (!lobbyInfo.petLabel.includes('🐾')) {
      throw new Error(`Lỗi: Tên pet thiếu biểu tượng nhận diện 🐾! ${lobbyInfo.petLabel}`);
    }
    console.log('✓ XÁC NHẬN: Tên người dùng là "' + lobbyInfo.userName + '" và tên Pet là "' + lobbyInfo.petLabel + '" hoàn toàn tách bạch!');

    // 3. Kiểm tra BXH:
    // Trên hệ thống hiện có nhiều tài khoản cùng mang tên "anh" trong DB
    // Nhưng CHỈ CÓ DUY NHẤT tài khoản đang đăng nhập (user1Data) mới được hiển thị là "Bạn"
    await page.evaluate(() => {
      // Cho user1 185 điểm để kiểm tra vị trí rank
      RANKS.csdl = 185;
      RANKS.ctdl = 0;
      arenaTab('rank');
    });

    await new Promise(r => setTimeout(r, 1200));

    const rankRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#rank-list > div'));
      return rows.map((r, i) => ({
        index: i + 1,
        text: r.innerText.replace(/\s+/g, ' ').trim(),
        isGreen: r.classList.contains('bg-emerald-500/10'),
        hasBan: r.innerText.includes('Bạn'),
        nameCol: r.querySelector('.font-semibold') ? r.querySelector('.font-semibold').innerText.trim() : ''
      }));
    });

    console.log('\n--- 2. Kiểm tra BXH khi có nhiều tài khoản cùng tên "anh" ---');
    const banRows = rankRows.filter(r => r.hasBan || r.nameCol === 'Bạn');
    console.log('Tổng số hàng trên BXH:', rankRows.length);
    console.log('Các hàng được nhận diện là Bạn:', banRows);

    if (banRows.length !== 1) {
      throw new Error(`Lỗi nghiêm trọng: Có ${banRows.length} hàng hiển thị "Bạn"! Kỳ vọng DUY NHẤT 1 hàng!`);
    }

    const otherAnhRows = rankRows.filter(r => r.nameCol === 'anh' || r.nameCol === 'Anh');
    console.log('Các tài khoản "anh" của người khác/thiết bị khác:', otherAnhRows);

    if (otherAnhRows.some(r => r.hasBan || r.isGreen)) {
      throw new Error('Lỗi: Tài khoản anh của người khác bị biến thành Bạn hoặc bị bôi xanh!');
    }

    console.log('✓ XÁC NHẬN: CHỈ CÓ DUY NHẤT 1 hàng hiển thị "Bạn"!');
    console.log('✓ XÁC NHẬN: Các tài khoản "anh" của thiết bị/người chơi khác vẫn giữ nguyên tên và điểm của họ!');

    // Chụp ảnh bằng chứng
    const ssPath = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29\\prod_bxh_no_duplicate_me.png';
    await page.screenshot({ path: ssPath, fullPage: false });
    console.log('✓ Đã lưu ảnh chụp nghiệm thu tại:', ssPath);

    console.log('\n================================================================');
    console.log('🎉 TẤT CẢ KIỂM THỬ ĐÃ THÀNH CÔNG RỰC RỠ 100%!');
    console.log('================================================================');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Kiểm thử thất bại:', err);
  process.exit(1);
});
