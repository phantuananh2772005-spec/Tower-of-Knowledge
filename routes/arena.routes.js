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

module.exports = router;
