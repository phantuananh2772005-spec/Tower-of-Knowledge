/**
 * Arena 1v1 Battle Service
 * Manages match lifecycle, turns, damage calculation, and victory resolution.
 */

const db = require('../database/db');
const { calculateDamage, applyDamage, resolveMatchOutcome } = require('../core/rules/combat.rules');
const { mutateCoins, addExperience } = require('./economy.service');

/**
 * Create a new 1v1 match between 2 players
 */
async function createMatch(player1Id, player2Id, ma_mon = 'mon_csdl') {
  const ma_tran = `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Create match
  await db.execute(`
    INSERT INTO tran_dau_1v1 (ma_tran, ma_mon, trang_thai, thoi_gian_bat_dau)
    VALUES ($1, $2, 'DANG_THI_DAU', SYSDATETIME())
  `, [ma_tran, ma_mon]);

  // Player 1 pet
  const pet1 = await db.queryOne(`
    SELECT tc.ma_thu_cung, tc.he_so_sat_thuong 
    FROM thu_cung_so_huu sh JOIN thu_cung tc ON sh.ma_thu_cung = tc.ma_thu_cung 
    WHERE sh.ma_nguoi_dung = $1 AND sh.dang_kich_hoat = 1
  `, [player1Id]);

  // Player 2 pet
  const pet2 = await db.queryOne(`
    SELECT tc.ma_thu_cung, tc.he_so_sat_thuong 
    FROM thu_cung_so_huu sh JOIN thu_cung tc ON sh.ma_thu_cung = tc.ma_thu_cung 
    WHERE sh.ma_nguoi_dung = $1 AND sh.dang_kich_hoat = 1
  `, [player2Id]);

  const p1IdInMatch = `pm_${ma_tran}_1`;
  const p2IdInMatch = `pm_${ma_tran}_2`;

  await db.execute(`
    INSERT INTO nguoi_choi_trong_tran (ma_nguoi_choi_trong_tran, ma_tran, ma_nguoi_dung, ma_thu_cung, mau_hien_tai, mau_toi_da, ket_qua)
    VALUES ($1, $2, $3, $4, 100, 100, 'CHUA_KET_THUC')
  `, [p1IdInMatch, ma_tran, player1Id, pet1 ? pet1.ma_thu_cung : null]);

  await db.execute(`
    INSERT INTO nguoi_choi_trong_tran (ma_nguoi_choi_trong_tran, ma_tran, ma_nguoi_dung, ma_thu_cung, mau_hien_tai, mau_toi_da, ket_qua)
    VALUES ($1, $2, $3, $4, 100, 100, 'CHUA_KET_THUC')
  `, [p2IdInMatch, ma_tran, player2Id, pet2 ? pet2.ma_thu_cung : null]);

  // Pick 5 questions from course
  const questions = await db.query(`
    SELECT TOP 5 q.ma_cau_hoi
    FROM cau_hoi q
    JOIN moc_bai_hoc m ON q.ma_moc = m.ma_moc
    JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
    WHERE c.ma_mon = $1
    ORDER BY NEWID()
  `, [ma_mon]);

  // If NEWID() returns fewer or not supported, pick all questions and shuffle
  let selectedQuestions = questions;
  if (!selectedQuestions || selectedQuestions.length < 5) {
    const all = await db.query('SELECT ma_cau_hoi FROM cau_hoi');
    selectedQuestions = all.slice(0, 5);
  }

  for (let i = 0; i < selectedQuestions.length; i++) {
    const ma_cau_trong_tran = `qm_${ma_tran}_${i + 1}`;
    await db.execute(`
      INSERT INTO cau_hoi_trong_tran (ma_cau_trong_tran, ma_tran, ma_cau_hoi, thu_tu_cau)
      VALUES ($1, $2, $3, $4)
    `, [ma_cau_trong_tran, ma_tran, selectedQuestions[i].ma_cau_hoi, i + 1]);
  }

  return await getMatchState(ma_tran);
}

/**
 * Get full state of a match
 */
async function getMatchState(ma_tran) {
  const match = await db.queryOne('SELECT * FROM tran_dau_1v1 WHERE ma_tran = $1', [ma_tran]);
  if (!match) throw new Error('Không tìm thấy trận đấu.');

  const players = await db.query(`
    SELECT p.ma_nguoi_choi_trong_tran, p.ma_nguoi_dung, u.ten_dang_nhap, u.ten_hien_thi, u.khung_avatar,
           p.mau_hien_tai, p.mau_toi_da, p.tong_sat_thuong_gay_ra, p.ket_qua,
           tc.ma_thu_cung, tc.ten_thu_cung, tc.he_so_sat_thuong
    FROM nguoi_choi_trong_tran p
    JOIN nguoi_dung u ON p.ma_nguoi_dung = u.ma_nguoi_dung
    LEFT JOIN thu_cung tc ON p.ma_thu_cung = tc.ma_thu_cung
    WHERE p.ma_tran = $1
  `, [ma_tran]);

  const questionsInMatch = await db.query(`
    SELECT qm.ma_cau_trong_tran, qm.thu_tu_cau, q.ma_cau_hoi, q.noi_dung,
           q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d
    FROM cau_hoi_trong_tran qm
    JOIN cau_hoi q ON qm.ma_cau_hoi = q.ma_cau_hoi
    WHERE qm.ma_tran = $1
    ORDER BY qm.thu_tu_cau ASC
  `, [ma_tran]);

  // Fetch turns taken
  const turns = await db.query(`
    SELECT l.ma_cau_trong_tran, l.ma_nguoi_choi_trong_tran, l.vi_tri_dap_an_chon,
           l.la_dap_an_dung, l.thoi_gian_tra_loi_giay, l.sat_thuong_gay_ra
    FROM luot_tra_loi l
    JOIN cau_hoi_trong_tran qm ON l.ma_cau_trong_tran = qm.ma_cau_trong_tran
    WHERE qm.ma_tran = $1
  `, [ma_tran]);

  return {
    ma_tran: match.ma_tran,
    trang_thai: match.trang_thai,
    thoi_gian_bat_dau: match.thoi_gian_bat_dau,
    thoi_gian_ket_thuc: match.thoi_gian_ket_thuc,
    nguoi_thang_cuoc: match.nguoi_thang_cuoc,
    ly_do_ket_thuc: match.ly_do_ket_thuc,
    nguoi_choi: players.map(p => ({
      ma_nguoi_choi_trong_tran: p.ma_nguoi_choi_trong_tran,
      ma_nguoi_dung: p.ma_nguoi_dung,
      ten_dang_nhap: p.ten_dang_nhap,
      ten_hien_thi: p.ten_hien_thi,
      khung_avatar: p.khung_avatar,
      mau_hien_tai: p.mau_hien_tai,
      mau_toi_da: p.mau_toi_da,
      tong_sat_thuong_gay_ra: p.tong_sat_thuong_gay_ra,
      ket_qua: p.ket_qua,
      thu_cung: p.ma_thu_cung ? {
        ma_thu_cung: p.ma_thu_cung,
        ten_thu_cung: p.ten_thu_cung,
        he_so_sat_thuong: p.he_so_sat_thuong
      } : null
    })),
    cau_hoi: questionsInMatch.map(q => ({
      ma_cau_trong_tran: q.ma_cau_trong_tran,
      thu_tu_cau: q.thu_tu_cau,
      noi_dung: q.noi_dung,
      dap_an: [q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d]
    })),
    luot_da_tra_loi: turns
  };
}

/**
 * Player submits an answer for a specific question in the match
 */
async function submitTurnAnswer({ ma_tran, ma_nguoi_dung, thu_tu_cau, vi_tri_dap_an_chon, thoi_gian_giay = 5 }) {
  const match = await db.queryOne('SELECT * FROM tran_dau_1v1 WHERE ma_tran = $1', [ma_tran]);
  if (!match || match.trang_thai !== 'DANG_THI_DAU') {
    throw new Error('Trận đấu không tồn tại hoặc đã kết thúc.');
  }

  // Get player in match
  const player = await db.queryOne(`
    SELECT p.*, tc.he_so_sat_thuong
    FROM nguoi_choi_trong_tran p
    LEFT JOIN thu_cung tc ON p.ma_thu_cung = tc.ma_thu_cung
    WHERE p.ma_tran = $1 AND p.ma_nguoi_dung = $2
  `, [ma_tran, ma_nguoi_dung]);
  if (!player) throw new Error('Người chơi không thuộc trận đấu này.');

  // Get opponent
  const opponent = await db.queryOne(
    'SELECT * FROM nguoi_choi_trong_tran WHERE ma_tran = $1 AND ma_nguoi_dung != $2',
    [ma_tran, ma_nguoi_dung]
  );

  // Get question in match with correct answer
  const questionInMatch = await db.queryOne(`
    SELECT qm.ma_cau_trong_tran, q.vi_tri_dap_an_dung, q.giai_thich
    FROM cau_hoi_trong_tran qm
    JOIN cau_hoi q ON qm.ma_cau_hoi = q.ma_cau_hoi
    WHERE qm.ma_tran = $1 AND qm.thu_tu_cau = $2
  `, [ma_tran, thu_tu_cau]);
  if (!questionInMatch) throw new Error('Không tìm thấy câu hỏi này trong trận.');

  // Check if already answered
  const alreadyAnswered = await db.queryOne(
    'SELECT ma_luot_tra_loi FROM luot_tra_loi WHERE ma_cau_trong_tran = $1 AND ma_nguoi_choi_trong_tran = $2',
    [questionInMatch.ma_cau_trong_tran, player.ma_nguoi_choi_trong_tran]
  );
  if (alreadyAnswered) {
    throw new Error('Bạn đã trả lời câu hỏi này rồi.');
  }

  // Calculate damage
  const isCorrect = vi_tri_dap_an_dung === questionInMatch.vi_tri_dap_an_dung;
  const petMultiplier = player.he_so_sat_thuong || 1.0;
  const { damage, isCritical } = calculateDamage({
    isCorrect,
    responseTimeSeconds: thoi_gian_giay,
    baseDamage: 25,
    petDamageMultiplier: petMultiplier
  });

  // Record turn
  const ma_luot_tra_loi = `turn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.execute(`
    INSERT INTO luot_tra_loi (
      ma_luot_tra_loi, ma_cau_trong_tran, ma_nguoi_choi_trong_tran,
      vi_tri_dap_an_chon, la_dap_an_dung, thoi_gian_tra_loi_giay, sat_thuong_gay_ra
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [
    ma_luot_tra_loi,
    questionInMatch.ma_cau_trong_tran,
    player.ma_nguoi_choi_trong_tran,
    vi_tri_dap_an_chon,
    isCorrect ? 1 : 0,
    thoi_gian_giay,
    damage
  ]);

  // Apply damage to opponent
  let newOpponentHp = opponent.mau_hien_tai;
  if (damage > 0) {
    const damageResult = applyDamage(opponent.mau_hien_tai, damage);
    newOpponentHp = damageResult.remainingHp;
    await db.execute(
      'UPDATE nguoi_choi_trong_tran SET mau_hien_tai = $1 WHERE ma_nguoi_choi_trong_tran = $2',
      [newOpponentHp, opponent.ma_nguoi_choi_trong_tran]
    );
    await db.execute(
      'UPDATE nguoi_choi_trong_tran SET tong_sat_thuong_gay_ra = tong_sat_thuong_gay_ra + $1 WHERE ma_nguoi_choi_trong_tran = $2',
      [damage, player.ma_nguoi_choi_trong_tran]
    );
  }

  // Check match conclusion (either K.O. or last question completed by both)
  let matchEnded = false;
  if (newOpponentHp <= 0) {
    // K.O. VICTORY!
    matchEnded = true;
    await concludeMatch(ma_tran, player.ma_nguoi_dung, 'KO_VICTORY');
  } else {
    // Check if this was question 5 and all players have answered
    const totalTurns = await db.query(`
      SELECT count(*) as cnt
      FROM luot_tra_loi l
      JOIN cau_hoi_trong_tran qm ON l.ma_cau_trong_tran = qm.ma_cau_trong_tran
      WHERE qm.ma_tran = $1
    `, [ma_tran]);

    const count = totalTurns && totalTurns[0] ? totalTurns[0].cnt : 0;
    if (count >= 10) { // 5 questions * 2 players
      matchEnded = true;
      // Resolve by final scores
      await concludeMatchByScore(ma_tran);
    }
  }

  const updatedState = await getMatchState(ma_tran);

  return {
    la_dap_an_dung: isCorrect,
    sat_thuong_gay_ra: damage,
    la_chi_mang: isCritical,
    vi_tri_dap_an_dung: questionInMatch.vi_tri_dap_an_dung,
    giai_thich: questionInMatch.giai_thich,
    tran_ket_thuc: matchEnded,
    trang_thai_tran: updatedState
  };
}

/**
 * Conclude match by specific winner
 */
async function concludeMatch(ma_tran, winnerUserId, reason = 'KO_VICTORY') {
  await db.execute(`
    UPDATE tran_dau_1v1 
    SET trang_thai = 'KET_THUC', thoi_gian_ket_thuc = SYSDATETIME(), nguoi_thang_cuoc = $1, ly_do_ket_thuc = $2
    WHERE ma_tran = $3
  `, [winnerUserId, reason, ma_tran]);

  const players = await db.query('SELECT * FROM nguoi_choi_trong_tran WHERE ma_tran = $1', [ma_tran]);

  for (const p of players) {
    const isWinner = p.ma_nguoi_dung === winnerUserId;
    const ket_qua = isWinner ? 'THANG' : 'THUA';
    const xuThuong = isWinner ? 35 : 10;
    const expThuong = isWinner ? 50 : 15;

    await db.execute(`
      UPDATE nguoi_choi_trong_tran
      SET ket_qua = $1, xu_nhan_duoc = $2, exp_nhan_duoc = $3
      WHERE ma_nguoi_choi_trong_tran = $4
    `, [ket_qua, xuThuong, expThuong, p.ma_nguoi_choi_trong_tran]);

    // Distribute rewards
    const rewardType = isWinner ? 'THUONG_TRAN_DAU' : 'THUONG_THAM_GIA';
    const note = isWinner ? 'Chiến thắng Đấu trường Tri thức 1v1' : 'Tham gia Đấu trường Tri thức 1v1';
    await mutateCoins(p.ma_nguoi_dung, xuThuong, rewardType, note);
    await addExperience(p.ma_nguoi_dung, expThuong);
  }
}

/**
 * Conclude match by total score / HP comparison
 */
async function concludeMatchByScore(ma_tran) {
  const players = await db.query('SELECT * FROM nguoi_choi_trong_tran WHERE ma_tran = $1', [ma_tran]);
  if (players.length < 2) return;

  const p1 = players[0];
  const p2 = players[1];

  let winnerId = null;
  let reason = 'TIMEOUT_SCORE';

  if (p1.mau_hien_tai > p2.mau_hien_tai) {
    winnerId = p1.ma_nguoi_dung;
  } else if (p2.mau_hien_tai > p1.mau_hien_tai) {
    winnerId = p2.ma_nguoi_dung;
  } else {
    // Tie
    reason = 'DRAW';
  }

  await db.execute(`
    UPDATE tran_dau_1v1 
    SET trang_thai = 'KET_THUC', thoi_gian_ket_thuc = SYSDATETIME(), nguoi_thang_cuoc = $1, ly_do_ket_thuc = $2
    WHERE ma_tran = $3
  `, [winnerId, reason, ma_tran]);

  for (const p of players) {
    let ket_qua = 'HOA';
    let xuThuong = 15;
    let expThuong = 20;

    if (winnerId) {
      const isWinner = p.ma_nguoi_dung === winnerId;
      ket_qua = isWinner ? 'THANG' : 'THUA';
      xuThuong = isWinner ? 35 : 10;
      expThuong = isWinner ? 50 : 15;
    }

    await db.execute(`
      UPDATE nguoi_choi_trong_tran
      SET ket_qua = $1, xu_nhan_duoc = $2, exp_nhan_duoc = $3
      WHERE ma_nguoi_choi_trong_tran = $4
    `, [ket_qua, xuThuong, expThuong, p.ma_nguoi_choi_trong_tran]);

    await mutateCoins(p.ma_nguoi_dung, xuThuong, 'THUONG_TRAN_DAU', `Kết thúc trận đấu 1v1 (${ket_qua})`);
    await addExperience(p.ma_nguoi_dung, expThuong);
  }
}

module.exports = {
  createMatch,
  getMatchState,
  submitTurnAnswer,
  concludeMatch
};
