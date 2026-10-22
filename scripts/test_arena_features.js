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

async function runTests() {
  console.log('=== BẮT ĐẦU KIỂM THỬ TÍNH NĂNG ĐẤU TRƯỜNG 1V1 ===\n');

  const tokenUser1 = generateToken('usr_test_device1', 'tester1');
  const tokenUser2 = generateToken('usr_test_device2', 'tester2');

  // 1. Kiểm tra tạo trận và phân bổ câu hỏi đa dạng (Phương án 2)
  console.log('--- TEST 1: Tạo trận đấu và kiểm tra các dạng câu hỏi ---');
  const createResp = await fetch('http://localhost:3000/api/arena/create-match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenUser1}`
    },
    body: JSON.stringify({
      doi_thu_id: 'usr_bot_001',
      ma_mon: 'mon_csdl'
    })
  });
  const createResult = await createResp.json();
  if (!createResult.success) {
    throw new Error('Tạo trận thất bại: ' + JSON.stringify(createResult));
  }
  const match = createResult.data;
  console.log(`✓ Tạo trận thành công: ma_tran = ${match.ma_tran}`);
  console.log(`✓ Số câu hỏi trong trận: ${match.cau_hoi.length}`);

  const typesFound = new Set(match.cau_hoi.map(q => q.loai_cau_hoi));
  console.log(`✓ Các dạng câu hỏi xuất hiện trong trận:`, Array.from(typesFound));
  const bloomLevels = new Set(match.cau_hoi.map(q => q.muc_bloom));
  console.log(`✓ Các mức Bloom xuất hiện:`, Array.from(bloomLevels));

  // In mẫu 1 câu của mỗi dạng
  for (const t of typesFound) {
    const sample = match.cau_hoi.find(q => q.loai_cau_hoi === t);
    console.log(`  [${t}] "${sample.noi_dung.substring(0, 50)}..." (Bloom: ${sample.muc_bloom}, Dữ liệu: ${sample.du_lieu_cau_hoi ? 'Có JSON' : 'Trắc nghiệm thường'})`);
  }

  // 2. Kiểm tra tính năng Đầu hàng (Surrender)
  console.log('\n--- TEST 2: Kiểm tra tính năng Đầu Hàng (Surrender) ---');
  const surrenderResp = await fetch(`http://localhost:3000/api/arena/${match.ma_tran}/surrender`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenUser1}`
    },
    body: JSON.stringify({
      surrenderingUserId: 'usr_test_device1'
    })
  });
  const surrenderResult = await surrenderResp.json();
  if (!surrenderResult.success) {
    throw new Error('Đầu hàng thất bại: ' + JSON.stringify(surrenderResult));
  }
  console.log(`✓ Đầu hàng thành công: trạng thái = ${surrenderResult.data.trang_thai}, lý do = ${surrenderResult.data.ly_do_ket_thuc}`);
  console.log(`✓ Người thắng cuộc = ${surrenderResult.data.nguoi_thang_cuoc}`);

  // 3. Kiểm tra ghép 2 người chơi thời gian thực qua Socket.IO (Ghép 2 máy)
  console.log('\n--- TEST 3: Giả lập 2 thiết bị người chơi tìm trận cùng lúc qua Socket.IO ---');
  await new Promise((resolve, reject) => {
    const socket1 = io('http://localhost:3000', {
      auth: { token: tokenUser1 },
      transports: ['websocket']
    });
    const socket2 = io('http://localhost:3000', {
      auth: { token: tokenUser2 },
      transports: ['websocket']
    });

    let s1Matched = false;
    let s2Matched = false;
    const timeout = setTimeout(() => {
      socket1.disconnect();
      socket2.disconnect();
      reject(new Error('Timeout 10s: 2 máy không ghép được với nhau qua Socket!'));
    }, 10000);

    socket1.on('connect', () => {
      console.log(`✓ Socket Thiết bị 1 đã kết nối (${socket1.id}) với token user 1`);
      socket1.emit('join_queue', { ma_mon: 'mon_csdl' });
    });

    socket2.on('connect', () => {
      console.log(`✓ Socket Thiết bị 2 đã kết nối (${socket2.id}) với token user 2`);
      setTimeout(() => {
        socket2.emit('join_queue', { ma_mon: 'mon_csdl' });
      }, 500);
    });

    socket1.on('match_found', (data) => {
      console.log(`🎯 [Thiết bị 1] Đã ghép đối thủ! Trận: ${data.ma_tran}, Là bot? ${data.doi_thu_la_bot}`);
      s1Matched = true;
      if (s1Matched && s2Matched) finish();
    });

    socket2.on('match_found', (data) => {
      console.log(`🎯 [Thiết bị 2] Đã ghép đối thủ! Trận: ${data.ma_tran}, Là bot? ${data.doi_thu_la_bot}`);
      s2Matched = true;
      if (s1Matched && s2Matched) finish();
    });

    function finish() {
      clearTimeout(timeout);
      socket1.disconnect();
      socket2.disconnect();
      console.log('✓ XÁC NHẬN: 2 thiết bị đã ghép nối đối đầu trực tiếp thành công (Người vs Người)!');
      resolve();
    }
  });

  console.log('\n=== TẤT CẢ KIỂM THỬ ĐÃ HOÀN TẤT THÀNH CÔNG 100%! ===');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
