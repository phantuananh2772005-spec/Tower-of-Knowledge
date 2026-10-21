const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const parts = html.split('<script');
console.log('Found parts:', parts.length - 1);
for (let i = 1; i < parts.length; i++) {
  const endTag = parts[i].indexOf('</script>');
  if (endTag === -1) continue;
  const chunk = parts[i].substring(0, endTag);
  const codeStart = chunk.indexOf('>') + 1;
  const code = chunk.substring(codeStart);
  if (!code.trim()) {
    console.log(`Script ${i}: External script`);
    continue;
  }
  try {
    new vm.Script(code);
    console.log(`Script ${i}: VALID JS (${code.length} chars)`);
  } catch(e) {
    console.error(`Script ${i} SYNTAX ERROR:`, e.message);
  }
}
