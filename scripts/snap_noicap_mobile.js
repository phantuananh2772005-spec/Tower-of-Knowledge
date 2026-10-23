const puppeteer = require('puppeteer-core');
const path = require('path');

async function snapMobileNoiCap() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // iPhone / standard Android mobile viewport: 375 x 720
  await page.setViewport({ width: 375, height: 720, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Simulate rendering a real NOI_CAP question on view-quiz
  await page.evaluate(() => {
    // Hide modal auth and other overlays
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));

    // Hide auth or whatever view is active, show view-play and play-practice-container
    document.querySelectorAll('section[id^="view-"]').forEach(s => s.classList.add('hidden'));
    const playView = document.getElementById('view-play');
    if (playView) playView.classList.remove('hidden');

    const theoryCont = document.getElementById('play-theory-container');
    if (theoryCont) theoryCont.classList.add('hidden');

    const practiceCont = document.getElementById('play-practice-container');
    if (practiceCont) practiceCont.classList.remove('hidden');

    const sampleQ = {
      ma_cau_hoi: 'q_cds_01_01_08',
      loai_cau_hoi: 'NOI_CAP',
      noi_dung: 'Chạm chọn 1 khái niệm bên Trái và 1 bản chất tương ứng bên Phải để ghép cặp chính xác:',
      muc_bloom: 'HIEU',
      du_lieu: {
        leftItems: [
          'Số hóa (Digitization)',
          'Tin học hóa (Informatization)',
          'Chuyển đổi số (Digital Transformation)'
        ],
        rightItems: [
          'Chuyển đổi dữ liệu vật lý sang tệp nhị phân số',
          'Ứng dụng phần mềm tự động hóa quy trình sẵn có',
          'Thay đổi tổng thể và toàn diện cách thức vận hành nhờ dữ liệu số'
        ],
        totalPairs: 3,
        pairsMap: {
          'Số hóa (Digitization)': 'Chuyển đổi dữ liệu vật lý sang tệp nhị phân số',
          'Tin học hóa (Informatization)': 'Ứng dụng phần mềm tự động hóa quy trình sẵn có',
          'Chuyển đổi số (Digital Transformation)': 'Thay đổi tổng thể và toàn diện cách thức vận hành nhờ dữ liệu số'
        }
      }
    };

    window.currentQuizSession = {
      questions: [sampleQ],
      qIndex: 0,
      isCurrentQuestionChecked: false
    };

    const qPrompt = document.getElementById('q-prompt');
    if (qPrompt) qPrompt.textContent = sampleQ.noi_dung;

    const qCounter = document.getElementById('q-counter');
    if (qCounter) qCounter.textContent = 'Câu 4/5 · Chặng 4/4';

    const qBloomTag = document.getElementById('q-bloom-tag');
    if (qBloomTag) qBloomTag.textContent = '[BLOOM: HIỂU] · [DẠNG: Nối cặp tương ứng]';

    const container = document.getElementById('q-options-container');
    if (container) {
      container.innerHTML = '';
      window.renderNoiCapUI(sampleQ, container);
    }
  });

  await new Promise(r => setTimeout(r, 600));

  const artifactDir = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29');
  const snapPath1 = path.join(artifactDir, 'snap_cds_noicap_mobile_init.png');
  await page.screenshot({ path: snapPath1 });
  console.log('Saved initial mobile screenshot to:', snapPath1);

  // Simulate tapping first left item and then matching right item
  await page.evaluate(() => {
    const leftBtn = document.getElementById('btn_noicap_left_0');
    if (leftBtn) leftBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  const snapPath2 = path.join(artifactDir, 'snap_cds_noicap_mobile_selected.png');
  await page.screenshot({ path: snapPath2 });
  console.log('Saved selected mobile screenshot to:', snapPath2);

  // Click corresponding right item to match
  await page.evaluate(() => {
    const rightBtn = document.getElementById('btn_noicap_right_0');
    if (rightBtn) rightBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const snapPath3 = path.join(artifactDir, 'snap_cds_noicap_mobile_matched.png');
  await page.screenshot({ path: snapPath3 });
  console.log('Saved matched mobile screenshot to:', snapPath3);

  await browser.close();
}

snapMobileNoiCap().catch(err => {
  console.error(err);
  process.exit(1);
});
