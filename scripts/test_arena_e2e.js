const arenaService = require('../services/arena.service');
const db = require('../database/db');

async function testArenaCombatFlow() {
  console.log('⚔️ Running Full 1v1 Arena Combat Flow Test...');

  // 1. Create a match between admin and bot_luky
  const match = await arenaService.createMatch('usr_admin_001', 'usr_bot_002', 'mon_csdl');
  console.log('1. Match created successfully:');
  console.log('   - ID:', match.ma_tran);
  console.log('   - Status:', match.trang_thai);
  console.log('   - Total questions:', match.cau_hoi.length);
  console.log('   - Players:', match.nguoi_choi.map(p => `${p.ten_hien_thi} (HP: ${p.mau_hien_tai}/${p.mau_toi_da}, Pet: ${p.thu_cung ? p.thu_cung.ten_thu_cung : 'None'})`).join(' VS '));

  if (match.nguoi_choi.length !== 2) {
    throw new Error(`Expected 2 players in match, but got ${match.nguoi_choi.length}`);
  }

  // 2. Submit Turn 1 for Player 1 (Correct answer, fast reaction 2.5s)
  const q1 = match.cau_hoi[0];
  console.log(`2. Answering Question 1: "${q1.noi_dung.substring(0, 45)}..."`);

  // Find correct answer index
  const qDetail = await db.queryOne('SELECT vi_tri_dap_an_dung FROM cau_hoi WHERE noi_dung = $1', [q1.noi_dung]);
  const correctChoice = qDetail ? qDetail.vi_tri_dap_an_dung : 0;

  const turn1 = await arenaService.submitTurnAnswer({
    ma_tran: match.ma_tran,
    ma_nguoi_dung: 'usr_admin_001',
    thu_tu_cau: 1,
    vi_tri_dap_an_chon: correctChoice,
    thoi_gian_giay: 2.5
  });

  console.log('   - Correct?', turn1.la_dap_an_dung);
  console.log('   - Critical Hit?', turn1.la_chi_mang);
  console.log('   - Damage dealt:', turn1.sat_thuong_gay_ra);

  const p2InMatch = turn1.trang_thai_tran.nguoi_choi.find(p => p.ma_nguoi_dung === 'usr_bot_002');
  console.log('   - Bot remaining HP:', p2InMatch.mau_hien_tai);

  if (turn1.sat_thuong_gay_ra <= 0) {
    throw new Error('Damage dealt must be greater than 0 on correct answer!');
  }
  if (p2InMatch.mau_hien_tai >= 100) {
    throw new Error('Opponent HP must be reduced after taking damage!');
  }

  // 3. Submit Turn 1 for Bot (Wrong answer)
  const wrongChoice = (correctChoice + 1) % 4;
  const turnBot = await arenaService.submitTurnAnswer({
    ma_tran: match.ma_tran,
    ma_nguoi_dung: 'usr_bot_002',
    thu_tu_cau: 1,
    vi_tri_dap_an_chon: wrongChoice,
    thoi_gian_giay: 4.2
  });

  console.log('3. Bot answered Question 1:');
  console.log('   - Correct?', turnBot.la_dap_an_dung);
  console.log('   - Damage dealt:', turnBot.sat_thuong_gay_ra);

  // 4. Test Match Conclusion
  console.log('4. Concluding Match: Player 1 wins via K.O.');
  await arenaService.concludeMatch(match.ma_tran, 'usr_admin_001', 'KO_VICTORY');

  const concludedState = await arenaService.getMatchState(match.ma_tran);
  console.log('   - Final Match Status:', concludedState.trang_thai);
  console.log('   - Winner:', concludedState.nguoi_thang_cuoc);
  console.log('   - Reason:', concludedState.ly_do_ket_thuc);

  if (concludedState.trang_thai !== 'KET_THUC') {
    throw new Error('Match status should be KET_THUC after conclusion!');
  }

  console.log('🎉 1v1 ARENA COMBAT FLOW TEST PASSED 100%!');
}

testArenaCombatFlow()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Arena test failed:', err);
    process.exit(1);
  });
