const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tower_of_knowledge_ultra_secure_jwt_secret_2026';

function generateToken(userId, username) {
  return jwt.sign({
    ma_nguoi_dung: userId,
    ten_dang_nhap: username,
    vai_tro: 'NGUOI_HOC'
  }, JWT_SECRET, { expiresIn: '1h' });
}

async function testTurnPvp() {
  console.log('--- TEST PVP 2 NGƯỜI CHƠI TRẢ LỜI & GÂY SÁT THƯƠNG ---');
  const u1 = 'usr_pvp_1';
  const u2 = 'usr_pvp_2';
  const t1 = generateToken(u1, 'pvp_alpha');
  const t2 = generateToken(u2, 'pvp_beta');

  const s1 = io('http://localhost:3000', { auth: { token: t1 }, transports: ['websocket'] });
  const s2 = io('http://localhost:3000', { auth: { token: t2 }, transports: ['websocket'] });

  await new Promise(r => setTimeout(r, 500));

  let matchId = null;

  s1.emit('join_queue', { ma_mon: 'mon_csdl' });
  await new Promise(r => setTimeout(r, 300));
  s2.emit('join_queue', { ma_mon: 'mon_csdl' });

  await new Promise((resolve) => {
    let mCount = 0;
    s1.once('match_found', (data) => {
      console.log('✓ S1 match_found:', data.ma_tran, 'Bot?', data.doi_thu_la_bot);
      matchId = data.ma_tran;
      mCount++;
      if (mCount === 2) resolve();
    });
    s2.once('match_found', (data) => {
      console.log('✓ S2 match_found:', data.ma_tran, 'Bot?', data.doi_thu_la_bot);
      mCount++;
      if (mCount === 2) resolve();
    });
  });

  console.log(`\nTrận đấu khởi tạo: ${matchId}`);
  s1.emit('join_match_room', { ma_tran: matchId });
  s2.emit('join_match_room', { ma_tran: matchId });

  await new Promise(r => setTimeout(r, 400));

  // Lắng nghe turn_resolved trên cả 2 socket
  s1.on('turn_resolved', (d) => {
    console.log(`[S1 NHẬN turn_resolved]: người trả lời = ${d.nguoi_tra_loi}, đúng? ${d.la_dap_an_dung}, dmg = ${d.sat_thuong_gay_ra}`);
  });
  s2.on('turn_resolved', (d) => {
    console.log(`[S2 NHẬN turn_resolved]: người trả lời = ${d.nguoi_tra_loi}, đúng? ${d.la_dap_an_dung}, dmg = ${d.sat_thuong_gay_ra}`);
  });

  // User 1 trả lời câu 1
  console.log('\nUser 1 (S1) gửi submit_answer cho câu 1...');
  s1.emit('submit_answer', {
    ma_tran: matchId,
    thu_tu_cau: 1,
    vi_tri_dap_an_chon: 1,
    cau_tra_loi: { isCorrect: true, da_hoan_thanh: true },
    thoi_gian_giay: 2.5
  });

  await new Promise(r => setTimeout(r, 1500));

  // User 2 trả lời câu 1
  console.log('\nUser 2 (S2) gửi submit_answer cho câu 1...');
  s2.emit('submit_answer', {
    ma_tran: matchId,
    thu_tu_cau: 1,
    vi_tri_dap_an_chon: 1,
    cau_tra_loi: { isCorrect: true, da_hoan_thanh: true },
    thoi_gian_giay: 3.0
  });

  await new Promise(r => setTimeout(r, 1500));

  s1.disconnect();
  s2.disconnect();
  console.log('--- HOÀN TẤT KIỂM THỬ ---');
  process.exit(0);
}

testTurnPvp().catch(err => {
  console.error('Lỗi:', err);
  process.exit(1);
});
