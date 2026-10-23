const express = require('express');
const router = express.Router();
const extremeService = require('../services/extreme.service');
const { optionalAuthenticate } = require('../middlewares/auth.middleware');

// 1. Start a new Extreme Survival session
router.post('/start', optionalAuthenticate, async (req, res) => {
  try {
    const ma_mon = req.body.ma_mon || 'mon_csdl';
    const userId = req.user ? req.user.ma_nguoi_dung : null;
    const session = await extremeService.startSession(ma_mon, userId);
    return res.apiSuccess(session);
  } catch (err) {
    return res.apiError(err.message, 'START_EXTREME_FAILED', 400);
  }
});

// 2. Fetch the next batch of 10 questions in background
router.post('/next-batch', optionalAuthenticate, async (req, res) => {
  try {
    const { ma_mon, excludeIds, exclude_ids } = req.body;
    const batch = await extremeService.getNextBatch(ma_mon || 'mon_csdl', excludeIds || exclude_ids || []);
    return res.apiSuccess(batch);
  } catch (err) {
    return res.apiError(err.message, 'NEXT_BATCH_FAILED', 400);
  }
});

// 3. Real-time answer evaluation
router.post('/check-answer', optionalAuthenticate, async (req, res) => {
  try {
    const { ma_cau_hoi, tra_loi } = req.body;
    if (!ma_cau_hoi) {
      return res.apiError('Thiếu mã câu hỏi.', 'MISSING_QUESTION_ID', 400);
    }
    const result = await extremeService.checkAnswer(ma_cau_hoi, tra_loi);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'CHECK_ANSWER_FAILED', 400);
  }
});

// 4. Finish session and claim rewards
router.post('/finish', optionalAuthenticate, async (req, res) => {
  try {
    const userId = req.user ? req.user.ma_nguoi_dung : null;
    const result = await extremeService.finishSession(userId, req.body);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'FINISH_EXTREME_FAILED', 400);
  }
});

module.exports = router;
