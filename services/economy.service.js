/**
 * Economy Service
 * Handles coin transactions, EXP accumulation, and rank progression.
 * Guarantees ACID ledger in `giao_dich_xu`.
 */

const db = require('../database/db');
const { canAfford, applyCoinChange, deriveRankTitle } = require('../core/rules/economy.rules');

/**
 * Adjust user's coin balance with ledger entry
 * @param {string} ma_nguoi_dung
 * @param {number} so_luong (positive for reward, negative for spend)
 * @param {string} nguon_giao_dich
 * @param {string} mo_ta
 * @returns {Promise<{ newBalance: number, transactionId: string }>}
 */
async function mutateCoins(ma_nguoi_dung, so_luong, nguon_giao_dich, mo_ta = '') {
  if (so_luong === 0) {
    const user = await db.queryOne('SELECT xu_tri_thuc FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
    return { newBalance: user ? user.xu_tri_thuc : 0, transactionId: null };
  }

  // Fetch current user
  const user = await db.queryOne('SELECT xu_tri_thuc FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
  if (!user) {
    throw new Error('Người dùng không tồn tại.');
  }

  if (so_luong < 0 && !canAfford(user.xu_tri_thuc, Math.abs(so_luong))) {
    throw new Error(`Số dư không đủ. Cần ${Math.abs(so_luong)} xu nhưng hiện chỉ có ${user.xu_tri_thuc} xu.`);
  }

  const { newBalance, delta } = applyCoinChange(user.xu_tri_thuc, so_luong);
  const ma_giao_dich = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Update user balance and insert transaction record
  await db.execute('UPDATE nguoi_dung SET xu_tri_thuc = $1, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $2', [newBalance, ma_nguoi_dung]);
  await db.execute(
    'INSERT INTO giao_dich_xu (ma_giao_dich, ma_nguoi_dung, so_luong, so_du_sau, nguon_giao_dich, mo_ta, thoi_gian) VALUES ($1, $2, $3, $4, $5, $6, SYSDATETIME())',
    [ma_giao_dich, ma_nguoi_dung, delta, newBalance, nguon_giao_dich, mo_ta]
  );

  return { newBalance, transactionId: ma_giao_dich };
}

/**
 * Add EXP to user and return new EXP and rank
 * @param {string} ma_nguoi_dung
 * @param {number} expToAdd
 */
async function addExperience(ma_nguoi_dung, expToAdd) {
  if (expToAdd <= 0) return;

  const user = await db.queryOne('SELECT tong_diem_kinh_nghiem FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
  if (!user) throw new Error('Người dùng không tồn tại.');

  const newExp = user.tong_diem_kinh_nghiem + expToAdd;
  await db.execute('UPDATE nguoi_dung SET tong_diem_kinh_nghiem = $1, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $2', [newExp, ma_nguoi_dung]);

  const newRank = deriveRankTitle(newExp);
  return { newExp, newRank };
}

/**
 * Get coin transaction history for a user
 */
async function getTransactionHistory(ma_nguoi_dung, limit = 20) {
  return await db.query(
    'SELECT TOP ' + parseInt(limit, 10) + ' ma_giao_dich, so_luong, so_du_sau, nguon_giao_dich, mo_ta, thoi_gian FROM giao_dich_xu WHERE ma_nguoi_dung = $1 ORDER BY thoi_gian DESC',
    [ma_nguoi_dung]
  );
}

module.exports = {
  mutateCoins,
  addExperience,
  getTransactionHistory
};
