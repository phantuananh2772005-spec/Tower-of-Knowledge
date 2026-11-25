const db = require('../database/db');
const { deriveRankTitle, deriveUserLevel } = require('../core/rules/economy.rules');
const { mutateCoinsInTransaction } = require('./wallet.service');

const dailyQuestCodes = new Set(['STUDY', 'BATTLE', 'PET_CARE']);
const onboardingReward = { reward_coins: 20, reward_xp: 30 };

function readVietnamDay(connection, instant = null) {
  return connection.queryOne(
    "WITH instant AS (SELECT COALESCE($1::timestamptz, clock_timestamp()) AS at),"
      + " day AS (SELECT at, (at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS vn_date FROM instant)"
      + " SELECT at, vn_date, vn_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AS starts_at,"
      + " (vn_date + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AS ends_at FROM day",
    [instant]
  );
}

function lockQuestUser(tx, userId) {
  return tx.queryOne(
    "SELECT id, coin_balance, xp FROM users"
      + " WHERE id = $1 AND disabled_at IS NULL AND role IN ('LEARNER', 'ADMIN') FOR UPDATE",
    [userId]
  );
}

function readEvidence(connection, userId, day) {
  return connection.queryOne(
    "SELECT EXISTS (SELECT 1 FROM study_sessions s WHERE s.user_id = $1"
      + ' AND s.finished_at >= $2 AND s.finished_at < $3'
      + " AND (s.kind <> 'EXTREME' OR EXISTS (SELECT 1 FROM session_answers a WHERE a.session_id = s.id))) AS \"STUDY\","
      + " (EXISTS (SELECT 1 FROM match_players p JOIN matches m ON m.id = p.match_id"
      + " WHERE p.user_id = $1 AND m.status = 'FINISHED' AND m.finished_at >= $2 AND m.finished_at < $3)"
      + " OR EXISTS (SELECT 1 FROM coin_ledger l WHERE l.user_id = $1 AND l.kind = 'EXTREME_REWARD'"
      + ' AND l.occurred_at >= $2 AND l.occurred_at < $3)) AS "BATTLE",'
      + " EXISTS (SELECT 1 FROM coin_ledger l WHERE l.user_id = $1 AND l.kind IN ('PET_FEED', 'PET_STROKE')"
      + ' AND l.occurred_at >= $2 AND l.occurred_at < $3) AS "PET_CARE",'
      + " EXISTS (SELECT 1 FROM coin_ledger l WHERE l.user_id = $1 AND l.kind = 'ONBOARDING_REWARD')"
      + ' AS onboarding_claimed',
    [userId, day.starts_at, day.ends_at]
  );
}

async function getStatus(userId) {
  const day = await readVietnamDay(db);
  const catalog = await db.query(
    "SELECT q.code, q.reward_coins, q.reward_xp, c.quest_code IS NOT NULL AS claimed FROM quests q"
      + ' LEFT JOIN quest_claims c ON c.quest_code = q.code AND c.user_id = $1 AND c.vn_date = $2'
      + ' ORDER BY q.code',
    [userId, day.vn_date]
  );
  const evidence = await readEvidence(db, userId, day);
  return {
    vn_date: day.vn_date,
    quests: catalog.map(({ code, reward_coins, reward_xp }) => ({ code, reward_coins, reward_xp })),
    claimed: Object.fromEntries(catalog.map(quest => [quest.code, quest.claimed])),
    progress: Object.fromEntries(catalog.map(quest => [
      quest.code, quest.claimed || (dailyQuestCodes.has(quest.code) && evidence[quest.code] === true)
    ])),
    onboarding_claimed: evidence.onboarding_claimed
  };
}

function rewardResult(user, questCode, coins, xp, alreadyClaimed) {
  return {
    already_claimed: alreadyClaimed,
    quest_code: questCode,
    coins_awarded: coins,
    xp_awarded: xp,
    coin_balance: user.coin_balance,
    total_xp: user.xp,
    level: deriveUserLevel(user.xp),
    rank_title: deriveRankTitle(user.xp)
  };
}

async function applyReward(tx, user, quest, { kind, note, at }) {
  const { reward_coins: coins, reward_xp: xp, code = null } = quest;
  let { coin_balance, xp: totalXp } = user;

  if (coins > 0) {
    const wallet = await mutateCoinsInTransaction(tx, user.id, coins, kind, { note, occurred_at: at });
    coin_balance = wallet.coin_balance;
  }
  if (xp > 0) {
    const updated = await tx.queryOne('UPDATE users SET xp = xp + $1 WHERE id = $2 RETURNING xp', [xp, user.id]);
    totalXp = updated.xp;
  }
  return rewardResult({ coin_balance, xp: totalXp }, code, coins, xp, false);
}

function award(userId, questCode) {
  return db.transaction(async tx => {
    const user = await lockQuestUser(tx, userId);
    if (!user) throw new Error('Người dùng không tồn tại hoặc đã bị vô hiệu hóa.');
    const day = await readVietnamDay(tx);
    const quest = await tx.queryOne(
      'SELECT code, reward_coins, reward_xp FROM quests WHERE code = $1',
      [typeof questCode === 'string' ? questCode : null]
    );
    if (!quest || !dailyQuestCodes.has(quest.code)) throw new Error('Mã nhiệm vụ chưa được hỗ trợ.');

    const claimed = await tx.queryOne(
      'SELECT 1 FROM quest_claims WHERE user_id = $1 AND quest_code = $2 AND vn_date = $3',
      [user.id, quest.code, day.vn_date]
    );
    if (claimed) return rewardResult(user, quest.code, 0, 0, true);

    const evidence = await readEvidence(tx, user.id, day);
    if (!evidence[quest.code]) throw new Error('Bạn cần hoàn thành nhiệm vụ trước khi nhận thưởng.');

    const claim = await tx.queryOne(
      'INSERT INTO quest_claims (user_id, quest_code, vn_date) VALUES ($1, $2, $3)'
        + ' ON CONFLICT (user_id, quest_code, vn_date) DO NOTHING RETURNING quest_code',
      [user.id, quest.code, day.vn_date]
    );
    if (!claim) return rewardResult(user, quest.code, 0, 0, true);

    return applyReward(tx, user, quest, {
      kind: 'DAILY_QUEST_REWARD', note: 'Thưởng nhiệm vụ ' + quest.code, at: day.at
    });
  });
}

function awardOnboarding(userId) {
  return db.transaction(async tx => {
    const user = await lockQuestUser(tx, userId);
    if (!user) throw new Error('Người dùng không tồn tại hoặc đã bị vô hiệu hóa.');

    const claimed = await tx.queryOne(
      "SELECT 1 FROM coin_ledger WHERE user_id = $1 AND kind = 'ONBOARDING_REWARD'",
      [user.id]
    );
    if (claimed) return rewardResult(user, null, 0, 0, true);

    const { at } = await tx.queryOne('SELECT clock_timestamp() AS at');
    return applyReward(tx, user, onboardingReward, {
      kind: 'ONBOARDING_REWARD', note: 'Quà tân thủ', at
    });
  });
}

module.exports = { award, awardOnboarding, getStatus, readVietnamDay };
