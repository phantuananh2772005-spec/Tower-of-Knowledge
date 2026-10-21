const fs = require('fs');

const indexHtml = fs.readFileSync('public/index.html', 'utf8');
const adminHtml = fs.readFileSync('public/admin/index.html', 'utf8');

console.log('================================================================');
console.log('AUDITING PUBLIC/INDEX.HTML FOR HARDCODED MOCK / FAKE DATA');
console.log('================================================================');

// 1. Check for specific fake names or placeholders
const fakeIndicators = [
  'Nguyễn Văn A',
  'questionsPool',
  'BQ =',
  'OPS =',
  'RANK_DATA =',
  'currentUserAccount =',
  '1260',
  '2924',
  '1744',
  'Tập sự SQL (Level 3)',
  '5 ngày liên tiếp',
  'Đã qua 2/6 mốc',
  'Cơ sở dữ liệu nâng cao',
  'Cấu trúc Dữ liệu & Giải thuật'
];

fakeIndicators.forEach(ind => {
  let count = 0;
  let pos = indexHtml.indexOf(ind);
  while (pos !== -1) {
    count++;
    pos = indexHtml.indexOf(ind, pos + 1);
  }
  console.log(`- Indicator "${ind}": ${count} occurrence(s)`);
});

// 2. Inspect view-hub content
console.log('\n--- VIEW-HUB INSPECTION ---');
const hubMatch = indexHtml.match(/<section id="view-hub"[\s\S]*?<\/section>/i);
if (hubMatch) {
  console.log('view-hub content snippet:');
  console.log(hubMatch[0].substring(0, 800));
}

// 3. Inspect view-enrolled content
console.log('\n--- VIEW-ENROLLED INSPECTION ---');
const enrolledMatch = indexHtml.match(/<section id="view-enrolled"[\s\S]*?<\/section>/i);
if (enrolledMatch) {
  console.log('view-enrolled content snippet:');
  console.log(enrolledMatch[0].substring(0, 800));
}

// 4. Inspect view-catalog content
console.log('\n--- VIEW-CATALOG INSPECTION ---');
const catalogMatch = indexHtml.match(/<section id="view-catalog"[\s\S]*?<\/section>/i);
if (catalogMatch) {
  console.log('view-catalog content snippet:');
  console.log(catalogMatch[0].substring(0, 800));
}

// 5. Inspect modal-profile content
console.log('\n--- MODAL-PROFILE INSPECTION ---');
const profileMatch = indexHtml.match(/<div id="modal-profile"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i);
if (profileMatch) {
  console.log('modal-profile snippet:');
  console.log(profileMatch[0].substring(0, 800));
}

console.log('\n================================================================');
console.log('AUDITING PUBLIC/ADMIN/INDEX.HTML FOR HARDCODED MOCK / FAKE DATA');
console.log('================================================================');

const adminFakeIndicators = [
  'fake',
  'mock',
  'dummy',
  'Nguyễn Văn A',
  'test_user'
];

adminFakeIndicators.forEach(ind => {
  let count = 0;
  let pos = adminHtml.indexOf(ind);
  while (pos !== -1) {
    count++;
    pos = adminHtml.indexOf(ind, pos + 1);
  }
  console.log(`- Admin Indicator "${ind}": ${count} occurrence(s)`);
});
