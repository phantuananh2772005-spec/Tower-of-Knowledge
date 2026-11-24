const db = require('../database/db');

async function getRepeatExperienceQuota(userId, connection = db, { occurred_at = null } = {}) {
  return connection.queryOne(`
    WITH quota AS (
      SELECT date_trunc(
          'week',
          COALESCE($2::timestamptz, clock_timestamp()) AT TIME ZONE 'Asia/Ho_Chi_Minh'
        )::date AS week_start,
        v1_weekly_xp_limit() AS limit_xp
    )
    SELECT q.week_start::text, COALESCE(u.xp, 0) AS used_xp, q.limit_xp,
      q.limit_xp - COALESCE(u.xp, 0) AS remaining_xp
    FROM quota AS q
    LEFT JOIN weekly_xp_usage AS u ON u.user_id = $1 AND u.week_start = q.week_start
  `, [userId, occurred_at]);
}

async function awardRepeatXpInTransaction(tx, userId, requestedXp, { occurred_at = null } = {}) {
  if (!Number.isSafeInteger(requestedXp) || requestedXp < 0) {
    throw new TypeError('EXP thi đấu phải là số nguyên không âm.');
  }

  // Use one database lock for both quota and total XP, across server processes.
  const user = await tx.queryOne('SELECT xp FROM users WHERE id = $1 FOR UPDATE', [userId]);
  if (!user) throw new Error('Không tìm thấy người dùng.');

  const quota = await getRepeatExperienceQuota(userId, tx, { occurred_at });
  const xpAwarded = Math.min(requestedXp, quota.remaining_xp);
  if (xpAwarded > 0) {
    await tx.execute(`
      INSERT INTO weekly_xp_usage (user_id, week_start, xp) VALUES ($1, $2::date, $3)
      ON CONFLICT (user_id, week_start)
      DO UPDATE SET xp = weekly_xp_usage.xp + EXCLUDED.xp
    `, [userId, quota.week_start, xpAwarded]);

    await tx.execute('UPDATE users SET xp = xp + $2 WHERE id = $1', [userId, xpAwarded]);
  }

  return {
    week_start: quota.week_start,
    used_xp: quota.used_xp + xpAwarded,
    limit_xp: quota.limit_xp,
    remaining_xp: quota.remaining_xp - xpAwarded,
    xp_awarded: xpAwarded,
    total_xp: user.xp + xpAwarded
  };
}

async function getTransactionHistory(userId, limit = 20) {
  const parsedLimit = Number.parseInt(limit, 10);
  const rowLimit = Number.isNaN(parsedLimit) ? 20 : Math.min(100, Math.max(1, parsedLimit));
  const rows = await db.query(`
    SELECT id, user_id, kind, delta, occurred_at, note, match_id, milestone_id, season_no, balance_after
    FROM v_coin_history
    WHERE user_id = $1
    ORDER BY id DESC
    LIMIT $2::integer
  `, [userId, rowLimit]);
  return rows.map(row => ({ ...row, balance_after: Number(row.balance_after) }));
}

module.exports = { getRepeatExperienceQuota, awardRepeatXpInTransaction, getTransactionHistory };
