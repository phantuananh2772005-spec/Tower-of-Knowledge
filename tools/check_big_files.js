const fs = require('fs');
const path = require('path');

function findBigFiles(dir) {
  fs.readdirSync(dir).forEach(f => {
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      findBigFiles(fp);
    } else {
      if (stat.size > 5 * 1024 * 1024) {
        console.log(`Big file: ${fp} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
      }
    }
  });
}

findBigFiles(path.join(__dirname, '../public/assets'));
console.log('Done scanning big files.');
