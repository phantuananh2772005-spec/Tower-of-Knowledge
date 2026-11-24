const { applyCoinChange } = require('../core/rules/economy.rules');

async function mutateCoinsInTransaction(tx, userId, delta, kind, {
  note = null, match_id = null, milestone_id = null, season_no = null, occurred_at = null
} = {}) {
  if (!Number.isSafeInteger(delta)) throw new Error('Số Xu thay đổi phải là số nguyên.');

  const user = await tx.queryOne('SELECT coin_balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
  if (!user) throw new Error('Người dùng không tồn tại.');
  const change = applyCoinChange(user.coin_balance, delta);
  if (!change.isSuccess) throw new Error(change.errorMessage);

  // The wallet row lock and both writes share the caller's transaction.
  const entry = await tx.queryOne(
    'INSERT INTO coin_ledger (user_id, kind, delta, note, match_id, milestone_id, season_no, occurred_at)'
      + ' VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, clock_timestamp())) RETURNING id',
    [userId, kind, delta, note, match_id, milestone_id, season_no, occurred_at]
  );
  const updated = await tx.queryOne(
    'UPDATE users SET coin_balance = $1 WHERE id = $2 RETURNING coin_balance',
    [change.newCoins, userId]
  );
  return { coin_balance: updated.coin_balance, ledger_id: entry.id };
}

module.exports = { mutateCoinsInTransaction };
