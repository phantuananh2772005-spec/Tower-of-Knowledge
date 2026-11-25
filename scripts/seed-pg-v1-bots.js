const { statSync } = require('node:fs');
const path = require('node:path');
const db = require('../database/db');
const catalog = require('../public/assets/pets/bot_admin_pets_catalog.json');

const arenaBots = [
  { username: 'bot_tapsu', displayName: 'Đấu Sĩ Tập Sự', petId: 'bot_gloop', petName: 'Slime Mọt Sách Gloop' },
  { username: 'bot_luky', displayName: 'Chiến Binh Lữ Khách', petId: 'bot_tickbot', petName: 'Cú Cót Tickbot' },
  { username: 'bot_caothu', displayName: 'Hộ Vệ Tri Thức', petId: 'bot_glitchy', petName: 'Bóng Ma Lỗi Glitchy' }
];

function idleImage(petId) {
  const entry = catalog.find(pet => pet.pet_id === petId && pet.role === 'bot' && pet.facing === 'left');
  const gif = entry?.states?.idle?.gif;
  if (gif !== petId + '_idle.gif') throw new Error('Thiếu cấu hình ảnh chờ của Pet ' + petId + '.');
  const relativePath = 'assets/pets/' + petId + '/03_spritesheet/' + gif;
  const file = path.resolve(__dirname, '..', 'public', relativePath);
  if (!statSync(file, { throwIfNoEntry: false })?.isFile()) {
    throw new Error('Không tìm thấy ảnh chờ của Pet ' + petId + '.');
  }
  return '/' + relativePath;
}

async function seedArenaBots(tx) {
  const bots = arenaBots.map(bot => ({ ...bot, imagePath: idleImage(bot.petId) }));
  const seeded = [];
  for (const bot of bots) {
    const email = bot.username + '@hocvien.tok.vn';
    let user = await tx.queryOne(
      "INSERT INTO users (username, email, display_name, role) VALUES ($1, $2, $3, 'SYSTEM')"
      + ' ON CONFLICT DO NOTHING RETURNING id, username, email, role',
      [bot.username, email, bot.displayName]
    );
    if (!user) {
      const owners = await tx.query(
        'SELECT id, username, email, role FROM users WHERE username = $1 OR email = $2 ORDER BY id FOR UPDATE',
        [bot.username, email]
      );
      if (owners.length !== 1 || owners[0].username !== bot.username || owners[0].email !== email
        || owners[0].role !== 'SYSTEM') {
        throw new Error('Tên đăng nhập hoặc email của bot ' + bot.username + ' đang thuộc tài khoản khác.');
      }
      [user] = owners;
    }

    // An archived catalog entry stays visible for its owner and unavailable in the Shop.
    await tx.execute(
      "INSERT INTO pets (id, name, description, image_path, price_coins, minimum_level, status)"
      + " VALUES ($1, $2, 'Linh thú đấu tập', $3, 0, 1, 'ARCHIVED') ON CONFLICT (id) DO NOTHING",
      [bot.petId, bot.petName, bot.imagePath]
    );
    const pet = await tx.queryOne('SELECT status, image_path, required_role FROM pets WHERE id = $1 FOR SHARE',
      [bot.petId]);
    if (pet.status !== 'ARCHIVED' || pet.image_path !== bot.imagePath || pet.required_role !== null) {
      throw new Error('Mã Pet ' + bot.petId + ' đang có cấu hình khác với linh thú đấu tập.');
    }

    await tx.execute(
      'INSERT INTO user_pets (user_id, pet_id) VALUES ($1, $2) ON CONFLICT (user_id, pet_id) DO NOTHING',
      [user.id, bot.petId]
    );
    await tx.execute('UPDATE users SET equipped_pet_id = $2 WHERE id = $1 AND equipped_pet_id IS DISTINCT FROM $2',
      [user.id, bot.petId]);
    seeded.push({ id: user.id, username: user.username, pet_id: bot.petId, image_path: bot.imagePath });
  }
  return seeded;
}

if (require.main === module) {
  (async () => {
    await db.verifyRuntime();
    const bots = await db.transaction(seedArenaBots);
    console.log('Đã xác nhận ' + bots.length + ' bot Đấu trường với Pet riêng.');
  })().catch(error => {
    console.error('Seed bot Đấu trường thất bại:', error.message);
    process.exitCode = 1;
  }).finally(() => db.close());
}

module.exports = { seedArenaBots };
