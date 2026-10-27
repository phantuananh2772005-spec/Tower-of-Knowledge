const express = require('express');
const router = express.Router();
const arenaService = require('../services/arena.service');
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

// Leaderboard from real database users
router.get('/leaderboard', async (req, res) => {
  try {
    const db = require('../database/db');
    const { deriveRankTitle } = require('../core/rules/economy.rules');
    const users = await db.query(`
      SELECT u.ma_nguoi_dung, u.ten_dang_nhap, u.ten_hien_thi, u.tong_diem_kinh_nghiem, u.chuoi_streak_ngay,
             COALESCE(u.chuoi_thang_arena, 0) as chuoi_thang_arena,
             COALESCE(u.chuoi_thang_cao_nhat_arena, 0) as chuoi_thang_cao_nhat_arena,
             p.ten_thu_cung, p.anh_dai_dien
      FROM nguoi_dung u
      LEFT JOIN thu_cung_so_huu tcsh ON u.ma_nguoi_dung = tcsh.ma_nguoi_dung AND tcsh.dang_kich_hoat = 1
      LEFT JOIN thu_cung p ON tcsh.ma_thu_cung = p.ma_thu_cung
      WHERE u.vai_tro NOT IN ('QUAN_TRI_VIEN', 'HE_THONG')
        AND u.ten_hien_thi NOT LIKE N'%Đối thủ%'
        AND u.ten_hien_thi NOT LIKE N'%Người chơi%'
        AND u.ten_dang_nhap NOT LIKE '%cron%'
        AND u.ten_dang_nhap NOT LIKE '%test_%'
        AND u.ten_hien_thi NOT LIKE N'%Tester%'
      ORDER BY u.tong_diem_kinh_nghiem DESC
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
      GROUP BY p.ma_nguoi_dung, t.ma_mon`, [true]);
    const enrollments = await db.query('SELECT ma_nguoi_dung, ma_mon FROM tien_do_mon_hoc');
    const enriched = uniqueUsers.map(u => ({
      ...u,
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
    if (io) {
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
    const { winnerUserId, reason } = req.body;
    await arenaService.concludeMatch(req.params.matchId, winnerUserId, reason || 'KO_VICTORY');
    const updatedState = await arenaService.getMatchState(req.params.matchId);
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
