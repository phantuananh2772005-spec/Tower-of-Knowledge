const puppeteer = require('puppeteer-core');
const path = require('path');

async function snapNoiCap() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));
    navTo('play');

    const sampleQ = {
      ma_cau_hoi: 'q_cds_01_01_08',
      loai_cau_hoi: 'NOI_CAP',
      noi_dung: 'Ghép thuật ngữ với định nghĩa tương ứng',
      muc_bloom: 'HIEU',
      du_lieu: {
        leftItems: [
          'Mức Quan niệm',
          'Mức Trong',
          'Mức Ngoài'
        ],
        rightItems: [
          'Toàn bộ cấu trúc logic của cơ sở dữ liệu',
          'Cách lưu trữ dữ liệu vật lý trên ổ đĩa',
          'Khung nhìn dữ liệu cho từng nhóm người dùng'
        ],
        totalPairs: 3,
        pairsMap: {
          'Mức Quan niệm': 'Toàn bộ cấu trúc logic của cơ sở dữ liệu',
          'Mức Trong': 'Cách lưu trữ dữ liệu vật lý trên ổ đĩa',
          'Mức Ngoài': 'Khung nhìn dữ liệu cho từng nhóm người dùng'
        }
      }
    };

    currentMocSession = {
      mocId: 'moc_csdl_01_01',
      tieuDe: 'Mốc 1.1',
      phase: 'PRACTICE_QUEUE',
      questionsQueue: [sampleQ],
      totalOriginalQuestions: 1,
      masteredCount: 0,
      firstAttemptCorrectCount: 0,
      failedQuestionsSet: new Set(),
      submissions: [],
      questions: [sampleQ],
      qIndex: 0
    };
    currentQuizSession = currentMocSession;

    const theoryCont = document.getElementById('play-theory-container');
    if (theoryCont) theoryCont.classList.add('hidden');
    const practiceCont = document.getElementById('play-practice-container');
    if (practiceCont) practiceCont.classList.remove('hidden');

    renderCurrentPracticeQuestion();
  });

  await new Promise(r => setTimeout(r, 600));
  const snapPath = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29/snap_duolingo_play_practice_noicap.png');
  await page.screenshot({ path: snapPath });
  console.log('✓ Snapshot NOI_CAP saved:', snapPath);
  await browser.close();
}

snapNoiCap().catch(console.error);
