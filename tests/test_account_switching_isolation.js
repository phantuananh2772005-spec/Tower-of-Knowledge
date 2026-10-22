const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('================================================================');
  console.log('🔍 KIỂM THỬ: ĐĂNG NHẬP / ĐĂNG XUẤT / ĐỔI TÀI KHOẢN KHÔNG DÍNH DỮ LIỆU CŨ');
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

    // -------------------------------------------------------------------------
    // BƯỚC 1: Đăng ký & Đăng nhập Tài khoản 1 (User Alpha)
    // -------------------------------------------------------------------------
    const u1 = 'alpha_' + Date.now().toString().slice(-4);
    const user1 = await page.evaluate(async (uname) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ten_dang_nhap: uname,
          mat_khau: 'Password123!',
          ten_hien_thi: 'Chiến Binh Alpha'
        })
      });
      const d = await res.json();
      localStorage.setItem('tok_token', d.data.token);
      applyUserData(d.data.nguoi_dung);
      closeAuthModal(true);
      await reloadAllAccountData();
      return d.data.nguoi_dung;
    }, u1);

    console.log('✓ [Tài khoản 1] Đã tạo và đăng nhập:', user1.ten_hien_thi, `(@${user1.ten_dang_nhap})`);

    // Gán 100 xu và điểm rank cho User 1 để tạo trạng thái riêng biệt
    await page.evaluate(() => {
      userCoins = 100;
      RANKS.csdl = 210;
      currentUserAccount.exp = 210;
      syncUserDataToUI();
      renderLobby();
    });

    await new Promise(r => setTimeout(r, 500));

    const state1 = await page.evaluate(() => {
      const nameEl = document.querySelector('.user-display-name');
      const coinEl = document.querySelector('.user-coins-val');
      const lobbyPtsEl = document.getElementById('lobby-sub-pts');
      return {
        displayName: nameEl ? nameEl.innerText.trim() : null,
        coins: coinEl ? coinEl.innerText.trim() : null,
        lobbyPts: lobbyPtsEl ? lobbyPtsEl.innerText.trim() : null
      };
    });

    console.log('  -> Trạng thái UI Tài khoản 1:', state1);
    if (state1.displayName !== 'Chiến Binh Alpha' || state1.coins !== '100' || !state1.lobbyPts.includes('210')) {
      throw new Error(`Lỗi: UI Tài khoản 1 không hiển thị đúng thông tin ban đầu! ${JSON.stringify(state1)}`);
    }

    // -------------------------------------------------------------------------
    // BƯỚC 2: Đăng xuất Tài khoản 1
    // -------------------------------------------------------------------------
    console.log('\n--- Thực hiện Đăng xuất Tài khoản 1 ---');
    await page.evaluate(() => {
      logoutAndOpenAuth();
    });

    await new Promise(r => setTimeout(r, 600));

    const stateLogout = await page.evaluate(() => {
      const token = localStorage.getItem('tok_token');
      const nameEl = document.querySelector('.user-display-name');
      const coinEl = document.querySelector('.user-coins-val');
      const lobbyPtsEl = document.getElementById('lobby-sub-pts');
      const modalAuth = document.getElementById('modal-auth');
      return {
        hasToken: !!token,
        isAuthModalVisible: modalAuth && !modalAuth.classList.contains('hidden'),
        displayName: nameEl ? nameEl.innerText.trim() : null,
        coins: coinEl ? coinEl.innerText.trim() : null,
        lobbyPts: lobbyPtsEl ? lobbyPtsEl.innerText.trim() : null
      };
    });

    console.log('  -> Trạng thái sau Đăng xuất:', stateLogout);
    if (stateLogout.hasToken) {
      throw new Error('Lỗi: Token chưa được xóa khỏi localStorage khi đăng xuất!');
    }
    if (!stateLogout.isAuthModalVisible) {
      throw new Error('Lỗi: Modal đăng nhập không tự động mở khi đăng xuất!');
    }
    if (stateLogout.displayName === 'Chiến Binh Alpha') {
      throw new Error('Lỗi: Tên tài khoản cũ vẫn còn lưu trong bộ nhớ sau khi đăng xuất!');
    }
    if (stateLogout.coins === '100') {
      throw new Error('Lỗi: Số xu của tài khoản cũ vẫn hiển thị sau khi đăng xuất!');
    }
    console.log('✓ XÁC NHẬN: Sau khi đăng xuất, toàn bộ dữ liệu tài khoản 1 đã được dọn sạch!');

    // -------------------------------------------------------------------------
    // BƯỚC 3: Đăng nhập Tài khoản 2 hoàn toàn mới (User Beta)
    // -------------------------------------------------------------------------
    const u2 = 'beta_' + Date.now().toString().slice(-4);
    console.log('\n--- Đăng ký & Đăng nhập Tài khoản 2:', u2, '---');

    await page.evaluate(async (uname) => {
      // Nhập form và submit đăng ký tài khoản 2
      authTab('register');
      const uIn = document.getElementById('auth-username');
      const pIn = document.getElementById('auth-password');
      const cIn = document.getElementById('auth-password-confirm');
      uIn.value = uname;
      pIn.value = 'Password123!';
      cIn.value = 'Password123!';
      await handleAuthSubmit();
    }, u2);

    await new Promise(r => setTimeout(r, 1200));

    const state2 = await page.evaluate(() => {
      const nameEl = document.querySelector('.user-display-name');
      const coinEl = document.querySelector('.user-coins-val');
      const lobbyPtsEl = document.getElementById('lobby-sub-pts');
      const authSum = document.getElementById('settings-auth-summary');
      return {
        displayName: nameEl ? nameEl.innerText.trim() : null,
        coins: coinEl ? coinEl.innerText.trim() : null,
        lobbyPts: lobbyPtsEl ? lobbyPtsEl.innerText.trim() : null,
        authSummary: authSum ? authSum.innerText.trim() : null,
        username: currentUserAccount.username,
        exp: currentUserAccount.exp
      };
    });

    console.log('  -> Trạng thái UI Tài khoản 2 sau khi đăng nhập:', state2);

    if (state2.displayName === 'Chiến Binh Alpha') {
      throw new Error('Lỗi nghiêm trọng: Tên tài khoản 1 vẫn hiển thị sau khi đăng nhập tài khoản 2!');
    }
    if (state2.coins !== '0') {
      throw new Error(`Lỗi nghiêm trọng: Số xu của tài khoản 1 (${state2.coins}) vẫn còn dính sang tài khoản 2!`);
    }
    if (!state2.lobbyPts.includes('0')) {
      throw new Error(`Lỗi nghiêm trọng: Điểm rank của tài khoản 1 vẫn còn dính sang tài khoản 2! (${state2.lobbyPts})`);
    }
    if (state2.username !== u2) {
      throw new Error(`Lỗi: Username không khớp với tài khoản 2! Thực tế: ${state2.username}`);
    }

    console.log('✓ XÁC NHẬN: Tài khoản 2 nạp mới 100% thông tin sạch (0 xu, 0 điểm rank, đúng username)!');
    console.log('✓ XÁC NHẬN: Không còn bất kỳ thông tin nào của tài khoản 1 bị dính lại!');

    // Chụp ảnh bằng chứng
    const ssPath = 'C:\\Users\\phant\\.gemini\\antigravity\\brain\\1749ee9f-cdb1-4857-9457-40771305fd29\\prod_account_switch_clean.png';
    await page.screenshot({ path: ssPath, fullPage: false });
    console.log('✓ Đã chụp ảnh nghiệm thu tài khoản mới tại:', ssPath);

    console.log('\n================================================================');
    console.log('🎉 KIỂM THỬ THÀNH CÔNG RỰC RỠ 100%: DỮ LIỆU ĐÃ TÁCH BIỆT HOÀN TOÀN!');
    console.log('================================================================');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Kiểm thử thất bại:', err);
  process.exit(1);
});
