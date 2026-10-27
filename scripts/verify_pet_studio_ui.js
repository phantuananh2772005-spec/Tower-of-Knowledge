const puppeteer = require('puppeteer-core');
const path = require('path');

async function testPetStudio() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const artifactDir = path.resolve('C:/Users/phant/.gemini/antigravity/brain/1749ee9f-cdb1-4857-9457-40771305fd29');

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log('Navigating to http://127.0.0.1:3000/pet-studio.html...');
    await page.goto('http://127.0.0.1:3000/pet-studio.html', { waitUntil: 'load', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1500));

    // Wait for video list to populate
    await page.waitForSelector('#select-video option', { timeout: 5000 });

    // Click Preview button
    console.log('Triggering Preview...');
    await page.click('#btn-preview-step');
    await new Promise(r => setTimeout(r, 2000));

    // Draw a small protection brush stroke on the source canvas
    console.log('Drawing protection stroke...');
    const canvasHandle = await page.$('#canvas-source');
    const box = await canvasHandle.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2 + 20);
      await page.mouse.up();
    }
    await new Promise(r => setTimeout(r, 500));

    // Click Export Pack button
    console.log('Triggering Export Pack...');
    await page.click('#btn-export-pack');
    await new Promise(r => setTimeout(r, 4000));

    // Capture screenshot of the full studio
    const snapStudio = path.join(artifactDir, 'snap_pet_sprite_studio.png');
    await page.screenshot({ path: snapStudio, fullPage: true });
    console.log('✓ Captured Pet Sprite Studio UI:', snapStudio);

    // Also select Cell 6 (Frostfang Wolf with Gemini watermark removal) and export
    console.log('Testing Cell 6 (Frostfang Wolf)...');
    await page.click('#btn-cell-6');
    await new Promise(r => setTimeout(r, 2000));
    await page.click('#btn-export-pack');
    await new Promise(r => setTimeout(r, 4500));

    const snapStudioCell6 = path.join(artifactDir, 'snap_pet_sprite_studio_wolf.png');
    await page.screenshot({ path: snapStudioCell6, fullPage: true });
    console.log('✓ Captured Cell 6 Wolf Export:', snapStudioCell6);

  } finally {
    await browser.close();
  }
}

testPetStudio().catch(err => {
  console.error(err);
  process.exit(1);
});
