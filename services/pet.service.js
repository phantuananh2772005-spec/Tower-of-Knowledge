const db = require('../database/db');
const petPresentation = require('../config/pets.json');
const { deriveUserLevel } = require('../core/rules/economy.rules');
const { mutateCoinsInTransaction } = require('./wallet.service');

function formatPet(pet) {
  if (!pet?.id) return null;
  const presentation = petPresentation.find(entry => entry.serverId === pet.id);
  return {
    ...pet,
    frontend_id: presentation?.id ?? pet.id,
    icon: presentation?.icon ?? '🐾'
  };
}

async function lockUser(tx, userId) {
  const user = await tx.queryOne(
    'SELECT id, role, xp, coin_balance, disabled_at FROM users WHERE id = $1 FOR UPDATE',
    [userId]
  );
  if (!user || user.disabled_at != null || user.role === 'SYSTEM') {
    throw new Error('Tài khoản không khả dụng.');
  }
  return user;
}

async function lockPet(tx, petId) {
  const pet = await tx.queryOne('SELECT * FROM pets WHERE id = $1 FOR SHARE', [petId]);
  if (!pet) throw new Error('Không tìm thấy linh thú này.');
  return pet;
}

function checkRequiredRole(user, pet) {
  if (pet.required_role !== null && user.role !== pet.required_role) {
    throw new Error('Linh thú này dành riêng cho Quản trị viên.');
  }
}

async function readCatalog(conn, userId) {
  const pets = await conn.query(`
    SELECT p.*, up.user_id IS NOT NULL AS owned,
           COALESCE(u.equipped_pet_id = p.id, false) AS equipped
    FROM pets AS p
    LEFT JOIN users AS u ON u.id = $1
    LEFT JOIN user_pets AS up ON up.user_id = u.id AND up.pet_id = p.id
    WHERE p.status = 'ACTIVE' OR up.user_id IS NOT NULL
    ORDER BY p.price_coins, p.id
  `, [userId]);
  return pets.map(formatPet);
}

async function listPets(userId = null) {
  if (userId === null) return readCatalog(db, null);
  return db.transaction(async tx => {
    const user = await lockUser(tx, userId);
    if (user.role === 'ADMIN') {
      // The role grants eligible catalog pets without creating a purchase.
      await tx.execute(`
        INSERT INTO user_pets (user_id, pet_id)
        SELECT $1, p.id
        FROM pets AS p
        WHERE required_role = 'ADMIN' AND status = 'ACTIVE' AND minimum_level <= $2
        ORDER BY p.id
        FOR SHARE OF p
        ON CONFLICT (user_id, pet_id) DO NOTHING
      `, [user.id, deriveUserLevel(user.xp)]);
    }
    return readCatalog(tx, userId);
  });
}

async function buyPet(petId, userId) {
  return db.transaction(async tx => {
    const user = await lockUser(tx, userId);
    const pet = await lockPet(tx, petId);
    checkRequiredRole(user, pet);

    const alreadyOwned = { pet_id: pet.id, already_owned: true, coin_balance: user.coin_balance };
    if (await tx.queryOne('SELECT pet_id FROM user_pets WHERE user_id = $1 AND pet_id = $2', [userId, petId])) {
      return alreadyOwned;
    }
    if (pet.status !== 'ACTIVE') throw new Error('Linh thú này đã ngừng bán.');
    if (deriveUserLevel(user.xp) < pet.minimum_level) {
      throw new Error(`Cần đạt Cấp ${pet.minimum_level} để mở khóa linh thú này.`);
    }

    const price = pet.required_role === 'ADMIN' ? 0 : pet.price_coins;
    if (user.coin_balance < price) throw new Error(`Bạn cần thêm ${price - user.coin_balance} Xu.`);

    const ownership = await tx.queryOne(`
      INSERT INTO user_pets (user_id, pet_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, pet_id) DO NOTHING
      RETURNING pet_id
    `, [user.id, pet.id]);
    if (!ownership) return alreadyOwned;

    const wallet = price > 0
      ? await mutateCoinsInTransaction(tx, user.id, -price, 'PET_PURCHASE', { note: `Mua linh thú: ${pet.name}` })
      : user;
    return { pet_id: pet.id, already_owned: false, coin_balance: wallet.coin_balance };
  });
}

async function equipPet(petId, userId) {
  return db.transaction(async tx => {
    const user = await lockUser(tx, userId);
    const pet = await lockPet(tx, petId);
    checkRequiredRole(user, pet);

    const owned = await tx.queryOne('SELECT pet_id FROM user_pets WHERE user_id = $1 AND pet_id = $2', [userId, petId]);
    if (!owned) throw new Error('Bạn chưa sở hữu linh thú này.');
    await tx.execute('UPDATE users SET equipped_pet_id = $1 WHERE id = $2', [pet.id, user.id]);
    return { equipped_pet: formatPet(pet) };
  });
}

async function carePet(userId, action) {
  if (action !== 'feed' && action !== 'pet') throw new Error('Thao tác chăm sóc không hợp lệ.');
  return db.transaction(async tx => {
    const user = await lockUser(tx, userId);
    const feeding = action === 'feed';
    if (feeding && user.coin_balance < 10) throw new Error('Bạn cần 10 Xu để cho Pet ăn.');
    const { coin_balance } = await mutateCoinsInTransaction(
      tx, user.id, feeding ? -10 : 0, feeding ? 'PET_FEED' : 'PET_STROKE',
      { note: feeding ? 'Cho Pet ăn' : 'Vuốt ve Pet' }
    );
    return { action, coin_balance };
  });
}

module.exports = { listPets, buyPet, equipPet, carePet, formatPet };
