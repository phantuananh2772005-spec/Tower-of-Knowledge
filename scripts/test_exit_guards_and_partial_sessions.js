/**
 * E2E Verification Test:
 * 1. Partial Session Telemetry Save when user exits quiz midway.
 * 2. 1v1 Battle Leave Guard (Modal warning & forfeit on leaving).
 * 3. Verify Admin Telemetry displays partial session badge.
 */

const puppeteer = require('puppeteer-core');
const assert = require('assert');
const db = require('../database/db');

async function run() {
  console.log('🚀 Bắt đầu kiểm thử E2E: Thoát học dở lưu lịch sử & Chặn rời trận PK 1v1...');

  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // -------------------------------------------------------------
    // TEST 1: Đăng ký & Đăng nhập học viên, làm dở bài mốc 1.1
    // -------------------------------------------------------------
    console.log('\n--- 1. Tạo học viên mới và làm dở bài mốc 1.1 ---');
    const testUsername = 'learner_e2e_' + Date.now();
    const testPassword = 'Password123@';

    const regRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ten_dang_nhap: testUsername,
        mat_khau: testPassword,
        ho_ten: 'Học Viên E2E Thoát Dở'
      })
    });
    const regData = await regRes.json();
    assert(regData.success, 'Đăng ký tài khoản thử nghiệm phải thành công');
    const userToken = regData.data.token;
    const userData = regData.data.nguoi_dung;
    console.log(`Đã tạo học viên: ${testUsername} (Mã: ${userData.ma_nguoi_dung})`);

    // Ghi danh môn Cơ sở Dữ liệu để mở khóa mốc đầu tiên
    await fetch('http://localhost:3000/api/courses/co-so-du-lieu/enroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      }
    });
    console.log('Đã ghi danh khóa học Cơ sở Dữ liệu thành công!');

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

    // Lưu token vào localStorage của page
    await page.evaluate((tok, usr) => {
      localStorage.setItem('tok_token', tok);
      localStorage.setItem('tok_user', JSON.stringify(usr));
    }, userToken, userData);

    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    // Mở mốc 1.1 và bắt đầu Chặng 1
    console.log('Khởi chạy chặng 1 mốc moc_csdl_01_01...');
    await page.evaluate(async () => {
      await startStepPlay('moc_csdl_01_01', 1, 'Mốc 1.1');
    });

    // Chờ view-play xuất hiện
    await page.waitForFunction(() => {
      const v = document.getElementById('view-play');
      return v && !v.classList.contains('hidden');
    }, { timeout: 10000 });
    console.log('✓ Đã vào màn hình play học mốc!');

    // Ghi nhận học viên đã làm được 2 câu hỏi dở dang
    console.log('Học viên đang làm dở 2 câu hỏi trong bước học...');
    await page.evaluate(() => {
      const q0 = currentQuizSession.questions[0];
      const q1 = currentQuizSession.questions[1];
      currentQuizSession.submissions.push({
        ma_cau_hoi: q0.ma_cau_hoi,
        lua_chon: 'Tra loi dung thu nghiem',
        la_dung: true,
        thoi_gian_giay: 9,
        so_lan_tra_cuu: 1
      });
      currentQuizSession.submissions.push({
        ma_cau_hoi: q1.ma_cau_hoi,
        lua_chon: 0,
        la_dung: false,
        thoi_gian_giay: 15,
        so_lan_tra_cuu: 2
      });
    });

    // Kiểm tra currentQuizSession đã ghi nhận 2 submissions
    const subCount = await page.evaluate(() => {
      return currentQuizSession?.submissions?.length || 0;
    });
    console.log(`Số câu hỏi đã hoàn thành trong phiên: ${subCount}`);
    assert(subCount >= 2, 'Phải có ít nhất 2 câu hỏi đã nộp');

    // Bấm nút "✕ Về bản đồ" khi bài học chưa hoàn tất
    console.log('Bấm nút "✕ Về bản đồ" khi đang làm dở bài tập...');
    await page.click('#btn_play_ve_bando');
    await new Promise(r => setTimeout(r, 600));

    // Kiểm tra modal tạm dừng học xuất hiện
    const isQuitModalVisible = await page.evaluate(() => {
      const m = document.getElementById('modal-confirm-quit-quiz');
      return m && !m.classList.contains('hidden');
    });
    console.log('✓ Modal xác nhận tạm dừng học hiển thị:', isQuitModalVisible);
    assert(isQuitModalVisible, 'Modal tạm dừng học phải hiển thị');

    // Bấm nút "💾 Lưu kết quả & Về bản đồ"
    console.log('Bấm "💾 Lưu kết quả & Về bản đồ"...');
    await page.click('#btn_confirm_quit_save');

    // Chờ lưu vào CSDL (polling)
    let savedPartialLog = null;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 500));
      savedPartialLog = await db.queryOne(`
        SELECT TOP 1 * FROM lich_su_phien_hoc
        WHERE ma_nguoi_dung = '${userData.ma_nguoi_dung}' AND loai_phien = 'DUOLINGO_STEP_PARTIAL'
        ORDER BY tao_luc DESC
      `);
      if (savedPartialLog) break;
    }
    console.log('Bản ghi lưu dở trong CSDL:', savedPartialLog ? {
      ma_phien: savedPartialLog.ma_phien,
      loai_phien: savedPartialLog.loai_phien,
      buoc_so: savedPartialLog.buoc_so,
      thoi_gian: savedPartialLog.thoi_gian_tong_giay,
      ti_le_dung: savedPartialLog.ti_le_chinh_xac
    } : 'None');
    assert(savedPartialLog, 'Phải tìm thấy bản ghi DUOLINGO_STEP_PARTIAL của người dùng trong CSDL');
    console.log('✓ TEST 1 THÀNH CÔNG: Thoát học dở đã lưu toàn bộ telemetry vào CSDL!');

    // -------------------------------------------------------------
    // TEST 2: Đấu trường 1v1 Arena Navigation Guard & Warning Modal
    // -------------------------------------------------------------
    console.log('\n--- 2. Kiểm tra Navigation Guard khi đang PK 1v1 ---');

    // Khởi tạo trận đấu bot qua API
    console.log('Khởi tạo trận đấu 1v1 với Bot...');
    const botMatchRes = await fetch('http://localhost:3000/api/arena/create-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify({ ma_mon: 'mon_csdl', doi_thu_id: 'usr_bot_003' })
    });
    const botMatchData = await botMatchRes.json();
    assert(botMatchData.success, 'Khởi tạo trận bot phải thành công');
    const matchId = botMatchData.data.ma_tran;
    console.log(`Đã tạo trận đấu 1v1 ID: ${matchId}`);

    // Thiết lập trạng thái trận đấu trên client
    await page.evaluate((m) => {
      currentLiveMatch = m;
      B.over = false;
      B.my = 100;
      B.op = 100;
      B.qi = 0;
      B.list = m.cau_hoi || [];
      navTo('battle');
    }, botMatchData.data);
    await new Promise(r => setTimeout(r, 600));

    // Kiểm tra đang ở màn hình battle
    const isBattleActive = await page.evaluate(() => {
      const v = document.getElementById('view-battle');
      return v && !v.classList.contains('hidden') && currentLiveMatch && !B.over;
    });
    console.log('Trận đấu battle đang diễn ra:', isBattleActive);
    assert(isBattleActive, 'Phải đang trong trận đấu battle');

    // Người chơi thử bấm vào Sidebar "Bản đồ leo tháp" (#nav-saga)
    console.log('Người chơi bấm vào menu Sidebar "Bản đồ leo tháp" khi đang PK...');
    await page.click('#nav-saga');
    await new Promise(r => setTimeout(r, 600));

    // Kiểm tra CHẶN chuyển trang: vẫn ở view-battle và hiển thị #modal-leave-battle-warning!
    const guardCheck = await page.evaluate(() => {
      const battleView = document.getElementById('view-battle');
      const sagaView = document.getElementById('view-saga');
      const warningModal = document.getElementById('modal-leave-battle-warning');
      return {
        battleHidden: battleView.classList.contains('hidden'),
        sagaHidden: sagaView.classList.contains('hidden'),
        modalVisible: warningModal && !warningModal.classList.contains('hidden')
      };
    });
    console.log('Trạng thái Guard khi bấm rời trang:', guardCheck);
    assert(!guardCheck.battleHidden, 'Vẫn phải giữ ở màn hình battle (không được tự ý chuyển view)');
    assert(guardCheck.sagaHidden, 'Màn hình saga vẫn phải bị ẩn');
    assert(guardCheck.modalVisible, 'Modal cảnh báo rời trận đấu (#modal-leave-battle-warning) PHẢI xuất hiện');
    console.log('✓ CHẶN RỜI TRẬN THÀNH CÔNG: Đã hiển thị popup cảnh báo tính thua!');

    // Thử bấm "Ở lại chiến đấu"
    console.log('Người chơi chọn "Ở lại chiến đấu"...');
    await page.click('#btn_cancel_leave_battle');
    await new Promise(r => setTimeout(r, 400));
    const modalClosed = await page.evaluate(() => {
      const warningModal = document.getElementById('modal-leave-battle-warning');
      return warningModal.classList.contains('hidden');
    });
    assert(modalClosed, 'Modal phải đóng khi người chơi chọn tiếp tục ở lại chiến đấu');
    console.log('✓ Đã giữ lại trận đấu mượt mà.');

    // Giờ người chơi bấm chuyển sang trang Kho môn học (#nav-catalog) và chấp nhận xử thua
    console.log('Người chơi bấm "Kho môn học" (#nav-catalog) và chấp nhận xử thua để rời đi...');
    await page.click('#nav-catalog');
    await new Promise(r => setTimeout(r, 400));
    await page.click('#btn_confirm_leave_battle');
    // Chờ trận đấu được cập nhật thành KET_THUC trong CSDL (polling)
    let matchRecord = null;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 500));
      matchRecord = await db.queryOne(`
        SELECT * FROM tran_dau_1v1
        WHERE ma_tran = '${matchId}'
      `);
      if (matchRecord && matchRecord.trang_thai === 'KET_THUC') break;
    }
    console.log('Kết quả trận đấu trong CSDL sau khi rời:', matchRecord ? {
      ma_tran: matchRecord.ma_tran,
      trang_thai: matchRecord.trang_thai,
      ly_do_ket_thuc: matchRecord.ly_do_ket_thuc,
      nguoi_thang_cuoc: matchRecord.nguoi_thang_cuoc
    } : 'None');
    assert(matchRecord && matchRecord.trang_thai === 'KET_THUC', 'Trận đấu phải kết thúc');
    assert(matchRecord.ly_do_ket_thuc === 'DAU_HANG', 'Lý do kết thúc phải là DAU_HANG');
    assert(matchRecord.nguoi_thang_cuoc !== userData.ma_nguoi_dung, 'Đối thủ phải được tính thắng cuộc');

    // Kiểm tra view hiện tại đã chuyển sang catalog
    const isCatalogVisible = await page.evaluate(() => {
      const c = document.getElementById('view-catalog');
      return c && !c.classList.contains('hidden');
    });
    console.log('Đã chuyển sang màn hình catalog an toàn:', isCatalogVisible);
    assert(isCatalogVisible, 'Phải chuyển sang catalog sau khi xác nhận xử thua');
    console.log('✓ TEST 2 THÀNH CÔNG: Xử phạt rời trận nhận thua (DAU_HANG) chính xác 100%!');

    // -------------------------------------------------------------
    // TEST 3: Kiểm tra Admin Telemetry Hub hiển thị bản ghi lưu dở
    // -------------------------------------------------------------
    console.log('\n--- 3. Kiểm tra Admin Telemetry Hub hiển thị bản ghi lưu dở ---');
    // Login Admin
    const adminLoginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ten_dang_nhap: 'admin', mat_khau: 'Admin123@' })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data.token;

    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok, usr) => {
      localStorage.setItem('tok_admin_token', tok);
      localStorage.setItem('tok_token', tok);
      localStorage.setItem('tok_user', JSON.stringify(usr));
    }, adminToken, adminLoginData.data.nguoi_dung || adminLoginData.data.user);

    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Mở Tab 5: Nhật ký & Dữ liệu làm bài (#nav-tab-logs)
    await page.click('#nav-tab-logs');
    await page.waitForFunction(() => {
      const el = document.getElementById('log-stat-sessions');
      return el && el.innerText.trim() !== '--';
    }, { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    // Kiểm tra có badge "Tạm Dừng (Lưu Dở)" trong bảng Recent Activities
    const hasPartialBadge = await page.evaluate(() => {
      const rows = document.getElementById('table-recent-activities')?.innerHTML || '';
      return rows.includes('Tạm Dừng (Lưu Dở)');
    });
    console.log('Admin Hub hiển thị badge Tạm Dừng (Lưu Dở):', hasPartialBadge);
    assert(hasPartialBadge, 'Admin Hub phải hiển thị badge Tạm Dừng (Lưu Dở)');

    // Chụp ảnh bằng chứng
    const artifactPath = 'C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29/admin_telemetry_partial_and_guard.png';
    await page.screenshot({ path: artifactPath, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp xác minh tại: ${artifactPath}`);

    console.log('\n🎉 TOÀN BỘ CÁC KIỂM THỬ XÁC MINH ĐỀU ĐẠT 100%!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
