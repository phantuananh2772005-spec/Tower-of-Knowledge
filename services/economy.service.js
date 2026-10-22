/**
 * Economy Service
 * Handles coin transactions, EXP accumulation, and rank progression.
 * Guarantees ACID ledger in `giao_dich_xu`.
 */

const db = require('../database/db');
const { canAfford, applyCoinChange, deriveRankTitle, deriveUserLevel } = require('../core/rules/economy.rules');

// Per-user async mutex queue to serialize concurrent balance/EXP mutations and prevent race conditions (LOGIC-010)
const userMutationLocks = new Map();

async function withUserLock(ma_nguoi_dung, fn) {
  const key = String(ma_nguoi_dung);
  const prev = userMutationLocks.get(key) || Promise.resolve();
  let release;
  const next = new Promise(resolve => { release = resolve; });
  userMutationLocks.set(key, prev.then(() => next, () => next));
  await prev.catch(() => {});
  try {
    return await fn();
  } finally {
    release();
    if (userMutationLocks.get(key) === next) {
      userMutationLocks.delete(key);
    }
  }
}

/**
 * Adjust user's coin balance with ledger entry (Atomic & Concurrency-Safe)
 * @param {string} ma_nguoi_dung
 * @param {number} so_luong (positive for reward, negative for spend)
 * @param {string} nguon_giao_dich
 * @param {string} mo_ta
 * @returns {Promise<{ newBalance: number, transactionId: string }>}
 */
async function mutateCoins(ma_nguoi_dung, so_luong, nguon_giao_dich, mo_ta = '') {
  const delta = Number(so_luong) || 0;
  if (delta === 0) {
    const user = await db.queryOne('SELECT xu_tri_thuc FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
    return { newBalance: user ? user.xu_tri_thuc : 0, transactionId: null };
  }

  return await withUserLock(ma_nguoi_dung, async () => {
    // Fetch current user inside serialized lock
    const user = await db.queryOne('SELECT xu_tri_thuc FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
    if (!user) {
      throw new Error('Người dùng không tồn tại.');
    }

    if (delta < 0 && !canAfford(user.xu_tri_thuc, Math.abs(delta))) {
      throw new Error(`Số dư không đủ. Cần ${Math.abs(delta)} xu nhưng hiện chỉ có ${user.xu_tri_thuc} xu.`);
    }

    const coinResult = applyCoinChange(user.xu_tri_thuc, delta);
    if (!coinResult.isSuccess) {
      throw new Error(coinResult.errorMessage || 'Số dư Xu Tri Thức không đủ để thực hiện giao dịch.');
    }

    const ma_giao_dich = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Atomic relative update with non-negative balance guard in SQL
    if (delta < 0) {
      await db.execute(
        'UPDATE nguoi_dung SET xu_tri_thuc = xu_tri_thuc + $1, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $2 AND xu_tri_thuc + $1 >= 0',
        [delta, ma_nguoi_dung]
      );
    } else {
      await db.execute(
        'UPDATE nguoi_dung SET xu_tri_thuc = xu_tri_thuc + $1, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $2',
        [delta, ma_nguoi_dung]
      );
    }

    const updatedUser = await db.queryOne('SELECT xu_tri_thuc FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
    const newBalance = updatedUser ? updatedUser.xu_tri_thuc : coinResult.newCoins;

    await db.execute(
      'INSERT INTO giao_dich_xu (ma_giao_dich, ma_nguoi_dung, so_luong, so_du_sau, nguon_giao_dich, mo_ta, thoi_gian) VALUES ($1, $2, $3, $4, $5, $6, SYSDATETIME())',
      [ma_giao_dich, ma_nguoi_dung, delta, newBalance, nguon_giao_dich, mo_ta]
    );

    return { newBalance, transactionId: ma_giao_dich };
  });
}

/**
 * Add EXP to user and return new EXP, rank, and level
 * @param {string} ma_nguoi_dung
 * @param {number} expToAdd
 */
async function addExperience(ma_nguoi_dung, expToAdd) {
  const deltaExp = Number(expToAdd) || 0;
  if (deltaExp <= 0) return;

  return await withUserLock(ma_nguoi_dung, async () => {
    const user = await db.queryOne('SELECT tong_diem_kinh_nghiem FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
    if (!user) throw new Error('Người dùng không tồn tại.');

    await db.execute(
      'UPDATE nguoi_dung SET tong_diem_kinh_nghiem = tong_diem_kinh_nghiem + $1, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $2',
      [deltaExp, ma_nguoi_dung]
    );

    const updated = await db.queryOne('SELECT tong_diem_kinh_nghiem FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
    const newExp = updated ? updated.tong_diem_kinh_nghiem : (user.tong_diem_kinh_nghiem + deltaExp);
    const newRank = deriveRankTitle(newExp);
    const newLevel = deriveUserLevel(newExp);
    return { newExp, newRank, newLevel };
  });
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
