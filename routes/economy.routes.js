const express = require('express');
const router = express.Router();
const economyService = require('../services/economy.service');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/transactions', authenticate, async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const history = await economyService.getTransactionHistory(req.user.ma_nguoi_dung, limit);
    return res.apiSuccess(history);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_TRANSACTIONS_FAILED', 500);
  }
});

module.exports = router;
