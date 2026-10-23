const puppeteer = require('puppeteer-core');
const path = require('path');

async function testCasualLobbyParty() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Open casual arena lobby
  await page.evaluate(() => {
    // Hide modals
    document.querySelectorAll('.fixed, [id^="modal-"]').forEach(m => m.classList.add('hidden'));

    // Switch to view-minigame
    if (typeof navTo === 'function') {
      navTo('minigame');
    } else {
      document.querySelectorAll('section[id^="view-"]').forEach(s => s.classList.add('hidden'));
      const mgView = document.getElementById('view-minigame');
      if (mgView) mgView.classList.remove('hidden');
    }

    // Select casual mode
    if (typeof selectArenaMode === 'function') {
      selectArenaMode('casual');
    }
  });

  await new Promise(r => setTimeout(r, 600));

  const artifactDir = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29');
  const snap1 = path.join(artifactDir, 'snap_casual_lobby_empty.png');
  await page.screenshot({ path: snap1 });
  console.log('Saved empty casual lobby screenshot:', snap1);

  // Now trigger inviting bot/friend into the [+] slot
  await page.evaluate(() => {
    if (typeof addBotToCasualParty === 'function') {
      addBotToCasualParty();
    }
  });

  await new Promise(r => setTimeout(r, 500));

  const snap2 = path.join(artifactDir, 'snap_casual_lobby_partner_ready.png');
  await page.screenshot({ path: snap2 });
  console.log('Saved partner ready screenshot:', snap2);

  // Also test typing code into input and submitting
  await page.evaluate(() => {
    const input = document.getElementById('input_casual_room_code');
    if (input) input.value = 'TOK-8842';
    if (typeof joinCasualFriendRoom === 'function') {
      joinCasualFriendRoom();
    }
  });

  await new Promise(r => setTimeout(r, 500));
  const snap3 = path.join(artifactDir, 'snap_casual_lobby_joined_code.png');
  await page.screenshot({ path: snap3 });
  console.log('Saved joined code screenshot:', snap3);

  await browser.close();
}

testCasualLobbyParty().catch(err => {
  console.error(err);
  process.exit(1);
});
