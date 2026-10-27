const fs = require('fs');
const path = require('path');
const vm = require('vm');

['public/index.html', 'public/pet-gallery.html'].forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  const html = fs.readFileSync(fullPath, 'utf8');
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
      console.error(`[${relPath}] Script #${count} error:`, err.message);
      errors++;
    }
  }

  console.log(`[${relPath}] Validated ${count} inline script blocks. Total syntax errors: ${errors}`);
});
