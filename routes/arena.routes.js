const express = require('express');
const router = express.Router();
const arenaService = require('../services/arena.service');
const { authenticate } = require('../middlewares/auth.middleware');

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
      SELECT u.ma_nguoi_dung, u.ten_hien_thi, u.tong_diem_kinh_nghiem, u.chuoi_streak_ngay,
             p.ten_thu_cung, p.anh_dai_dien
      FROM nguoi_dung u
      LEFT JOIN thu_cung_so_huu tcsh ON u.ma_nguoi_dung = tcsh.ma_nguoi_dung AND tcsh.dang_kich_hoat = $1
      LEFT JOIN thu_cung p ON tcsh.ma_thu_cung = p.ma_thu_cung
      WHERE u.vai_tro != 'QUAN_TRI_VIEN'
      ORDER BY u.tong_diem_kinh_nghiem DESC
    `, [true]);
    const enriched = users.map(u => ({
      ...u,
      danh_hieu: deriveRankTitle(u.tong_diem_kinh_nghiem)
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
    const { thu_tu_cau, vi_tri_dap_an_chon, thoi_gian_giay } = req.body;
    const result = await arenaService.submitTurnAnswer({
      ma_tran: req.params.matchId,
      ma_nguoi_dung: req.user.ma_nguoi_dung,
      thu_tu_cau: parseInt(thu_tu_cau, 10),
      vi_tri_dap_an_chon: parseInt(vi_tri_dap_an_chon, 10),
      thoi_gian_giay: parseFloat(thoi_gian_giay || 3.0)
    });
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'SUBMIT_TURN_FAILED', 400);
  }
});

router.post('/:matchId/conclude', authenticate, async (req, res) => {
  try {
    const { winnerUserId, reason } = req.body;
    await arenaService.concludeMatch(req.params.matchId, winnerUserId, reason || 'KO_VICTORY');
    const updatedState = await arenaService.getMatchState(req.params.matchId);
    return res.apiSuccess(updatedState);
  } catch (err) {
    return res.apiError(err.message, 'CONCLUDE_MATCH_FAILED', 400);
  }
});

module.exports = router;
