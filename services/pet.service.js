/**
 * Pet Service
 * Handles pet catalog, purchases, and active pet switching.
 */

const db = require('../database/db');
const { mutateCoins } = require('./economy.service');

/**
 * List all pets with user ownership and activation status
 */
async function listPets(ma_nguoi_dung) {
  const pets = await db.query('SELECT ma_thu_cung, ten_thu_cung, mo_ta, anh_dai_dien, spritesheet_url, gia_xu, cap_do_yeu_cau, he_so_sat_thuong FROM thu_cung ORDER BY gia_xu ASC');

  let ownedMap = {};
  if (ma_nguoi_dung) {
    const owned = await db.query('SELECT ma_thu_cung, dang_kich_hoat FROM thu_cung_so_huu WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
    for (const o of owned) {
      ownedMap[o.ma_thu_cung] = Boolean(o.dang_kich_hoat);
    }
  }

  return pets.map(p => ({
    ...p,
    da_so_huu: p.ma_thu_cung in ownedMap,
    dang_kich_hoat: Boolean(ownedMap[p.ma_thu_cung])
  }));
}

/**
 * Buy a new pet
 */
async function buyPet(ma_thu_cung, ma_nguoi_dung) {
  const pet = await db.queryOne('SELECT * FROM thu_cung WHERE ma_thu_cung = $1', [ma_thu_cung]);
  if (!pet) throw new Error('Không tìm thấy thú cưng này.');

  const existing = await db.queryOne(
    'SELECT ma_so_huu FROM thu_cung_so_huu WHERE ma_nguoi_dung = $1 AND ma_thu_cung = $2',
    [ma_nguoi_dung, ma_thu_cung]
  );
  if (existing) {
    throw new Error('Bạn đã sở hữu linh thú này rồi.');
  }

  // Deduct coins with ledger entry
  await mutateCoins(ma_nguoi_dung, -pet.gia_xu, 'MUA_THU_CUNG', `Mua linh thú: ${pet.ten_thu_cung}`);

  // Insert ownership
  const ma_so_huu = `own_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.execute(`
    INSERT INTO thu_cung_so_huu (ma_so_huu, ma_nguoi_dung, ma_thu_cung, dang_kich_hoat)
    VALUES ($1, $2, $3, $4)
  `, [ma_so_huu, ma_nguoi_dung, ma_thu_cung, false]);

  return {
    thanh_cong: true,
    ma_thu_cung: pet.ma_thu_cung,
    ten_thu_cung: pet.ten_thu_cung
  };
}

/**
 * Equip / Activate a pet
 */
async function equipPet(ma_thu_cung, ma_nguoi_dung) {
  const ownership = await db.queryOne(
    'SELECT ma_so_huu FROM thu_cung_so_huu WHERE ma_nguoi_dung = $1 AND ma_thu_cung = $2',
    [ma_nguoi_dung, ma_thu_cung]
  );
  if (!ownership) {
    throw new Error('Bạn chưa sở hữu linh thú này để có thể xuất trận.');
  }

  // Deactivate all pets of user first
  await db.execute('UPDATE thu_cung_so_huu SET dang_kich_hoat = $1 WHERE ma_nguoi_dung = $2', [false, ma_nguoi_dung]);

  // Activate selected pet
  await db.execute('UPDATE thu_cung_so_huu SET dang_kich_hoat = $1 WHERE ma_nguoi_dung = $2 AND ma_thu_cung = $3', [true, ma_nguoi_dung, ma_thu_cung]);

  const pet = await db.queryOne('SELECT * FROM thu_cung WHERE ma_thu_cung = $1', [ma_thu_cung]);
  return {
    thanh_cong: true,
    thu_cung_dang_dung: pet
  };
}

module.exports = {
  listPets,
  buyPet,
  equipPet
};
