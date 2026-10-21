const fs = require('fs');
const path = require('path');

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  return "'" + String(val).replace(/'/g, "''") + "'";
}

const richSeedPath = path.join(__dirname, 'seed_rich_questions.js');
const rawCode = fs.readFileSync(richSeedPath, 'utf8');

// Extract questions array
const match = rawCode.match(/const questions = (\[[\s\S]*?\]);\s*async function seed/);
if (!match) {
  console.error('Failed to locate questions array in seed_rich_questions.js');
  process.exit(1);
}

const questions = eval(match[1]);
console.log(`Found ${questions.length} rich questions to export to PostgreSQL seed.`);

let sqlInserts = `-- 7. NGAN HANG CAU HOI HE THONG (${questions.length} CAU HOI DUOLINGO STEPPING & BLOOM)\n`;
sqlInserts += `INSERT INTO cau_hoi (\n  ma_cau_hoi, ma_moc, buoc_luyen_tap, muc_bloom, loai_cau_hoi,\n  noi_dung, dap_an_a, dap_an_b, dap_an_c, dap_an_d,\n  vi_tri_dap_an_dung, du_lieu_cau_hoi, giai_thich, do_kho\n) VALUES\n`;

const rows = questions.map(q => {
  const ma_cau_hoi = escapeSql(q.ma_cau_hoi);
  const ma_moc = escapeSql(q.ma_moc);
  const buoc = q.buoc_luyen_tap || 1;
  const bloom = escapeSql(q.muc_bloom || 'NHO');
  const loai = escapeSql(q.loai_cau_hoi || 'TRAC_NGHIEM_4');
  const noi_dung = escapeSql(q.noi_dung);
  const da_a = escapeSql(q.dap_an_a || null);
  const da_b = escapeSql(q.dap_an_b || null);
  const da_c = escapeSql(q.dap_an_c || null);
  const da_d = escapeSql(q.dap_an_d || null);
  const vt = q.vi_tri_dap_an_dung !== undefined ? q.vi_tri_dap_an_dung : 'NULL';
  const du_lieu = escapeSql(q.du_lieu_cau_hoi || null);
  const giai_thich = escapeSql(q.giai_thich || null);
  const do_kho = q.do_kho || 1;

  return `(${ma_cau_hoi}, ${ma_moc}, ${buoc}, ${bloom}, ${loai}, ${noi_dung}, ${da_a}, ${da_b}, ${da_c}, ${da_d}, ${vt}, ${du_lieu}, ${giai_thich}, ${do_kho})`;
});

sqlInserts += rows.join(',\n') + ';\n\n';

const postgresSeedPath = path.join(__dirname, '..', 'database', 'seed_postgres.sql');
let postgresSql = fs.readFileSync(postgresSeedPath, 'utf8');

// Replace everything from "-- 7. NGAN HANG CAU HOI" down to "-- 8. TIEN DO MAC DINH"
const cutIndex = postgresSql.indexOf('-- 7. NGAN HANG CAU HOI');
const nextIndex = postgresSql.indexOf('-- 8. TIEN DO MAC DINH');

if (cutIndex !== -1 && nextIndex !== -1) {
  postgresSql = postgresSql.slice(0, cutIndex) + sqlInserts + postgresSql.slice(nextIndex);
} else {
  postgresSql += '\n' + sqlInserts;
}

fs.writeFileSync(postgresSeedPath, postgresSql, 'utf8');
console.log('✓ Successfully updated database/seed_postgres.sql with all 61 rich questions!');
