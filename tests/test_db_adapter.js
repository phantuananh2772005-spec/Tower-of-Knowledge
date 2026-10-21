const db = require('../database/db');

async function main() {
  console.log('Testing unified db adapter...');
  const user = await db.queryOne('SELECT * FROM nguoi_dung WHERE ten_dang_nhap = $1', ['demo_user']);
  console.log('User found:', user.ten_hien_thi, '| Xu:', user.xu_tri_thuc, '| Streak:', user.chuoi_streak_ngay);

  const questions = await db.query('SELECT ma_cau_hoi, noi_dung FROM cau_hoi WHERE ma_moc = $1', ['moc_csdl_01_02']);
  console.log('Questions found for moc_csdl_01_02:', questions.length);

  const course = await db.queryOne('SELECT * FROM mon_hoc WHERE slug = $1', ['co-so-du-lieu']);
  console.log('Course found:', course.ten_mon);

  const chapters = await db.query('SELECT * FROM chuong_hoc WHERE ma_mon = $1 ORDER BY thu_tu', [course.ma_mon]);
  console.log('Chapters found:', chapters.length);
  for (const c of chapters) {
    console.log(` - ${c.tieu_de}`);
  }

  console.log('\nDB ADAPTER TEST PASSED 100%!');
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
