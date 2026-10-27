const fs = require('fs');
const path = require('path');

const petsDir = path.join(__dirname, '../public/assets/pets');
if (fs.existsSync(petsDir)) {
  let totalSheetBytes = 0;
  let totalRawBytes = 0;
  fs.readdirSync(petsDir).forEach(p => {
    const sheetDir = path.join(petsDir, p, '03_spritesheet');
    if (fs.existsSync(sheetDir)) {
      fs.readdirSync(sheetDir).forEach(f => {
        totalSheetBytes += fs.statSync(path.join(sheetDir, f)).size;
      });
    }
    const rawDir = path.join(petsDir, p, '01_raw_frames');
    if (fs.existsSync(rawDir)) {
      function walk(dir) {
        fs.readdirSync(dir).forEach(f => {
          const fp = path.join(dir, f);
          if (fs.statSync(fp).isDirectory()) walk(fp);
          else totalRawBytes += fs.statSync(fp).size;
        });
      }
      walk(rawDir);
    }
  });
  console.log(`03_spritesheet runtime size: ${(totalSheetBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`01_raw_frames raw size: ${(totalRawBytes / (1024 * 1024)).toFixed(2)} MB`);
}
