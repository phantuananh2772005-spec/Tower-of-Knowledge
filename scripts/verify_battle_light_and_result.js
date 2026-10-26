const puppeteer = require('puppeteer-core');
const path = require('path');

async function main() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ten_dang_nhap: 'admin', mat_khau: 'Admin123@' })
  });
  const authData = await loginRes.json();
  const token = authData.data.token;
  const user = authData.data.user;

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactDir = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29');

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await page.evaluate((tok, usr) => {
      localStorage.setItem('tok_token', tok);
      localStorage.setItem('tok_user', JSON.stringify(usr));
      currentUser = usr;
      currentUserAccount = usr;
      document.querySelectorAll('.fixed:not(#mobile-bottom-bar), [id^="modal-"]').forEach(m => {
        m.classList.add('hidden');
      });
      // Set to Light Theme for verification!
      document.documentElement.classList.remove('dark');
      navTo('minigame');
    }, token, user);

    await new Promise(r => setTimeout(r, 600));

    // 1. Render DIEN_TU in light theme
    await page.evaluate(() => {
      startActualBattle({
        id: 'usr_bot_001',
        name: 'Đấu Sĩ Tập Sự',
        petIcon: '🦉',
        petName: 'Cú Tri Thức Archie',
        isBot: true,
        isCasual: true
      });
      // Override B.list[0] to DIEN_TU
      B.list = [{
        loai: 'DIEN_TU',
        q: 'Mô hình dữ liệu quan hệ được đề xuất bởi {blank} vào năm 1970.',
        data: {
          sentence_template: 'Mô hình dữ liệu quan hệ được đề xuất bởi {blank} vào năm 1970.',
          blank_answer: 'E.F. Codd',
          options: ['E.F. Codd', 'Alan Turing', 'Tim Berners-Lee', 'Linus Torvalds']
        }
      }];
      B.qi = 0;
      nextRound();
      B.combo = 3;
      updHp();
    });
    await new Promise(r => setTimeout(r, 400));
    const snapDienTu = path.join(artifactDir, 'snap_arena_light_dien_tu.png');
    await page.screenshot({ path: snapDienTu });
    console.log('✓ Captured DIEN_TU light theme:', snapDienTu);

    // 2. Render NOI_CAP in light theme
    await page.evaluate(() => {
      B.list = [{
        loai: 'NOI_CAP',
        q: 'Ghép cặp thuật ngữ CSDL tương ứng với định nghĩa chuẩn:',
        data: {
          pairs: [
            { left: 'Khóa chính (PK)', right: 'Định danh duy nhất bản ghi' },
            { left: 'Khóa ngoại (FK)', right: 'Tham chiếu khóa chính bảng khác' },
            { left: 'Tính toàn vẹn', right: 'Đảm bảo dữ liệu chính xác' }
          ]
        }
      }];
      B.qi = 0;
      nextRound();
      // Select left item 0 to test active high contrast state
      const leftBtn0 = document.getElementById('pair-left-0');
      if (leftBtn0) leftBtn0.click();
    });
    await new Promise(r => setTimeout(r, 400));
    const snapNoiCap = path.join(artifactDir, 'snap_arena_light_noi_cap.png');
    await page.screenshot({ path: snapNoiCap });
    console.log('✓ Captured NOI_CAP light theme:', snapNoiCap);

    // 3. Trigger Victory Results Screen (#b-result) with match stats
    await page.evaluate(() => {
      B.my = 40;
      B.op = 0;
      B.userCorrectCount = 12;
      B.list = new Array(15).fill({});
      B.maxCombo = 5;
      B.combo = 5;
      B.isCasual = true;
      RANKS.csdl = 2140;
      checkEnd();
    });
    await new Promise(r => setTimeout(r, 1000));
    const snapVictory = path.join(artifactDir, 'snap_arena_victory_casual.png');
    await page.screenshot({ path: snapVictory });
    console.log('✓ Captured Victory Result Modal:', snapVictory);

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
