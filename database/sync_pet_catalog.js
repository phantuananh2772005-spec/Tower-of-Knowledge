const db = require('./db');
const catalog = require('../config/pets.json');

// Add missing pets without changing balances, ownership or learning progress.
async function syncPetCatalog() {
  for (const pet of catalog) {
    const existing = await db.queryOne('SELECT ma_thu_cung FROM thu_cung WHERE ma_thu_cung = $1', [pet.serverId]);
    if (!existing) await db.execute(`INSERT INTO thu_cung
      (ma_thu_cung, ten_thu_cung, mo_ta, anh_dai_dien, spritesheet_url, gia_xu, cap_do_yeu_cau, he_so_sat_thuong)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [pet.serverId, pet.name, pet.buff, pet.image, pet.image, pet.price, pet.requiredLevel, pet.damageMultiplier]);
  }
}
module.exports = { syncPetCatalog };
