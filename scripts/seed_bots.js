const db = require('../database/db');

async function ensureBotUsers() {
  const bots = [
    {
      id: 'usr_bot_001',
      username: 'bot_tapsu',
      email: 'bot_tapsu@hocvien.tok.vn',
      name: 'Đấu Sĩ Tập Sự',
      frame: 'khung_khoi_dau',
      hash: '$2a$10$W04xIE.JXjb4d6l0vksEzOHJXn60IrjvN42c1/tTqDEoqJmwgq806',
      exp: 120,
      coins: 50,
      streak: 2,
      pet: 'pet_sparky'
    },
    {
      id: 'usr_bot_002',
      username: 'bot_luky',
      email: 'bot_luky@hocvien.tok.vn',
      name: 'Chiến Binh Lữ Khách',
      frame: 'khung_tinh_thong',
      hash: '$2a$10$W04xIE.JXjb4d6l0vksEzOHJXn60IrjvN42c1/tTqDEoqJmwgq806',
      exp: 450,
      coins: 120,
      streak: 5,
      pet: 'pet_kitsune'
    },
    {
      id: 'usr_bot_003',
      username: 'bot_caothu',
      email: 'bot_caothu@hocvien.tok.vn',
      name: 'Hộ Vệ Tri Thức',
      frame: 'khung_vang_dai_su',
      hash: '$2a$10$W04xIE.JXjb4d6l0vksEzOHJXn60IrjvN42c1/tTqDEoqJmwgq806',
      exp: 850,
      coins: 250,
      streak: 9,
      pet: 'pet_golem'
    }
  ];

  for (const b of bots) {
    const exist = await db.queryOne('SELECT ma_nguoi_dung FROM nguoi_dung WHERE ma_nguoi_dung = $1', [b.id]);
    if (!exist) {
      await db.execute(`
        INSERT INTO nguoi_dung (
          ma_nguoi_dung, ten_dang_nhap, email, mat_khau_hash, ten_hien_thi,
          khung_avatar, vai_tro, tong_diem_kinh_nghiem, xu_tri_thuc, chuoi_streak_ngay,
          chuoi_thang_arena, chuoi_thang_cao_nhat_arena,
          ngay_hoat_dong_cuoi, che_do_giao_dien, bat_am_thanh
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, 'HE_THONG', $7, $8, $9,
          $9, $9,
          CAST(SYSDATETIME() AS DATE), 'TOI', $10
        )
      `, [b.id, b.username, b.email, b.hash, b.name, b.frame, b.exp, b.coins, b.streak, true]);

      console.log('✓ Inserted bot user:', b.id, b.name);
    } else {
      await db.execute('UPDATE nguoi_dung SET vai_tro = $1 WHERE ma_nguoi_dung = $2',['HE_THONG',b.id]);
      console.log('✓ Bot user exists:', b.id, b.name);
    }

    // Ensure bot pet ownership
    const ownExist = await db.queryOne('SELECT ma_so_huu FROM thu_cung_so_huu WHERE ma_nguoi_dung = $1 AND ma_thu_cung = $2', [b.id, b.pet]);
    if (!ownExist) {
      await db.execute(`
        INSERT INTO thu_cung_so_huu (ma_so_huu, ma_nguoi_dung, ma_thu_cung, dang_kich_hoat)
        VALUES ($1, $2, $3, $4)
      `, ['own_' + b.id, b.id, b.pet, true]);
      console.log('✓ Assigned pet', b.pet, 'to bot', b.id);
    }
  }
}

if (require.main === module) {
  ensureBotUsers()
    .then(() => {
      console.log('All bot users ensured successfully!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Failed to ensure bot users:', err);
      process.exit(1);
    });
}

module.exports = { ensureBotUsers };
