const path = require('path');
const db = require(path.join(__dirname, '../database/db'));

async function check() {
  const users = await db.query(`SELECT ma_nguoi_dung, ten_dang_nhap, ten_hien_thi, vai_tro, tong_diem_kinh_nghiem FROM nguoi_dung`);
  console.log('Users in local DB:', users);
  const userPets = await db.query(`SELECT tcsh.*, tc.ten_thu_cung FROM thu_cung_so_huu tcsh JOIN thu_cung tc ON tcsh.ma_thu_cung = tc.ma_thu_cung`);
  console.log('User pets in local DB:', userPets);
}

check().catch(console.error);
