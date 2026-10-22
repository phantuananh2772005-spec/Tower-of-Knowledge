const fs = require('fs');
const path = require('path');
const db = require('../database/db');

async function inspect() {
  console.log('=== ADMIN USERS IN DB ===');
  const admins = await db.query("SELECT ma_nguoi_dung, ten_dang_nhap, vai_tro FROM nguoi_dung WHERE vai_tro = 'QUAN_TRI_VIEN'");
  console.log(admins);

  console.log('\n=== CURRICULUM OVERVIEW ===');
  const courses = await db.query('SELECT ma_mon, ten_mon, slug, thu_tu FROM mon_hoc ORDER BY thu_tu ASC');
  console.log('Courses:', courses);

  const chapters = await db.query('SELECT ma_chuong, ma_mon, tieu_de, thu_tu FROM chuong_hoc ORDER BY thu_tu ASC');
  console.log('Chapters:', chapters);

  const checkpoints = await db.query('SELECT ma_moc, ma_chuong, tieu_de, loai_moc, thu_tu, tong_so_buoc, so_cau_moi_buoc FROM moc_bai_hoc ORDER BY thu_tu ASC');
  console.log('Checkpoints:', checkpoints);

  console.log('\n=== QUESTIONS IN DB (Sample) ===');
  const questionsCount = await db.queryOne('SELECT count(*) as total FROM cau_hoi');
  console.log('Total Questions:', questionsCount.total);

  const sampleQ = await db.query('SELECT TOP 3 ma_cau_hoi, ma_moc, loai_cau_hoi, noi_dung, vi_tri_dap_an_dung, do_kho, muc_bloom FROM cau_hoi');
  console.log('Sample Questions:', sampleQ);

  process.exit(0);
}

inspect().catch(e => {
  console.error(e);
  process.exit(1);
});
