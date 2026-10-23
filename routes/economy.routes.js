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

// Lấy trạng thái nhận thưởng nhiệm vụ ngày & quà tân thủ
router.get('/quests-status', authenticate, async (req, res) => {
  try {
    const userId = req.user.ma_nguoi_dung;
    const nowVN = new Date(Date.now() + 7 * 3600 * 1000);
    const todayStr = nowVN.toISOString().substring(0, 10);
    
    // Tìm các giao dịch nhiệm vụ ngày hôm nay
    const claimedRows = await db.query(
      "SELECT mo_ta FROM giao_dich_xu WHERE ma_nguoi_dung = $1 AND nguon_giao_dich = 'NHIEM_VU_NGAY' AND CAST(thoi_gian AS DATE) = CAST($2 AS DATE)",
      [userId, todayStr]
    );
    const claimedMap = {};
    for (const r of claimedRows) {
      const desc = r.mo_ta || '';
      if (desc.includes('[hoc_tap]')) claimedMap.hoc_tap = true;
      if (desc.includes('[dau_truong]')) claimedMap.dau_truong = true;
      if (desc.includes('[cham_pet]')) claimedMap.cham_pet = true;
    }

    const onboardingClaimed = await db.queryOne(
      "SELECT ma_giao_dich FROM giao_dich_xu WHERE ma_nguoi_dung = $1 AND nguon_giao_dich = 'THUONG_TAN_THU'",
      [userId]
    );

    return res.apiSuccess({
      today: todayStr,
      claimed: claimedMap,
      onboardingClaimed: Boolean(onboardingClaimed)
    });
  } catch (err) {
    return res.apiError(err.message, 'FETCH_QUESTS_STATUS_FAILED', 500);
  }
});

// Nhận thưởng nhiệm vụ ngày
router.post('/claim-quest', authenticate, async (req, res) => {
  try {
    const userId = req.user.ma_nguoi_dung;
    const { questId } = req.body;
    const QUEST_MAP = {
      hoc_tap: { coins: 15, exp: 25, title: 'Chăm chỉ học tập (Mốc bài học)' },
      dau_truong: { coins: 15, exp: 25, title: 'Chiến binh Đấu trường (Mini Game)' },
      cham_pet: { coins: 10, exp: 15, title: 'Chăm sóc Linh thú đồng hành' }
    };
    const quest = QUEST_MAP[questId];
    if (!quest) {
      return res.apiError('Mã nhiệm vụ không hợp lệ.', 'INVALID_QUEST_ID', 400);
    }

    const nowVN = new Date(Date.now() + 7 * 3600 * 1000);
    const todayStr = nowVN.toISOString().substring(0, 10);
    const existing = await db.queryOne(
      "SELECT ma_giao_dich FROM giao_dich_xu WHERE ma_nguoi_dung = $1 AND nguon_giao_dich = 'NHIEM_VU_NGAY' AND mo_ta LIKE $2 AND CAST(thoi_gian AS DATE) = CAST($3 AS DATE)",
      [userId, `%[${questId}]%`, todayStr]
    );
    if (existing) {
      return res.apiSuccess({ alreadyClaimed: true, message: 'Nhiệm vụ này đã được nhận thưởng hôm nay rồi!' });
    }

    const coinRes = await economyService.mutateCoins(userId, quest.coins, 'NHIEM_VU_NGAY', `Thưởng nhiệm vụ ngày [${questId}]: ${quest.title}`);
    const expRes = await economyService.addExperience(userId, quest.exp);
    return res.apiSuccess({
      alreadyClaimed: false,
      questId,
      coinsAwarded: quest.coins,
      expAwarded: quest.exp,
      newCoins: coinRes.newBalance,
      newExp: expRes ? expRes.newExp : undefined,
      newRank: expRes ? expRes.newRank : undefined,
      newLevel: expRes ? expRes.newLevel : undefined
    });
  } catch (err) {
    return res.apiError(err.message, 'CLAIM_QUEST_FAILED', 500);
  }
});

// Nhận quà chào mừng tân thủ từ Linh thú đồng hành
router.post('/onboarding-gift', authenticate, async (req, res) => {
  try {
    const userId = req.user.ma_nguoi_dung;
    const existing = await db.queryOne(
      "SELECT ma_giao_dich FROM giao_dich_xu WHERE ma_nguoi_dung = $1 AND nguon_giao_dich = 'THUONG_TAN_THU'",
      [userId]
    );
    if (existing) {
      return res.apiSuccess({ alreadyClaimed: true, message: 'Bạn đã nhận quà tân thủ trước đó rồi!' });
    }

    const coinRes = await economyService.mutateCoins(userId, 20, 'THUONG_TAN_THU', 'Quà chào mừng tân thủ từ Linh Thú đồng hành');
    const expRes = await economyService.addExperience(userId, 30);
    return res.apiSuccess({
      alreadyClaimed: false,
      coinsAwarded: 20,
      expAwarded: 30,
      newCoins: coinRes.newBalance,
      newExp: expRes ? expRes.newExp : undefined,
      newRank: expRes ? expRes.newRank : undefined,
      newLevel: expRes ? expRes.newLevel : undefined
    });
  } catch (err) {
    return res.apiError(err.message, 'ONBOARDING_GIFT_FAILED', 500);
  }
});

module.exports = router;
