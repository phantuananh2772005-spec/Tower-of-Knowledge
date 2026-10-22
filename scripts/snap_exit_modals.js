const puppeteer = require('puppeteer-core');

async function snap() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1. Quitting quiz modal snapshot with student user
  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ten_dang_nhap: 'snap_' + Date.now(), mat_khau: '123456', ho_ten: 'Snap User' })
  });
  const regData = await regRes.json();
  const token = regData.data.token;
  const user = regData.data.nguoi_dung;

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((tok, usr) => {
    localStorage.setItem('tok_token', tok);
    localStorage.setItem('tok_user', JSON.stringify(usr));
  }, token, user);

  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Open quit quiz modal
  await page.evaluate(() => {
    currentQuizSession = {
      mocId: 'moc_csdl_01_01',
      step: 1,
      tieuDe: 'Mốc 1.1: Khái niệm CSDL & Các Mức Trừu Tượng Dữ Liệu',
      submissions: [{ ma: 1 }, { ma: 2 }]
    };
    openQuitQuizModal();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29/modal_quit_quiz_partial_save.png' });

  // 2. Battle warning modal snapshot
  await page.evaluate(() => {
    closeQuitQuizModal();
    currentQuizSession = null;
    navTo('battle');
    openLeaveBattleWarningModal();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29/modal_leave_battle_warning.png' });

  await browser.close();
  console.log('Screenshots captured successfully for student UI!');
}

snap().catch(console.error);
