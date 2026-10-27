const express = require('express');
const router = express.Router();
const economyService = require('../services/economy.service');
const db = require('../database/db');
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

const quests = require('../services/quest.service');
router.get('/quests-status', authenticate, async (req,res) => {
  try { return res.apiSuccess(await quests.getStatus(req.user.ma_nguoi_dung)); }
  catch(err) { return res.apiError(err.message,'FETCH_QUESTS_STATUS_FAILED',500); }
});
router.post('/claim-quest', authenticate, async (req,res) => {
  try { return res.apiSuccess(await quests.award(req.user.ma_nguoi_dung,req.body.questId)); }
  catch(err) { return res.apiError(err.message,'CLAIM_QUEST_FAILED',400); }
});
router.post('/onboarding-gift', authenticate, async (req,res) => {
  try { return res.apiSuccess(await quests.award(req.user.ma_nguoi_dung,'onboarding')); }
  catch(err) { return res.apiError(err.message,'ONBOARDING_GIFT_FAILED',400); }
});
module.exports=router;
