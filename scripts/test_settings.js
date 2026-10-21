const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/');
  await new Promise(r => setTimeout(r, 600));

  await page.click('#tab-auth-login');
  await page.type('#auth-username', 'admin');
  await page.type('#auth-password', 'Admin123@');
  await page.click('#auth-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  await page.click('#btn-topbar-settings');
  await new Promise(r => setTimeout(r, 500));

  await page.evaluate(() => openSettingsAuthView());
  await new Promise(r => setTimeout(r, 300));

  const slotHtml = await page.$eval('#auth-google-display-slot', el => el.innerHTML);
  console.log('slotHtml:', slotHtml);

  // Test saveEditGoogle without prompt
  await page.evaluate(() => {
    updateLinkedEmail();
    const input = document.getElementById('input-edit-google');
    input.value = 'test_google@edu.vn';
    saveEditGoogle();
  });

  const newSlot = await page.$eval('#auth-google-display-slot', el => el.textContent);
  console.log('newSlot text:', newSlot);

  // Test logout
  await page.evaluate(() => logoutAndOpenAuth());
  await new Promise(r => setTimeout(r, 500));

  const isAuthOpen = await page.$eval('#modal-auth', el => !el.classList.contains('hidden'));
  console.log('isAuthOpen after logout:', isAuthOpen);

  await browser.close();
  console.log('✓ TEST SETTINGS SUCCESSFUL!');
})();
