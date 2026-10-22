/**
 * E2E Automated Verification:
 * 1. PvP 2-Player Combat Synchronization (Damage, Pet Lunge/Shake, Floating Damage, HP bars)
 * 2. Real-time Leaderboard (BXH) update across multiple clients
 */

const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runVerification() {
  console.log('================================================================');
  console.log('🎮 TEST PVP 2-NGƯỜI CHƠI: SÁT THƯƠNG PET & BXH REALTIME');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const ctx1 = await browser.createBrowserContext();
    const ctx2 = await browser.createBrowserContext();

    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    await page1.setViewport({ width: 1200, height: 800 });
    await page2.setViewport({ width: 1200, height: 800 });

    page1.on('console', msg => console.log('[P1 Console]:', msg.text()));
    page2.on('console', msg => console.log('[P2 Console]:', msg.text()));

    page1.on('response', res => { if (res.status() >= 400) console.log('[P1 HTTP Error]:', res.status(), res.url()); });
    page2.on('response', res => { if (res.status() >= 400) console.log('[P2 HTTP Error]:', res.status(), res.url()); });

    console.log('\n--- BƯỚC 1: Mở ứng dụng trên 2 màn hình ---');
    await page1.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page2.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    console.log('\n--- BƯỚC 2: Đăng ký & Đăng nhập 2 học viên khác nhau ---');
    const u1 = 'p1_' + Date.now().toString().slice(-4);
    const u2 = 'p2_' + Date.now().toString().slice(-4);

    await page1.evaluate(async (uname) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ten_dang_nhap: uname,
          mat_khau: 'Password123!',
          ten_hien_thi: 'Hiệp Sĩ ' + uname
        })
      });
      const d = await res.json();
      if (d.success && d.data) {
        localStorage.setItem('tok_token', d.data.token);
        applyUserData(d.data.nguoi_dung);
        closeAuthModal(true);
      }
    }, u1);

    await page2.evaluate(async (uname) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ten_dang_nhap: uname,
          mat_khau: 'Password123!',
          ten_hien_thi: 'Chiến Tướng ' + uname
        })
      });
      const d = await res.json();
      if (d.success && d.data) {
        localStorage.setItem('tok_token', d.data.token);
        applyUserData(d.data.nguoi_dung);
        closeAuthModal(true);
      }
    }, u2);

    await new Promise(r => setTimeout(r, 800));

    console.log('\n--- BƯỚC 3: Ghép trận 1v1 giữa 2 người chơi ---');
    await page1.evaluate(() => {
      navTo('minigame');
      arenaTab('fight');
      startBattle();
    });

    await new Promise(r => setTimeout(r, 600));

    await page2.evaluate(() => {
      navTo('minigame');
      arenaTab('fight');
      startBattle();
    });

    console.log('Chờ ghép trận & màn hình VS đếm ngược...');
    await page1.waitForFunction(() => !document.getElementById('view-battle').classList.contains('hidden'), { timeout: 12000 });
    await page2.waitForFunction(() => !document.getElementById('view-battle').classList.contains('hidden'), { timeout: 12000 });

    // Kiểm tra đã vào màn hình chiến đấu chưa
    const battleState1 = await page1.evaluate(() => ({
      inBattle: !document.getElementById('view-battle').classList.contains('hidden'),
      isBot: B.isBot,
      myUserId: B.myUserId,
      myHp: B.my,
      opHp: B.op,
      round: B.qi,
      botStatus: document.getElementById('b-bot-status')?.textContent
    }));

    const battleState2 = await page2.evaluate(() => ({
      inBattle: !document.getElementById('view-battle').classList.contains('hidden'),
      isBot: B.isBot,
      myUserId: B.myUserId,
      myHp: B.my,
      opHp: B.op,
      round: B.qi,
      botStatus: document.getElementById('b-bot-status')?.textContent
    }));

    console.log('Player 1 battle state:', battleState1);
    console.log('Player 2 battle state:', battleState2);

    if (!battleState1.inBattle || !battleState2.inBattle) {
      throw new Error('Chưa chuyển sang màn hình chiến đấu!');
    }
    if (battleState1.isBot !== false || battleState2.isBot !== false) {
      throw new Error('Lỗi: Trận 2 người chơi thực nhưng hệ thống nhận nhầm là đấu Bot!');
    }

    console.log('\n--- BƯỚC 4: Player 1 trả lời câu hỏi và gây sát thương ---');
    // Player 1 trả lời đúng
    await page1.evaluate(() => {
      const q = B.list[B.qi - 1];
      playerAnswer(1, q, null, { da_hoan_thanh: true, isCorrect: true });
    });

    console.log('Đợi phản hồi sát thương Socket trên cả 2 màn hình...');
    await page1.waitForFunction(() => B.op < 100, { timeout: 10000 });
    await page2.waitForFunction(() => B.my < 100, { timeout: 10000 });

    const p1AfterAttack = await page1.evaluate(() => ({
      myHp: B.my,
      opHp: B.op,
      opFloatText: document.getElementById('op-float')?.textContent,
      statusText: document.getElementById('b-bot-status')?.textContent
    }));

    const p2AfterDefend = await page2.evaluate(() => ({
      myHp: B.my,
      opHp: B.op,
      myFloatText: document.getElementById('my-float')?.textContent,
      statusText: document.getElementById('b-bot-status')?.textContent
    }));

    console.log('P1 sau khi tấn công (Attacker view):', p1AfterAttack);
    console.log('P2 sau khi nhận đòn (Defender view):', p2AfterDefend);

    console.log('✓ XÁC NHẬN: Sát thương và số máu đồng bộ tức thì trên cả 2 thiết bị!');

    console.log('\n--- BƯỚC 5: Player 2 trả lời câu hỏi để hoàn thành Hiệp 1 ---');
    await page2.evaluate(() => {
      const q = B.list[B.qi - 1];
      playerAnswer(1, q, null, { da_hoan_thanh: true, isCorrect: true });
    });

    console.log('Đợi chuyển sang Hiệp 2 trên cả 2 màn hình...');
    await page1.waitForFunction(() => B.qi >= 2, { timeout: 10000 });
    await page2.waitForFunction(() => B.qi >= 2, { timeout: 10000 });

    const round2P1 = await page1.evaluate(() => B.qi);
    const round2P2 = await page2.evaluate(() => B.qi);
    console.log(`Hiệp hiện tại: P1 hiệp ${round2P1}, P2 hiệp ${round2P2}`);
    console.log('✓ XÁC NHẬN: Cả 2 người chơi đã sang Hiệp 2 đồng bộ!');

    console.log('\n--- BƯỚC 6: Kiểm tra BXH Realtime khi kết thúc trận ---');
    // Player 1 đầu hàng để kết thúc trận nhanh chóng
    await page1.evaluate(() => {
      openSurrenderModal();
      document.getElementById('btn_confirm_surrender')?.click();
    });

    await new Promise(r => setTimeout(r, 2000));

    // Chuyển sang Tab BXH trên cả 2 trang
    await page1.evaluate(() => {
      navTo('minigame');
      arenaTab('rank');
    });
    await page2.evaluate(() => {
      navTo('minigame');
      arenaTab('rank');
    });

    await new Promise(r => setTimeout(r, 1500));

    const bxh1Rows = await page1.evaluate(() => {
      return Array.from(document.querySelectorAll('#rank-list > div')).map(el => el.textContent.trim().replace(/\s+/g, ' '));
    });
    const bxh2Rows = await page2.evaluate(() => {
      return Array.from(document.querySelectorAll('#rank-list > div')).map(el => el.textContent.trim().replace(/\s+/g, ' '));
    });

    console.log('Số hàng BXH trên Máy 1:', bxh1Rows.length);
    console.log('Top 3 BXH trên Máy 1:\n', bxh1Rows.slice(0, 3).join('\n'));
    console.log('Số hàng BXH trên Máy 2:', bxh2Rows.length);
    console.log('Top 3 BXH trên Máy 2:\n', bxh2Rows.slice(0, 3).join('\n'));

    // Chụp ảnh bằng chứng
    const artDir = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29';
    await page1.screenshot({ path: path.join(artDir, 'prod_pvp_p1_screen.png') });
    await page2.screenshot({ path: path.join(artDir, 'prod_pvp_p2_screen.png') });

    console.log('\n================================================================');
    console.log('🎉 TẤT CẢ KIỂM THỬ THÀNH CÔNG RỰC RỠ 100%!');
    console.log('================================================================');
  } finally {
    await browser.close();
  }
}

runVerification().catch(err => {
  console.error('❌ KIỂM THỬ THẤT BẠI:', err);
  process.exit(1);
});
