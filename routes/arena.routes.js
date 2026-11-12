const express = require('express');
const router = express.Router();
const arenaService = require('../services/arena.service');
const { getArenaSeason } = require('../services/arena-season.service');
const { authenticate } = require('../middlewares/auth.middleware');
router.get('/room-qr.png',async(req,res)=>{
  const code=String(req.query.code||'').toUpperCase();
  if(!/^TOK-[A-Z0-9]{4,12}$/.test(code))return res.apiError('Mã phòng không hợp lệ.','INVALID_ROOM_CODE',400);
  try{
    const protocol=(req.get('x-forwarded-proto')||req.protocol).split(',')[0].trim();
    const origin=process.env.PUBLIC_APP_URL||protocol+'://'+req.get('host');
    const invitation=new URL('/',origin);invitation.searchParams.set('room',code);
    const png=await require('qrcode').toBuffer(invitation.toString(),{type:'png',width:384,margin:2,errorCorrectionLevel:'M'});
    res.setHeader('Cache-Control','private, max-age=60');res.type('png').send(png);
  }catch(error){return res.apiError('Không tạo được mã QR phòng.','ROOM_QR_FAILED',500);}
});

// Create a match (e.g. against bot or invited user)
router.post('/create-match', authenticate, async (req, res) => {
  try {
    const player1Id = req.user.ma_nguoi_dung;
    // Default opponent can be bot if not specified
    const opponentId = req.body.doi_thu_id || 'usr_bot_003';
    const ma_mon = req.body.ma_mon || 'mon_csdl';

    const matchState = await arenaService.createMatch(player1Id, opponentId, ma_mon);
    return res.apiSuccess(matchState, 201);
  } catch (err) {
    return res.apiError(err.message, 'CREATE_MATCH_FAILED', 400);
  }
});

router.get('/season', async (req, res) => {
  try {
    return res.apiSuccess(await getArenaSeason());
  } catch (err) {
    return res.apiError(err.message, 'FETCH_SEASON_FAILED', 500);
  }
});

// Leaderboard from real database users
router.get('/leaderboard', async (req, res) => {
  try {
    const db = require('../database/db');
    const season = await getArenaSeason();
    const { deriveRankTitle } = require('../core/rules/economy.rules');
    const users = await db.query(`
      SELECT u.ma_nguoi_dung, u.ten_dang_nhap, u.ten_hien_thi, u.tong_diem_kinh_nghiem, u.chuoi_streak_ngay,
             COALESCE(u.chuoi_thang_arena, 0) as chuoi_thang_arena,
             COALESCE(u.chuoi_thang_cao_nhat_arena, 0) as chuoi_thang_cao_nhat_arena,
             p.ma_thu_cung,p.ten_thu_cung, p.anh_dai_dien
      FROM nguoi_dung u
      LEFT JOIN thu_cung_so_huu tcsh ON u.ma_nguoi_dung = tcsh.ma_nguoi_dung AND tcsh.dang_kich_hoat = 1
      LEFT JOIN thu_cung p ON tcsh.ma_thu_cung = p.ma_thu_cung
      WHERE u.vai_tro NOT IN ('QUAN_TRI_VIEN','HE_THONG')
        AND u.ma_nguoi_dung NOT LIKE 'usr_bot_%'
        AND EXISTS(SELECT 1 FROM diem_dau_hang r WHERE r.ma_nguoi_dung=u.ma_nguoi_dung)
      ORDER BY u.ma_nguoi_dung
    `);
    
    // Khử trùng lặp theo ma_nguoi_dung (đảm bảo mỗi người dùng chỉ xuất hiện đúng 1 lần)
    const seen = new Set();
    const uniqueUsers = [];
    for (const u of (users || [])) {
      if (!seen.has(u.ma_nguoi_dung)) {
        seen.add(u.ma_nguoi_dung);
        uniqueUsers.push(u);
      }
    }

    const answerStats = await db.query(`
      SELECT p.ma_nguoi_dung, t.ma_mon, COUNT(*) AS so_cau,
        SUM(CASE WHEN a.la_dap_an_dung = $1 THEN 1 ELSE 0 END) AS so_cau_dung,
        SUM(a.thoi_gian_tra_loi_giay) AS tong_thoi_gian
      FROM luot_tra_loi a
      JOIN nguoi_choi_trong_tran p ON p.ma_nguoi_choi_trong_tran = a.ma_nguoi_choi_trong_tran
      JOIN tran_dau_1v1 t ON t.ma_tran = p.ma_tran
      WHERE t.che_do='RANKED' AND t.trang_thai='KET_THUC' AND p.xu_nhan_duoc>0
      AND t.thoi_gian_ket_thuc >= $2 AND t.thoi_gian_ket_thuc < $3
      GROUP BY p.ma_nguoi_dung, t.ma_mon`, [true, season.startsAt, season.endsAt]);
    const enrollments = await db.query('SELECT ma_nguoi_dung, ma_mon FROM tien_do_mon_hoc');
    const ratings=await db.query('SELECT ma_nguoi_dung,ma_mon,diem FROM diem_dau_hang');
    const results=await db.query(`
      SELECT p.ma_nguoi_dung,t.ma_mon,p.ket_qua
      FROM nguoi_choi_trong_tran p JOIN tran_dau_1v1 t ON t.ma_tran=p.ma_tran
      WHERE t.che_do='RANKED' AND t.trang_thai='KET_THUC' AND p.xu_nhan_duoc>0
      AND t.thoi_gian_ket_thuc >= $1 AND t.thoi_gian_ket_thuc < $2
      ORDER BY t.thoi_gian_ket_thuc,t.ma_tran
    `, [season.startsAt, season.endsAt]);
    const streaks=new Map();
    for(const result of results){
      if(!streaks.has(result.ma_nguoi_dung))streaks.set(result.ma_nguoi_dung,{});
      const streak=streaks.get(result.ma_nguoi_dung);
      for(const scope of ['all',result.ma_mon.replace(/^mon_/,'')]){
        streak[scope]=result.ket_qua==='THANG'?(streak[scope]||0)+1:0;
      }
    }
    const enriched = uniqueUsers.map(u => ({
      ...u,
      chuoi_dau_hang:streaks.get(u.ma_nguoi_dung)||{},
      diem_dau_hang:Object.fromEntries(ratings.filter(r=>r.ma_nguoi_dung===u.ma_nguoi_dung).map(r=>[r.ma_mon,Number(r.diem)])),
      thu_cung:require('../services/pet.service').formatPet(u.ma_thu_cung?u:null),
      mon_da_dang_ky: enrollments.filter(e => e.ma_nguoi_dung === u.ma_nguoi_dung).map(e => e.ma_mon),
      thong_ke_tra_loi: answerStats.filter(s => s.ma_nguoi_dung === u.ma_nguoi_dung).map(s => ({
        ma_mon:s.ma_mon, so_cau:Number(s.so_cau), so_cau_dung:Number(s.so_cau_dung), tong_thoi_gian:Number(s.tong_thoi_gian)
      })),
      danh_hieu: deriveRankTitle(u.tong_diem_kinh_nghiem),
      chuoi_thang_arena: typeof u.chuoi_thang_arena === 'number' ? u.chuoi_thang_arena : 0,
      chuoi_thang_cao_nhat_arena: typeof u.chuoi_thang_cao_nhat_arena === 'number' ? u.chuoi_thang_cao_nhat_arena : 0
    }));
    return res.apiSuccess(enriched);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_LEADERBOARD_FAILED', 500);
  }
});

router.get('/:matchId', authenticate, async (req, res) => {
  try {
    const matchState = await arenaService.getMatchState(req.params.matchId);
    if (!matchState.nguoi_choi.some(player => player.ma_nguoi_dung === req.user.ma_nguoi_dung)) {
      return res.apiError("Bạn không tham gia trận này.", "MATCH_FORBIDDEN", 403);
    }
    return res.apiSuccess(matchState);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_MATCH_FAILED', 404);
  }
});

router.post('/:matchId/turn', authenticate, async (req, res) => {
  try {
    const { thu_tu_cau, vi_tri_dap_an_chon, cau_tra_loi, thoi_gian_giay } = req.body;
    const result = await arenaService.submitTurnAnswer({
      ma_tran: req.params.matchId,
      ma_nguoi_dung: req.user.ma_nguoi_dung,
      thu_tu_cau: parseInt(thu_tu_cau, 10),
      vi_tri_dap_an_chon: vi_tri_dap_an_chon !== undefined ? vi_tri_dap_an_chon : null,
      cau_tra_loi,
      thoi_gian_giay: parseFloat(thoi_gian_giay || 3.0)
    });

    const io = req.app.get('io');
    if (io && !result.replayed) {
      const roomName = `room_${req.params.matchId}`;
      io.to(roomName).emit('turn_resolved', {
        nguoi_tra_loi: req.user.ma_nguoi_dung,
        thu_tu_cau: parseInt(thu_tu_cau, 10),
        la_dap_an_dung: result.la_dap_an_dung,
        sat_thuong_gay_ra: result.sat_thuong_gay_ra,
        la_chi_mang: result.la_chi_mang,
        trang_thai_tran: result.trang_thai_tran
      });
      if (result.tran_ket_thuc) {
        io.to(roomName).emit('match_ended', {
          ma_tran: req.params.matchId,
          nguoi_thang_cuoc: result.trang_thai_tran.nguoi_thang_cuoc,
          ly_do_ket_thuc: result.trang_thai_tran.ly_do_ket_thuc,
          trang_thai_cuoi: result.trang_thai_tran
        });
        io.emit('leaderboard_updated', { timestamp: Date.now(), ma_tran: req.params.matchId });
      }
    }

    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'SUBMIT_TURN_FAILED', 400);
  }
});

router.post('/:matchId/surrender', authenticate, async (req, res) => {
  try {
    const updatedState = await arenaService.surrenderMatch(req.params.matchId, req.user.ma_nguoi_dung);
    const io = req.app.get('io');
    if (io) {
      const roomName = `room_${req.params.matchId}`;
      io.to(roomName).emit('match_ended', {
        ma_tran: req.params.matchId,
        nguoi_thang_cuoc: updatedState.nguoi_thang_cuoc,
        ly_do_ket_thuc: 'DAU_HANG',
        trang_thai_cuoi: updatedState
      });
      io.emit('leaderboard_updated', { timestamp: Date.now(), ma_tran: req.params.matchId });
    }
    return res.apiSuccess(updatedState);
  } catch (err) {
    return res.apiError(err.message, 'SURRENDER_FAILED', 400);
  }
});

router.post('/:matchId/conclude', authenticate, async (req, res) => {
  try {
    const updatedState = await arenaService.concludeIfResolved(req.params.matchId,req.user.ma_nguoi_dung);
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_updated', { timestamp: Date.now(), ma_tran: req.params.matchId });
    }
    return res.apiSuccess(updatedState);
  } catch (err) {
    return res.apiError(err.message, 'CONCLUDE_MATCH_FAILED', 400);
  }
});

module.exports = router;
