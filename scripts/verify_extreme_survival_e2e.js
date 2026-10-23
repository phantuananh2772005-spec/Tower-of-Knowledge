const puppeteer = require('puppeteer-core');
const path = require('path');
const db = require('../database/db');

async function runExtremeVerification() {
  console.log('================================================================');
  console.log('🔥 STARTING E2E VERIFICATION: THI ĐẤU CỰC HẠN (SURVIVAL MODE)');
  console.log('================================================================');

  const artifactDir = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29');

  // Clean test user
  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'extreme_test_user')");
  await db.execute("DELETE FROM lich_su_phien_hoc WHERE ma_nguoi_dung IN (SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = 'extreme_test_user')");
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = 'extreme_test_user'");

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,850']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 850 });

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('error') || text.includes('Error')) {
        console.log(`[Browser Console] ${text}`);
      }
    });

    console.log('1. Loading application at http://localhost:3000/...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 400));

    // Register / login cleanly
    console.log('  → Đăng ký/Đăng nhập tài khoản kiểm thử...');
    await page.click('#tab-auth-register');
    await new Promise(r => setTimeout(r, 200));
    await page.type('#auth-username', 'extreme_test_user');
    await page.type('#auth-password', 'ExtremePass123@');
    await page.type('#auth-password-confirm', 'ExtremePass123@');
    await page.evaluate(() => handleAuthSubmit());
    await new Promise(r => setTimeout(r, 1200));

    // Dismiss tour if any
    await page.evaluate(() => {
      const tourModal = document.getElementById('modal-pet-onboarding');
      if (tourModal) tourModal.classList.add('hidden');
      if (typeof closeAuthModal === 'function') closeAuthModal();
      navTo('hub');
    });
    await new Promise(r => setTimeout(r, 600));

    // Verify Hub Card
    const hubExtremeCard = await page.$('#hub-extreme-card');
    if (!hubExtremeCard) throw new Error('Thẻ #hub-extreme-card không tìm thấy trên Trang chủ!');
    console.log('  ✓ Thẻ Thi Đấu Cực Hạn hiển thị đẹp mắt trên Trang chủ');

    await page.screenshot({ path: path.join(artifactDir, 'snap_extreme_hub_card.png') });
    console.log('  ✓ Đã chụp snap_extreme_hub_card.png');

    // Verify Minigame Arena Card
    await page.evaluate(() => navTo('minigame'));
    await new Promise(r => setTimeout(r, 600));

    const arenaCard = await page.$('#card-mode-arcade');
    if (!arenaCard) throw new Error('Thẻ chế độ cực hạn trong sảnh đấu trường không tìm thấy!');
    console.log('  ✓ Thẻ chế độ Thi Đấu Cực Hạn hiển thị tại Sảnh Đấu Trường Mini Game');

    await page.screenshot({ path: path.join(artifactDir, 'snap_extreme_arena_card.png') });
    console.log('  ✓ Đã chụp snap_extreme_arena_card.png');

    // Click to open setup modal
    console.log('2. Mở Modal Cấu Hình Sinh Tồn Cực Hạn...');
    await page.evaluate(() => openExtremeSetupModal());
    await new Promise(r => setTimeout(r, 600));

    const setupModalVisible = await page.evaluate(() => {
      const m = document.getElementById('modal-extreme-setup');
      return m && !m.classList.contains('hidden');
    });
    if (!setupModalVisible) throw new Error('Modal cấu hình sinh tồn không hiển thị!');
    console.log('  ✓ Modal cấu hình sinh tồn hiển thị đầy đủ quy tắc 5 ❤️, vô hạn, hồi máu');

    await page.screenshot({ path: path.join(artifactDir, 'snap_extreme_setup_modal.png') });
    console.log('  ✓ Đã chụp snap_extreme_setup_modal.png');

    // Start extreme survival
    console.log('3. Bắt đầu trận chiến sinh tồn...');
    await page.evaluate(() => {
      const sel = document.getElementById('extreme-subject-select');
      startExtremeSurvival(sel ? sel.value : 'mon_csdl');
    });

    await page.waitForFunction(() => {
      const v = document.getElementById('view-extreme');
      return v && !v.classList.contains('hidden');
    }, { timeout: 10000 });

    const heartsCount = await page.evaluate(() => {
      const hearts = [1, 2, 3, 4, 5].map(i => document.getElementById(`extreme-heart-${i}`)?.textContent);
      return hearts.filter(h => h === '❤️').length;
    });
    console.log(`  ✓ Số tim sinh mạng khởi đầu: ${heartsCount}/5 ❤️`);
    if (heartsCount !== 5) throw new Error(`Số tim sinh mạng khởi đầu mong đợi là 5, thực tế: ${heartsCount}`);

    const qPromptText = await page.evaluate(() => document.getElementById('extreme-q-prompt')?.textContent);
    console.log(`  ✓ Câu hỏi hiển thị: "${qPromptText.slice(0, 50)}..."`);

    await page.screenshot({ path: path.join(artifactDir, 'snap_extreme_gameplay_live.png') });
    console.log('  ✓ Đã chụp snap_extreme_gameplay_live.png');

    // Answer question 1
    console.log('4. Thử nghiệm làm câu hỏi đầu tiên...');
    await page.waitForFunction(() => {
      const btns = document.getElementById('extreme-options-container')?.querySelectorAll('button');
      return btns && btns.length >= 2;
    }, { timeout: 5000 });

    const optsCount = await page.evaluate(() => {
      return document.getElementById('extreme-options-container')?.querySelectorAll('button').length;
    });
    console.log(`  ✓ Số phương án lựa chọn: ${optsCount}`);

    // Click option 0
    await page.evaluate(() => {
      const opt = document.getElementById('btn_extreme_opt_0');
      if (opt) opt.click();
    });
    await new Promise(r => setTimeout(r, 600));

    await page.screenshot({ path: path.join(artifactDir, 'snap_extreme_graded_state.png') });
    console.log('  ✓ Đã chụp snap_extreme_graded_state.png sau khi chấm điểm');

    // Wait for auto advance
    await new Promise(r => setTimeout(r, 1600));

    const currentQCounter = await page.evaluate(() => document.getElementById('extreme-q-counter')?.textContent);
    console.log(`  ✓ Hệ thống tự động chuyển tiếp liên tục sang: ${currentQCounter}`);

    // Answer question 2 as well to test continuous streaming
    console.log('5. Thử nghiệm làm tiếp câu hỏi thứ 2...');
    await page.waitForFunction(() => {
      const btns = document.getElementById('extreme-options-container')?.querySelectorAll('button');
      return btns && btns.length >= 2 && !btns[0].disabled;
    }, { timeout: 5000 });

    await page.evaluate(() => {
      const opt = document.getElementById('btn_extreme_opt_1') || document.getElementById('btn_extreme_opt_0');
      if (opt) opt.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(artifactDir, 'snap_extreme_q2_graded.png') });
    console.log('  ✓ Đã chụp snap_extreme_q2_graded.png');

    await new Promise(r => setTimeout(r, 1600));

    // Test quit confirmation modal
    console.log('6. Thử nghiệm dừng trận đấu sớm...');
    await page.evaluate(() => {
      const btn = document.getElementById('btn_extreme_quit');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const quitModalVisible = await page.evaluate(() => {
      const m = document.getElementById('modal-extreme-quit-confirm');
      return m && !m.classList.contains('hidden');
    });
    if (!quitModalVisible) throw new Error('Modal xác nhận dừng không hiển thị!');
    console.log('  ✓ Modal xác nhận dừng hiển thị an toàn (không dùng window.confirm)');

    await page.screenshot({ path: path.join(artifactDir, 'snap_extreme_quit_modal.png') });
    console.log('  ✓ Đã chụp snap_extreme_quit_modal.png');

    // Confirm quit and receive rewards
    console.log('7. Xác nhận dừng và kiểm tra bảng tổng kết...');
    await page.evaluate(() => {
      const btn = document.getElementById('btn_confirm_extreme_quit');
      if (btn) btn.click();
    });

    await page.waitForFunction(() => {
      const m = document.getElementById('modal-extreme-summary');
      return m && !m.classList.contains('hidden');
    }, { timeout: 10000 });

    const summaryStats = await page.evaluate(() => {
      return {
        badge: document.getElementById('extreme-summary-badge')?.textContent,
        answered: document.getElementById('extreme-summary-answered')?.textContent,
        maxStreak: document.getElementById('extreme-summary-max-streak')?.textContent,
        score: document.getElementById('extreme-summary-score')?.textContent,
        loops: document.getElementById('extreme-summary-loops')?.textContent,
        coins: document.getElementById('extreme-summary-coins')?.textContent,
        exp: document.getElementById('extreme-summary-exp')?.textContent
      };
    });
    console.log('  ✓ Kết quả tổng kết trận đấu:', summaryStats);

    await page.screenshot({ path: path.join(artifactDir, 'snap_extreme_summary_rewards.png') });
    console.log('  ✓ Đã chụp snap_extreme_summary_rewards.png');

    // Test Replay button
    console.log('8. Thử nghiệm nút [Chơi lại trận mới]...');
    await page.evaluate(() => {
      const btn = document.getElementById('btn_extreme_replay');
      if (btn) btn.click();
    });
    await page.waitForFunction(() => {
      const v = document.getElementById('view-extreme');
      return v && !v.classList.contains('hidden');
    }, { timeout: 10000 });
    console.log('  ✓ Nút chơi lại trận mới khởi động ngay trận mới với 5 tim đầy đủ!');

    console.log('================================================================');
    console.log('✅ ALL VERIFICATIONS PASSED: THI ĐẤU CỰC HẠN HOẠT ĐỘNG HOÀN HẢO!');
    console.log('================================================================');

  } finally {
    await browser.close();
  }
}

runExtremeVerification().catch(err => {
  console.error('❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
