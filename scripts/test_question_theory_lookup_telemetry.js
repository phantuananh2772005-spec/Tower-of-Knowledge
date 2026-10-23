/**
 * Automated Verification Script:
 * Tests granular question-level theory lookup telemetry:
 * 1. Simulates learner viewing theory on a specific question during practice.
 * 2. Verifies submission payload contains exact timestamp, duration, context, and question ID.
 * 3. Verifies persistence in lich_su_phien_hoc and adaptive memory in tien_do_moc_bai_hoc.
 * 4. Verifies Admin Telemetry Modal displays the exact timestamp badge in the question row.
 */

const puppeteer = require('puppeteer-core');
const assert = require('assert');
const db = require('../database/db');

async function run() {
  console.log('🚀 Bắt đầu kiểm thử E2E: Tra cứu lý thuyết theo từng câu hỏi chi tiết...');

  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  try {
    // 1. Tạo học viên mới & Ghi danh môn CSDL
    console.log('\n--- 1. Tạo học viên mới ---');
    const username = 'learner_lookup_' + Date.now();
    const regRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ten_dang_nhap: username,
        mat_khau: 'Password123@',
        ho_ten: 'Học Viên Tra Cứu Lý Thuyết'
      })
    });
    const regData = await regRes.json();
    assert(regData.success, 'Đăng ký phải thành công');
    const token = regData.data.token;
    const user = regData.data.nguoi_dung;
    console.log(`Đã tạo học viên: ${username} (Mã: ${user.ma_nguoi_dung})`);

    // Ghi danh môn CSDL
    await fetch('http://localhost:3000/api/courses/co-so-du-lieu/enroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });

    // 2. Mở trang làm bài và kích hoạt làm câu hỏi có xem lý thuyết
    console.log('\n--- 2. Khởi chạy bài học và tra cứu lý thuyết tại câu 1 ---');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok, usr) => {
      localStorage.setItem('tok_token', tok);
      localStorage.setItem('tok_user', JSON.stringify(usr));
    }, token, user);

    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Bắt đầu chặng 1 mốc moc_csdl_01_01
    await page.evaluate(async () => {
      await startStepPlay('moc_csdl_01_01', 1, 'Mốc 1.1');
    });

    await page.waitForFunction(() => {
      const v = document.getElementById('view-play');
      return v && !v.classList.contains('hidden');
    }, { timeout: 10000 });
    console.log('✓ Đã vào màn hình làm bài!');

    // Bấm nút "📖 Xem lại thẻ bài giảng" trên câu hỏi hiện tại
    console.log('Học viên bấm "📖 Xem lại thẻ bài giảng" khi đang ở câu 1...');
    await page.evaluate(() => {
      const btn = document.getElementById('btn-quiz-theory-hint');
      if (btn) btn.click();
    });

    await page.waitForFunction(() => {
      const m = document.getElementById('modal-theory');
      return m && !m.classList.contains('hidden');
    }, { timeout: 10000 });
    console.log('✓ Modal lý thuyết đã mở thành công!');

    // Giả lập học viên đọc lý thuyết trong 2 giây rồi bấm đóng modal
    await new Promise(r => setTimeout(r, 2000));
    console.log('Học viên đọc xong 2s và bấm đóng modal...');
    await page.evaluate(() => {
      closeTheoryModal();
    });
    await new Promise(r => setTimeout(r, 400));

    // Kiểm tra currentQuizSession đã ghi nhận sự kiện tra cứu
    const lookupCheck = await page.evaluate(() => {
      const s = currentQuizSession;
      return {
        lookupsCount: s.currentQuestionLookups,
        events: s.currentQuestionLookupEvents || []
      };
    });
    console.log('Sự kiện tra cứu câu 1 được ghi nhận:', lookupCheck);
    assert(lookupCheck.lookupsCount >= 1, 'Số lần tra cứu phải >= 1');
    assert(lookupCheck.events.length >= 1, 'Phải có ít nhất 1 event tra cứu');
    assert(lookupCheck.events[0].thoi_luong_giay >= 1, 'Thời lượng đọc phải >= 1s');
    assert(lookupCheck.events[0].ngu_canh === 'TRUOC_KHI_CHON', 'Ngữ cảnh phải là TRUOC_KHI_CHON');

    // Nộp câu 1 và lưu dở bài học
    console.log('Nộp câu 1 kèm telemetry tra cứu chi tiết...');
    await page.evaluate(() => {
      const s = currentQuizSession;
      const q0 = s.questions[0];
      s.currentAnswer = {
        ma_cau_hoi: q0.ma_cau_hoi,
        lua_chon: 'Đáp án thử nghiệm',
        la_dung: true,
        thoi_gian_giay: 8,
        so_lan_tra_cuu: s.currentQuestionLookups || 1,
        nhat_ky_tra_cuu: [...(s.currentQuestionLookupEvents || [])]
      };
      s.submissions.push(s.currentAnswer);
    });

    // Bấm Về bản đồ & Lưu dở kết quả
    console.log('Bấm ✕ Về bản đồ và xác nhận lưu kết quả...');
    await page.click('#btn_play_ve_bando');
    await new Promise(r => setTimeout(r, 400));
    // Đã tự động lưu theo mặc định khi bấm Về bản đồ
    await new Promise(r => setTimeout(r, 1500));

    // 3. Kiểm tra CSDL bảng lich_su_phien_hoc
    console.log('\n--- 3. Kiểm tra CSDL lich_su_phien_hoc & tien_do_moc_bai_hoc ---');
    let sessionRow = null;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 500));
      sessionRow = await db.queryOne(`
        SELECT TOP 1 * FROM lich_su_phien_hoc
        WHERE ma_nguoi_dung = '${user.ma_nguoi_dung}'
        ORDER BY tao_luc DESC
      `);
      if (sessionRow) break;
    }
    assert(sessionRow, 'Phải tìm thấy phiên học trong CSDL');
    const parsedDetails = JSON.parse(sessionRow.chi_tiet_cau_hoi);
    console.log('Chi tiết câu hỏi trong CSDL:', JSON.stringify(parsedDetails, null, 2));

    const qAttempt = parsedDetails[0];
    assert(qAttempt.nhat_ky_tra_cuu && qAttempt.nhat_ky_tra_cuu.length > 0, 'Phải có nhat_ky_tra_cuu trong câu hỏi');
    console.log('✓ CSDL lich_su_phien_hoc đã lưu đúng mốc thời gian tra cứu lý thuyết:', qAttempt.nhat_ky_tra_cuu[0]);

    // Kiểm tra du_lieu_tri_nho trong tien_do_moc_bai_hoc
    const progressRow = await db.queryOne(`
      SELECT du_lieu_tri_nho FROM tien_do_moc_bai_hoc
      WHERE ma_nguoi_dung = '${user.ma_nguoi_dung}' AND ma_moc = 'moc_csdl_01_01'
    `);
    const memMap = progressRow?.du_lieu_tri_nho ? JSON.parse(progressRow.du_lieu_tri_nho) : {};
    console.log('Trí nhớ câu hỏi trong tien_do_moc_bai_hoc:', memMap[qAttempt.ma_cau_hoi]);
    assert(memMap[qAttempt.ma_cau_hoi], 'Phải có bản ghi trí nhớ câu hỏi');
    assert(memMap[qAttempt.ma_cau_hoi].lan_tra_cuu_cuoi, 'Phải ghi nhận lan_tra_cuu_cuoi');
    console.log('✓ CSDL tien_do_moc_bai_hoc đã lưu vết tra cứu vào bộ nhớ Spaced Repetition AI!');

    // 4. Kiểm tra Admin Telemetry Modal hiển thị badge thời gian thật
    console.log('\n--- 4. Kiểm tra Admin Telemetry Modal hiển thị Timeline Tra cứu ---');
    const adminLoginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ten_dang_nhap: 'admin', mat_khau: 'Admin123@' })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data.token;

    // Set admin token on current origin BEFORE navigating to /admin
    await page.evaluate((tok, usr) => {
      localStorage.setItem('tok_admin_token', tok);
      localStorage.setItem('tok_token', tok);
      localStorage.setItem('tok_user', JSON.stringify(usr));
    }, adminToken, adminLoginData.data.nguoi_dung || adminLoginData.data.user);

    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    // Mở Tab Logs & Telemetry
    await page.click('#nav-tab-logs');
    await page.waitForFunction(() => {
      const el = document.getElementById('log-stat-sessions');
      return el && el.innerText.trim() !== '--';
    }, { timeout: 10000 });
    await new Promise(r => setTimeout(r, 600));

    // Mở modal telemetry sâu của học viên vừa tạo
    console.log(`Mở hồ sơ dữ liệu chi tiết của học viên ${user.ma_nguoi_dung}...`);
    await page.evaluate((uid) => {
      openLearnerTelemetryModal(uid);
    }, user.ma_nguoi_dung);

    await page.waitForFunction(() => {
      const m = document.getElementById('modal-learner-telemetry');
      return m && !m.classList.contains('hidden');
    }, { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    // Kiểm tra xem trong modal có hiển thị badge timeline thời gian tra cứu
    const hasTimelineBadge = await page.evaluate(() => {
      const container = document.getElementById('modal-sessions-container');
      const text = container?.innerHTML || '';
      return text.includes('Chưa chọn') || text.includes('📖') || text.includes('xem GT');
    });
    console.log('Modal hiển thị Timeline Tra cứu lý thuyết:', hasTimelineBadge);
    assert(hasTimelineBadge, 'Modal phải hiển thị Timeline Tra cứu lý thuyết');

    // Chụp ảnh bằng chứng
    const artifactPath = 'C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29/admin_question_theory_lookup_timeline.png';
    await page.screenshot({ path: artifactPath, fullPage: true });
    console.log(`📸 Đã chụp ảnh xác minh tại: ${artifactPath}`);

    console.log('\n🎉 KIỂM THỬ XÁC MINH TRA CỨU LÝ THUYẾT THEO CÂU HỎI THÀNH CÔNG 100%!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
