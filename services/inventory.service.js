const db = require('../database/db');
const { deriveUserLevel } = require('../core/rules/economy.rules');
const { mutateCoinsInTransaction } = require('./wallet.service');

async function lockUser(tx, userId) {
  const user = await tx.queryOne(
    'SELECT xp, coin_balance FROM users WHERE id = $1 AND disabled_at IS NULL FOR UPDATE',
    [userId]
  );
  if (!user) throw new Error('Người dùng không tồn tại.');
  return user;
}

async function readActiveAccessory(tx, accessoryId) {
  if (typeof accessoryId !== 'string' || !accessoryId.trim()) {
    throw new Error('Mã phụ kiện không hợp lệ.');
  }
  const accessory = await tx.queryOne(
    'SELECT id, name, description, price_coins, minimum_level, status FROM accessories WHERE id = $1 FOR SHARE',
    [accessoryId]
  );
  if (!accessory) throw new Error('Không tìm thấy phụ kiện.');
  if (accessory.status !== 'ACTIVE') throw new Error('Phụ kiện đang tạm khóa.');
  return accessory;
}

async function listItems(userId) {
  return db.query(
    `SELECT a.id, a.name, a.description, a.price_coins, a.minimum_level, a.status,
            ua.accessory_id IS NOT NULL AS owned,
            u.equipped_accessory_id IS NOT DISTINCT FROM a.id AS equipped
     FROM users AS u
     CROSS JOIN accessories AS a
     LEFT JOIN user_accessories AS ua ON ua.user_id = u.id AND ua.accessory_id = a.id
     WHERE u.id = $1 AND u.disabled_at IS NULL
     ORDER BY a.status, a.price_coins, a.id`,
    [userId]
  );
}

async function purchaseItem(userId, accessoryId) {
  return db.transaction(async tx => {
    const user = await lockUser(tx, userId);
    const item = await readActiveAccessory(tx, accessoryId);
    const owned = await tx.queryOne(
      'SELECT 1 FROM user_accessories WHERE user_id = $1 AND accessory_id = $2',
      [userId, accessoryId]
    );
    if (owned) return { already_owned: true, coin_balance: user.coin_balance };

    if (deriveUserLevel(user.xp) < item.minimum_level) {
      throw new Error(`Cần đạt Cấp ${item.minimum_level} để mở khóa phụ kiện này.`);
    }
    if (user.coin_balance < item.price_coins) {
      throw new Error(`Bạn cần thêm ${item.price_coins - user.coin_balance} Xu để mở khóa phụ kiện này.`);
    }

    let coinBalance = user.coin_balance;
    if (item.price_coins > 0) {
      const wallet = await mutateCoinsInTransaction(tx, userId, -item.price_coins, 'ACCESSORY_PURCHASE', {
        note: `Mua phụ kiện: ${item.name}`
      });
      coinBalance = wallet.coin_balance;
    }
    await tx.execute(
      'INSERT INTO user_accessories (user_id, accessory_id) VALUES ($1, $2)',
      [userId, accessoryId]
    );
    return { already_owned: false, coin_balance: coinBalance };
  });
}

async function equipItem(userId, accessoryId) {
  return db.transaction(async tx => {
    await lockUser(tx, userId);
    let accessory = null;
    if (accessoryId !== null) {
      accessory = await readActiveAccessory(tx, accessoryId);
      const owned = await tx.queryOne(
        'SELECT 1 FROM user_accessories WHERE user_id = $1 AND accessory_id = $2',
        [userId, accessoryId]
      );
      if (!owned) throw new Error('Bạn chưa sở hữu phụ kiện này.');
    }
    await tx.execute(
      'UPDATE users SET equipped_accessory_id = $1 WHERE id = $2',
      [accessoryId, userId]
    );
    return { equipped_accessory: accessory };
  });
}

module.exports = { listItems, purchaseItem, equipItem };
