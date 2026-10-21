const db = require('../database/db');

async function cleanAllDemoData() {
  console.log('Cleaning all demo/fake data from database, keeping ONLY admin...');

  // 1. Delete battle records
  await db.execute('DELETE FROM luot_tra_loi');
  await db.execute('DELETE FROM cau_hoi_trong_tran');
  await db.execute('DELETE FROM nguoi_choi_trong_tran');
  await db.execute('DELETE FROM tran_dau_1v1');

  // 2. Delete non-admin student records
  await db.execute("DELETE FROM giao_dich_xu WHERE ma_nguoi_dung != 'usr_admin_001'");
  await db.execute("DELETE FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung != 'usr_admin_001'");
  await db.execute("DELETE FROM tien_do_mon_hoc WHERE ma_nguoi_dung != 'usr_admin_001'");
  await db.execute("DELETE FROM thu_cung_so_huu WHERE ma_nguoi_dung != 'usr_admin_001'");
  await db.execute("DELETE FROM nguoi_dung WHERE ma_nguoi_dung != 'usr_admin_001'");

  const remainingUsers = await db.query('SELECT ma_nguoi_dung, ten_dang_nhap, ten_hien_thi, vai_tro FROM nguoi_dung');
  console.log('Remaining users in DB (Only Admin):', remainingUsers);

  const remainingProg = await db.query('SELECT * FROM tien_do_moc_bai_hoc');
  console.log('Remaining progression count:', remainingProg.length);
}

cleanAllDemoData().catch(console.error);
