const router=require('express').Router();
const {authenticate}=require('../middlewares/auth.middleware');
const db=require('../database/db');
router.get('/profile/journey',authenticate,async(req,res)=>{
 try{
  const id=req.user.ma_nguoi_dung;
  const courses=await db.query(`SELECT m.slug,m.ten_mon,p.ngay_bat_dau,p.ngay_hoan_thanh,
    COUNT(k.ma_moc)::int AS total,
    COUNT(CASE WHEN t.trang_thai IN ('HOAN_THANH','DA_HOAN_THANH') THEN 1 END)::int AS completed
    FROM tien_do_mon_hoc p JOIN mon_hoc m ON m.ma_mon=p.ma_mon
    LEFT JOIN chuong_hoc c ON c.ma_mon=m.ma_mon LEFT JOIN moc_bai_hoc k ON k.ma_chuong=c.ma_chuong
    LEFT JOIN tien_do_moc_bai_hoc t ON t.ma_moc=k.ma_moc AND t.ma_nguoi_dung=p.ma_nguoi_dung
    WHERE p.ma_nguoi_dung=$1 GROUP BY m.ma_mon,m.slug,m.ten_mon,p.ngay_bat_dau,p.ngay_hoan_thanh
    ORDER BY p.ngay_bat_dau DESC`,[id]);
  const activity=await db.query(`SELECT (tao_luc AT TIME ZONE 'Asia/Ho_Chi_Minh')::date::text AS day,COUNT(*)::int AS sessions
    FROM lich_su_phien_hoc WHERE ma_nguoi_dung=$1 AND tao_luc>=NOW()-INTERVAL '90 days'
    GROUP BY 1 ORDER BY 1`,[id]);
  await require('../services/arena-season.service').getArenaSeason();
  const seasonAwards = await db.query(
    'SELECT mua, vi_tri, xu_thuong FROM lich_su_mua_dau_hang WHERE ma_nguoi_dung=$1 AND xu_thuong>0 ORDER BY mua DESC',
    [id]
  );
  res.set('Cache-Control','no-store');return res.apiSuccess({courses,activity,seasonAwards});
 }catch(error){console.error('[profile journey]',error.message);return res.apiError('Không tải được hành trình. Vui lòng thử lại.','PROFILE_FAILED',500)}
});module.exports=router;
