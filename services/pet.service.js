const crypto = require('crypto');
const db = require('../database/db');
const catalog = require('../config/pets.json');
const { deriveUserLevel } = require('../core/rules/economy.rules');
const { withUserLock } = require('./economy.service');

const configFor = id => catalog.find(p => p.serverId === id || p.id === id);
const isAdmin = user => user?.vai_tro === 'QUAN_TRI_VIEN';
function formatPet(pet) {
  if (!pet) return null;
  const config = configFor(pet.ma_thu_cung);
  return { ...pet, frontend_id: config?.id || pet.ma_thu_cung,
    icon: config?.icon || '🐾', role: config?.role || 'learner',
    ten_thu_cung: config?.name || pet.ten_thu_cung, mo_ta: config?.buff || pet.mo_ta,
    anh_dai_dien: config?.image || pet.anh_dai_dien, spritesheet_url: config?.image || pet.spritesheet_url };
}
async function lockUser(tx, id) {
  const user = await tx.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1' + (db.isPostgres ? ' FOR UPDATE' : ''), [id]);
  if (!user) throw new Error('Người dùng không tồn tại.');
  return user;
}
async function grantOwned(tx, userId, petId) {
  const existing = await tx.queryOne('SELECT ma_so_huu FROM thu_cung_so_huu WHERE ma_nguoi_dung = $1 AND ma_thu_cung = $2', [userId, petId]);
  if (!existing) await tx.execute(`INSERT INTO thu_cung_so_huu (ma_so_huu,ma_nguoi_dung,ma_thu_cung,dang_kich_hoat)
    VALUES ($1,$2,$3,$4)`, [crypto.randomUUID(), userId, petId, false]);
}
async function listPets(userId) {
  const pets = await db.query('SELECT * FROM thu_cung ORDER BY gia_xu ASC');
  let owned = [];
  if (userId) {
    await withUserLock(userId, () => db.transaction(async tx => {
      const user = await lockUser(tx, userId);
      if (isAdmin(user)) for (const p of catalog.filter(p => p.role === 'admin')) {
        if (pets.some(row => row.ma_thu_cung === p.serverId)) await grantOwned(tx, userId, p.serverId);
      }
    }));
    owned = await db.query('SELECT ma_thu_cung,dang_kich_hoat FROM thu_cung_so_huu WHERE ma_nguoi_dung = $1', [userId]);
  }
  return pets.filter(p => configFor(p.ma_thu_cung)).map(p => {
    const own = owned.find(o => o.ma_thu_cung === p.ma_thu_cung);
    return { ...formatPet(p), da_so_huu: Boolean(own), dang_kich_hoat: Boolean(own?.dang_kich_hoat) };
  });
}
async function buyPet(id, userId) {
  return withUserLock(userId, () => db.transaction(async tx => {
    const user = await lockUser(tx, userId);
    const config = configFor(id);
    if (!config) throw new Error('Không tìm thấy linh thú này.');
    if (config.role === 'admin' && !isAdmin(user)) throw new Error('Linh thú này dành riêng cho Quản trị viên.');
    const pet = await tx.queryOne('SELECT * FROM thu_cung WHERE ma_thu_cung = $1', [config.serverId]);
    if (!pet) throw new Error('Linh thú chưa có trong danh mục máy chủ.');
    const own = await tx.queryOne('SELECT ma_so_huu FROM thu_cung_so_huu WHERE ma_nguoi_dung = $1 AND ma_thu_cung = $2', [userId, pet.ma_thu_cung]);
    if (own) return { thanh_cong: true, alreadyOwned: true, ma_thu_cung: pet.ma_thu_cung };
    if (deriveUserLevel(user.tong_diem_kinh_nghiem) < pet.cap_do_yeu_cau) throw new Error(`Cần đạt Cấp ${pet.cap_do_yeu_cau} để mở khóa linh thú này.`);
    const price = config.role === 'admin' ? 0 : Number(pet.gia_xu);
    if (user.xu_tri_thuc < price) throw new Error(`Bạn cần thêm ${price - user.xu_tri_thuc} Xu.`);
    if (price > 0) {
      await tx.execute('UPDATE nguoi_dung SET xu_tri_thuc = xu_tri_thuc + $1, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $2', [-price, userId]);
      await tx.execute(`INSERT INTO giao_dich_xu (ma_giao_dich,ma_nguoi_dung,so_luong,so_du_sau,nguon_giao_dich,mo_ta)
        VALUES ($1,$2,$3,$4,$5,$6)`, [crypto.randomUUID(),userId,-price,user.xu_tri_thuc-price,'MUA_THU_CUNG',`Mua linh thú: ${pet.ten_thu_cung}`]);
    }
    await grantOwned(tx,userId,pet.ma_thu_cung);
    return { thanh_cong: true, ma_thu_cung: pet.ma_thu_cung, newCoins: user.xu_tri_thuc-price };
  }));
}
async function equipPet(id, userId) {
  return withUserLock(userId, () => db.transaction(async tx => {
    const user = await lockUser(tx,userId);
    const config = configFor(id);
    if (!config) throw new Error('Không tìm thấy linh thú này.');
    if (config.role === 'admin' && !isAdmin(user)) throw new Error('Linh thú này dành riêng cho Quản trị viên.');
    if (config.role === 'admin') await grantOwned(tx,userId,config.serverId);
    const own = await tx.queryOne('SELECT ma_so_huu FROM thu_cung_so_huu WHERE ma_nguoi_dung = $1 AND ma_thu_cung = $2', [userId,config.serverId]);
    if (!own) throw new Error('Bạn chưa sở hữu linh thú này.');
    await tx.execute('UPDATE thu_cung_so_huu SET dang_kich_hoat = $1 WHERE ma_nguoi_dung = $2', [false,userId]);
    await tx.execute('UPDATE thu_cung_so_huu SET dang_kich_hoat = $1 WHERE ma_nguoi_dung = $2 AND ma_thu_cung = $3',[true,userId,config.serverId]);
    return { thanh_cong: true, thu_cung_dang_dung: formatPet(await tx.queryOne('SELECT * FROM thu_cung WHERE ma_thu_cung = $1',[config.serverId])) };
  }));
}
module.exports = { listPets, buyPet, equipPet, formatPet };
