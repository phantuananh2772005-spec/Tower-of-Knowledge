const { register } = require('../services/auth.service');
const { enrollCourse, getCheckpointContent } = require('../services/course.service');
const db = require('../database/db');

(async () => {
  const username = 'test_boss_' + Date.now();
  const auth = await register({
    ten_dang_nhap: username,
    mat_khau: 'Pass1234@',
    ten_hien_thi: 'Tester Boss'
  });
  const userId = auth.nguoi_dung.ma_nguoi_dung;
  await enrollCourse('co-so-du-lieu', userId);

  // Manually unlock moc_csdl_01_05 for this test
  const pckId = `pck_test_${Date.now()}`;
  await db.execute(
    'INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [pckId, userId, 'moc_csdl_01_05', 'DA_MO', 0, 0, 1, '0/5']
  );

  const c5 = await getCheckpointContent('moc_csdl_01_05', userId, 1);
  console.log('✅ Moc 1.5 Boss Result:');
  console.log({
    tong_so_buoc: c5.tong_so_buoc,
    so_cau_moi_buoc: c5.so_cau_moi_buoc,
    cac_buoc_hoan_thanh: c5.cac_buoc_hoan_thanh,
    thong_tin_cac_buoc_count: c5.thong_tin_cac_buoc.length,
    thong_tin_cac_buoc: c5.thong_tin_cac_buoc,
    questions_count: c5.danh_sach_cau_hoi.length,
    bloom_types: c5.danh_sach_cau_hoi.map(q => q.muc_bloom)
  });

  // Test submitting Step 1 with correct answers
  const { submitStep } = require('../services/course.service');
  const submissions = c5.danh_sach_cau_hoi.map(q => {
    if (q.loai_cau_hoi === 'NOI_CAP') {
      const pairs = (q.du_lieu && q.du_lieu.pairsMap) ? Object.entries(q.du_lieu.pairsMap).map(([left, right]) => ({ left, right })) : [];
      return { ma_cau_hoi: q.ma_cau_hoi, matched_pairs: pairs, thoi_gian_giay: 4 };
    }
    if (q.loai_cau_hoi === 'DIEN_TU') {
      return { ma_cau_hoi: q.ma_cau_hoi, selected_word: q.du_lieu?.blank_answer, thoi_gian_giay: 4 };
    }
    if (q.loai_cau_hoi === 'SAP_XEP_CAU') {
      return { ma_cau_hoi: q.ma_cau_hoi, ordered_words: q.du_lieu?.correct_order || [], thoi_gian_giay: 4 };
    }
    return { ma_cau_hoi: q.ma_cau_hoi, lua_chon: q.vi_tri_dap_an_dung, thoi_gian_giay: 4 };
  });

  const subRes = await submitStep('moc_csdl_01_05', 1, submissions, userId);
  console.log('✅ Submit Step 1 result:', {
    isPassed: subRes.isPassed,
    scorePercentage: subRes.scorePercentage,
    earnedCoins: subRes.earnedCoins,
    earnedExp: subRes.earnedExp,
    buoc_vua_lam: subRes.buoc_vua_lam,
    buoc_ke_tiep: subRes.buoc_ke_tiep,
    tong_so_buoc: subRes.tong_so_buoc
  });

  // Verify in DB
  const progInDb = await db.queryOne('SELECT buoc_hien_tai, cac_buoc_hoan_thanh, trang_thai FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2', [userId, 'moc_csdl_01_05']);
  console.log('✅ In Database:', progInDb);

  process.exit(0);
})().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
