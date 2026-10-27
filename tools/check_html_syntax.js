const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '../public/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptRegex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let errors = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const code = match[1];
  try {
    new vm.Script(code);
  } catch (err) {
    console.error(`Script #${count} error:`, err.message);
    errors++;
  }
}

console.log(`Validated ${count} inline script blocks. Total syntax errors: ${errors}`);
