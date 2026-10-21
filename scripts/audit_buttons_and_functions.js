const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
const content = fs.readFileSync(htmlPath, 'utf8');

console.log('================================================================');
console.log('🔍 AUDITING BUTTONS, IDS, AND JS FUNCTIONS IN public/index.html');
console.log('================================================================');

// 1. Audit Buttons
const buttonRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
let bMatch;
const buttons = [];
while ((bMatch = buttonRegex.exec(content)) !== null) {
  const attrs = bMatch[1];
  const body = bMatch[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
  const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
  const clickMatch = attrs.match(/\bonclick=["']([^"']+)["']/i);
  buttons.push({
    id: idMatch ? idMatch[1] : '(NO ID)',
    onclick: clickMatch ? clickMatch[1] : '(NO ONCLICK)',
    text: body.substring(0, 30)
  });
}
console.log(`Total <button> elements found: ${buttons.length}`);

// 2. Audit Functions in scripts
const funcRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(/g;
let fMatch;
const allFunctions = new Set();
while ((fMatch = funcRegex.exec(content)) !== null) {
  allFunctions.add(fMatch[1]);
}
console.log(`Total functions defined in scripts: ${allFunctions.size}`);

// 3. Check for Orphaned Functions (never called in HTML and only defined once in JS)
const orphanedFunctions = [];
for (const fn of allFunctions) {
  // Check occurrences of fn in content
  const regex = new RegExp(`\\b${fn}\\b`, 'g');
  const count = (content.match(regex) || []).length;
  // If count is 1, it's defined and never referenced anywhere!
  if (count <= 1) {
    orphanedFunctions.push({ name: fn, count });
  }
}

console.log('\n--- ORPHANED FUNCTIONS (Defined but never called) ---');
if (orphanedFunctions.length === 0) {
  console.log('✓ ZERO orphaned functions!');
} else {
  orphanedFunctions.forEach(o => console.log(`  ⚠️ Function "${o.name}" (Count: ${o.count})`));
}

// 4. Buttons without ID
const buttonsWithoutId = buttons.filter(b => b.id === '(NO ID)');
console.log(`\n--- BUTTONS WITHOUT ID (${buttonsWithoutId.length}) ---`);
buttonsWithoutId.slice(0, 15).forEach((b, i) => {
  console.log(`  ${i+1}. onclick="${b.onclick}" text="${b.text}"`);
});

// 5. Check for any demo/showcase leftovers
console.log('\n--- CHECKING LEFTOVER DEMO / MOCK STRINGS ---');
const demoKeywords = ['showcase', 'demo_app', 'battle_results_showcase', '1285 điểm', '2382 pt', '1,320 pt'];
demoKeywords.forEach(kw => {
  const count = (content.match(new RegExp(kw, 'gi')) || []).length;
  console.log(`  Keyword "${kw}": ${count} occurrences`);
});
