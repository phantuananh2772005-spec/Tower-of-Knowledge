const express = require('express');
const router = express.Router();
const economy = require('../services/economy.service');
const quests = require('../services/quest.service');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/repeat-exp-quota', authenticate, async (req, res) => {
  try {
    return res.apiSuccess(await economy.getRepeatExperienceQuota(req.user.id));
  } catch (error) {
    return res.apiError(error.message, 'FETCH_EXP_QUOTA_FAILED', 500);
  }
});

router.get('/transactions', authenticate, async (req, res) => {
  try {
    return res.apiSuccess(await economy.getTransactionHistory(req.user.id, req.query.limit));
  } catch (error) {
    return res.apiError(error.message, 'FETCH_TRANSACTIONS_FAILED', 500);
  }
});

router.get('/quests-status', authenticate, async (req, res) => {
  try {
    return res.apiSuccess(await quests.getStatus(req.user.id));
  } catch (error) {
    return res.apiError(error.message, 'FETCH_QUESTS_STATUS_FAILED', 500);
  }
});

router.post('/claim-quest', authenticate, async (req, res) => {
  try {
    return res.apiSuccess(await quests.award(req.user.id, req.body?.quest_code));
  } catch (error) {
    return res.apiError(error.message, 'CLAIM_QUEST_FAILED', 400);
  }
});

router.post('/onboarding-gift', authenticate, async (req, res) => {
  try {
    return res.apiSuccess(await quests.awardOnboarding(req.user.id));
  } catch (error) {
    return res.apiError(error.message, 'ONBOARDING_GIFT_FAILED', 400);
  }
});

module.exports = router;
