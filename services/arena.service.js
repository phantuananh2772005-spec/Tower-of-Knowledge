/**
 * Arena 1v1 Battle Service
 * Manages match lifecycle, turns, damage calculation, and victory resolution.
 */

const db = require('../database/db');
const { calculateDamage, applyDamage, resolveMatchOutcome } = require('../core/rules/combat.rules');
const { mutateCoinsInTransaction, addExperienceInTransaction } = require('./economy.service');
const arenaRules=require('../public/js/arena-rules');
const { syncArenaSeason } = require('./arena-season.service');

/**
 * Create a new 1v1 match between 2 players
 */
async function createMatch(player1Id, player2Id, ma_mon = 'mon_csdl', mode = 'PRACTICE') {
  if (!player1Id || !player2Id || player1Id === player2Id) throw new Error('Trận đấu cần hai người chơi khác nhau.');

  if(!['RANKED','CASUAL','PRACTICE'].includes(mode))throw new Error('Chế độ đấu không hợp lệ.');
  if(mode==='RANKED'&&[player1Id,player2Id].some(id=>id.startsWith('usr_bot_')))throw new Error('Đấu hạng chỉ dành cho hai người chơi thật.');
  const ma_tran = `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.transaction(async tx => {
  const players = await tx.query('SELECT ma_nguoi_dung FROM nguoi_dung WHERE ma_nguoi_dung IN ($1, $2)', [player1Id, player2Id]);
  if (players.length !== 2) throw new Error('Người chơi không tồn tại. Hãy đăng nhập lại hoặc chọn đối thủ hợp lệ.');
  // Create match
  await tx.execute(`
    INSERT INTO tran_dau_1v1 (ma_tran, ma_mon, trang_thai, thoi_gian_bat_dau, che_do)
    VALUES ($1, $2, 'DANG_THI_DAU', SYSDATETIME(), $3)
  `, [ma_tran, ma_mon, mode]);

  // Player 1 pet
  const pet1 = await tx.queryOne(`
    SELECT tc.ma_thu_cung, tc.he_so_sat_thuong 
    FROM thu_cung_so_huu sh JOIN thu_cung tc ON sh.ma_thu_cung = tc.ma_thu_cung 
    WHERE sh.ma_nguoi_dung = $1 AND sh.dang_kich_hoat = $2
  `, [player1Id, true]);

  // Player 2 pet
  const pet2 = await tx.queryOne(`
    SELECT tc.ma_thu_cung, tc.he_so_sat_thuong 
    FROM thu_cung_so_huu sh JOIN thu_cung tc ON sh.ma_thu_cung = tc.ma_thu_cung 
    WHERE sh.ma_nguoi_dung = $1 AND sh.dang_kich_hoat = $2
  `, [player2Id, true]);

  const p1IdInMatch = `pm_${ma_tran}_1`;
  const p2IdInMatch = `pm_${ma_tran}_2`;

  await tx.execute(`
    INSERT INTO nguoi_choi_trong_tran (ma_nguoi_choi_trong_tran, ma_tran, ma_nguoi_dung, ma_thu_cung, mau_hien_tai, mau_toi_da, ket_qua)
    VALUES ($1, $2, $3, $4, 100, 100, 'CHUA_KET_THUC')
  `, [p1IdInMatch, ma_tran, player1Id, pet1 ? pet1.ma_thu_cung : null]);

  await tx.execute(`
    INSERT INTO nguoi_choi_trong_tran (ma_nguoi_choi_trong_tran, ma_tran, ma_nguoi_dung, ma_thu_cung, mau_hien_tai, mau_toi_da, ket_qua)
    VALUES ($1, $2, $3, $4, 100, 100, 'CHUA_KET_THUC')
  `, [p2IdInMatch, ma_tran, player2Id, pet2 ? pet2.ma_thu_cung : null]);

  // Pick 10 questions randomly across ALL question types and difficulties from course
  const questions = await tx.query(`
    SELECT TOP 10 q.ma_cau_hoi
    FROM cau_hoi q
    JOIN moc_bai_hoc m ON q.ma_moc = m.ma_moc
    JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
    WHERE c.ma_mon = $1
    ORDER BY NEWID()
  `, [ma_mon]);

  // If NEWID() returns fewer or not supported, pick all questions and shuffle
  let selectedQuestions = questions;
  if (!selectedQuestions || selectedQuestions.length < 10) {
    const all = await tx.query(`
      SELECT q.ma_cau_hoi 
      FROM cau_hoi q
      JOIN moc_bai_hoc m ON q.ma_moc = m.ma_moc
      JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
      WHERE c.ma_mon = $1
    `, [ma_mon]);
    const shuffled = (all || []).sort(() => Math.random() - 0.5);
    selectedQuestions = shuffled.slice(0, 10);
  }

  if (!selectedQuestions.length) throw new Error('Môn học chưa có câu hỏi để thi đấu.');
  for (let i = 0; i < selectedQuestions.length; i++) {
    const ma_cau_trong_tran = `qm_${ma_tran}_${i + 1}`;
    await tx.execute(`
      INSERT INTO cau_hoi_trong_tran (ma_cau_trong_tran, ma_tran, ma_cau_hoi, thu_tu_cau)
      VALUES ($1, $2, $3, $4)
    `, [ma_cau_trong_tran, ma_tran, selectedQuestions[i].ma_cau_hoi, i + 1]);
  }

  });
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
           p.mau_hien_tai, p.mau_toi_da, p.tong_sat_thuong_gay_ra, p.ket_qua, p.xu_nhan_duoc, p.exp_nhan_duoc, p.diem_hang_thay_doi,
           tc.ma_thu_cung, tc.ten_thu_cung, tc.he_so_sat_thuong, r.diem AS diem_hang
    FROM nguoi_choi_trong_tran p
    JOIN nguoi_dung u ON p.ma_nguoi_dung = u.ma_nguoi_dung
    LEFT JOIN thu_cung tc ON p.ma_thu_cung = tc.ma_thu_cung
    LEFT JOIN diem_dau_hang r ON r.ma_nguoi_dung=p.ma_nguoi_dung AND r.ma_mon=$2
    WHERE p.ma_tran = $1
  `, [ma_tran, match.ma_mon]);

  const questionsInMatch = await db.query(`
    SELECT qm.ma_cau_trong_tran, qm.thu_tu_cau, q.ma_cau_hoi, q.noi_dung, q.loai_cau_hoi,
           q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d, q.vi_tri_dap_an_dung,
           q.du_lieu_cau_hoi, q.muc_bloom, q.do_kho, q.giai_thich
    FROM cau_hoi_trong_tran qm
    JOIN cau_hoi q ON qm.ma_cau_hoi = q.ma_cau_hoi
    WHERE qm.ma_tran = $1
    ORDER BY qm.thu_tu_cau ASC
  `, [ma_tran]);

  // Fetch turns taken
  const turns = await db.query(`
    SELECT l.ma_cau_trong_tran, l.ma_nguoi_choi_trong_tran,
           l.la_dap_an_dung, l.thoi_gian_tra_loi_giay, l.sat_thuong_gay_ra
    FROM luot_tra_loi l
    JOIN cau_hoi_trong_tran qm ON l.ma_cau_trong_tran = qm.ma_cau_trong_tran
    WHERE qm.ma_tran = $1
  `, [ma_tran]);

  return {
    ma_tran: match.ma_tran,
    che_do:match.che_do,
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
      diem_hang: Number(p.diem_hang || 0),
      xu_nhan_duoc:p.xu_nhan_duoc,exp_nhan_duoc:p.exp_nhan_duoc,diem_hang_thay_doi:p.diem_hang_thay_doi,
      thu_cung: p.ma_thu_cung ? {
        ma_thu_cung: p.ma_thu_cung,
        ten_thu_cung: p.ten_thu_cung,
        he_so_sat_thuong: p.he_so_sat_thuong
      } : null
    })),
    cau_hoi: questionsInMatch.map(q => {
      let parsedData = null;
      if (q.du_lieu_cau_hoi) {
        try {
          parsedData = typeof q.du_lieu_cau_hoi === 'string' ? JSON.parse(q.du_lieu_cau_hoi) : q.du_lieu_cau_hoi;
        } catch (e) {}
      }

      const type = q.loai_cau_hoi || 'TRAC_NGHIEM_4';
      let options = [];
      let data = null;
      if (type === 'TRAC_NGHIEM_4') {
        options = [q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d].filter(Boolean);
      } else if (type === 'DIEN_TU') {
        options = [...(parsedData?.cac_tu_lua_chon || parsedData?.options || [])].sort();
        data = { prompt: parsedData?.prompt };
      } else if (type === 'NOI_CAP') {
        const pairs = parsedData?.pairs || parsedData?.cap_dung || [];
        data = {
          left: pairs.map(pair => pair.left).sort(),
          right: pairs.map(pair => pair.right).sort()
        };
      } else if (type === 'SAP_XEP_CAU') {
        options = [...(parsedData?.correct_order || parsedData?.cac_tu_dung || []),
          ...(parsedData?.distractors || [])].sort();
        data = { prompt: parsedData?.prompt };
      }

      return {
        ma_cau_trong_tran: q.ma_cau_trong_tran,
        ma_cau_hoi: q.ma_cau_hoi,
        thu_tu_cau: q.thu_tu_cau,
        noi_dung: q.noi_dung,
        loai_cau_hoi: type,
        muc_bloom: q.muc_bloom || 'NHO',
        do_kho: q.do_kho || 1,
        dap_an: options,
        du_lieu_cau_hoi: data
      };
    }),
    luot_da_tra_loi: turns
  };
}

/**
 * Player submits an answer for a specific question in the match
 */
async function submitTurnAnswer({ ma_tran, ma_nguoi_dung, thu_tu_cau, vi_tri_dap_an_chon, cau_tra_loi = null, thoi_gian_giay = 5 }) {
  const { player, isCorrect, damage, isCritical, newOpponentHp, replayed } = await db.transaction(async tx => {
    const match = await tx.queryOne('SELECT * FROM tran_dau_1v1 WHERE ma_tran = $1' + (db.isPostgres ? ' FOR UPDATE' : ''), [ma_tran]);
    if (!match) {
      throw new Error('Trận đấu không tồn tại hoặc đã kết thúc.');
    }

    // Get player in match
    const player = await tx.queryOne(`
      SELECT p.*, tc.he_so_sat_thuong
      FROM nguoi_choi_trong_tran p
      LEFT JOIN thu_cung tc ON p.ma_thu_cung = tc.ma_thu_cung
      WHERE p.ma_tran = $1 AND p.ma_nguoi_dung = $2
    `, [ma_tran, ma_nguoi_dung]);
    if (!player) throw new Error('Người chơi không thuộc trận đấu này.');

    if (!Number.isInteger(thu_tu_cau) || thu_tu_cau < 1) {
      throw new Error('Thứ tự câu hỏi không hợp lệ.');
    }

    // Get question in match with correct answer
    const questionInMatch = await tx.queryOne(`
      SELECT qm.ma_cau_trong_tran, q.loai_cau_hoi, q.vi_tri_dap_an_dung, q.du_lieu_cau_hoi
      FROM cau_hoi_trong_tran qm
      JOIN cau_hoi q ON qm.ma_cau_hoi = q.ma_cau_hoi
      WHERE qm.ma_tran = $1 AND qm.thu_tu_cau = $2
    `, [ma_tran, thu_tu_cau]);
    if (!questionInMatch) throw new Error('Không tìm thấy câu hỏi này trong trận.');

    // Check if already answered
    const alreadyAnswered = await tx.queryOne(
      'SELECT la_dap_an_dung, sat_thuong_gay_ra FROM luot_tra_loi WHERE ma_cau_trong_tran = $1 AND ma_nguoi_choi_trong_tran = $2',
      [questionInMatch.ma_cau_trong_tran, player.ma_nguoi_choi_trong_tran]
    );
    if (alreadyAnswered) {
      return { player, isCorrect: Boolean(alreadyAnswered.la_dap_an_dung), damage: alreadyAnswered.sat_thuong_gay_ra, isCritical: false, replayed: true };
    }

    // Get opponent
    const opponent = await tx.queryOne(
      'SELECT * FROM nguoi_choi_trong_tran WHERE ma_tran = $1 AND ma_nguoi_dung != $2',
      [ma_tran, ma_nguoi_dung]
    );

    if (match.trang_thai !== 'DANG_THI_DAU' || !opponent || opponent.mau_hien_tai <= 0 || player.mau_hien_tai <= 0) {
      throw new Error('Trận đấu đã kết thúc.');
    }
    const previousTurns = await tx.queryOne(`
      SELECT COUNT(*) AS total, MAX(l.thoi_diem_tra_loi) AS latest
      FROM luot_tra_loi l
      JOIN cau_hoi_trong_tran qm ON l.ma_cau_trong_tran = qm.ma_cau_trong_tran
      WHERE qm.ma_tran = $1 AND qm.thu_tu_cau < $2
    `, [ma_tran, thu_tu_cau]);
    if (Number(previousTurns.total) !== (thu_tu_cau - 1) * 2) {
      throw new Error('Câu hỏi này chưa tới lượt.');
    }
    const referenceTime = new Date(previousTurns.latest || match.thoi_gian_bat_dau).getTime();
    const elapsed = (Date.now() - referenceTime) / 1000;
    // The client starts after the match intro or the previous round animation.
    const intro = thu_tu_cau === 1 ? 2.2 : 1.4;
    thoi_gian_giay = Number.isFinite(elapsed) ? Math.max(0, elapsed - intro) : 5;

    // Parse structured data if available
    let parsed = null;
    try {
      parsed = typeof questionInMatch.du_lieu_cau_hoi === 'string'
        ? JSON.parse(questionInMatch.du_lieu_cau_hoi)
        : questionInMatch.du_lieu_cau_hoi;
    } catch (e) {}

    const type = questionInMatch.loai_cau_hoi || 'TRAC_NGHIEM_4';
    let isCorrect = false;

    // LOGIC-005 Fix: Server-authoritative answer validation against official database content
    // Client flags (isCorrect / da_hoan_thanh) are strictly ignored
    if (type === 'NOI_CAP') {
      const expectedPairs = parsed?.pairs || parsed?.cap_dung || [];
      const userPairs = cau_tra_loi?.matched_pairs || cau_tra_loi?.cap_ghep || (Array.isArray(cau_tra_loi) ? cau_tra_loi : []);
      if (expectedPairs.length > 0 && Array.isArray(userPairs) && userPairs.length === expectedPairs.length) {
        isCorrect = expectedPairs.every(ep =>
          userPairs.some(up =>
            up &&
            String(up.left ?? '').trim().toLowerCase() === String(ep.left ?? '').trim().toLowerCase() &&
            String(up.right ?? '').trim().toLowerCase() === String(ep.right ?? '').trim().toLowerCase()
          )
        );
      }
    } else if (type === 'DIEN_TU') {
      const correctWord = String(parsed?.tu_dung || parsed?.blank_answer || '').trim().toLowerCase();
      const chosenWord = String(
        typeof cau_tra_loi === 'string'
          ? cau_tra_loi
          : (cau_tra_loi?.tu_chon || cau_tra_loi?.selected_word || cau_tra_loi?.lua_chon || '')
      ).trim().toLowerCase();
      const optionsList = parsed?.cac_tu_lua_chon || parsed?.options || [];
      if (chosenWord && correctWord) {
        isCorrect = (chosenWord === correctWord);
      } else if (typeof vi_tri_dap_an_chon === 'number' && optionsList[vi_tri_dap_an_chon] !== undefined && !cau_tra_loi) {
        isCorrect = (String(optionsList[vi_tri_dap_an_chon]).trim().toLowerCase() === correctWord);
      }
    } else if (type === 'SAP_XEP_CAU') {
      const cleanCorrect = String(
        parsed?.cau_hoan_chinh || (parsed?.correct_order || parsed?.cac_tu_dung || []).join(' ')
      ).trim().toLowerCase().replace(/\s+/g, ' ');
      const userWords = Array.isArray(cau_tra_loi?.ordered_words) ? cau_tra_loi.ordered_words.join(' ') : '';
      const userSentence = String(
        typeof cau_tra_loi === 'string'
          ? cau_tra_loi
          : (cau_tra_loi?.cau_ghep || userWords || '')
      ).trim().toLowerCase().replace(/\s+/g, ' ');
      if (userSentence && cleanCorrect && userSentence === cleanCorrect) {
        isCorrect = true;
      }
    } else {
      // TRAC_NGHIEM_4
      const chosenIdx = vi_tri_dap_an_chon !== undefined && vi_tri_dap_an_chon !== null
        ? parseInt(vi_tri_dap_an_chon, 10)
        : parseInt(cau_tra_loi?.vi_tri_chon, 10);
      const officialIdx = parseInt(questionInMatch.vi_tri_dap_an_dung, 10);
      isCorrect = !isNaN(chosenIdx) && !isNaN(officialIdx) && chosenIdx === officialIdx;
    }

    // Calculate damage
    const petMultiplier = player.he_so_sat_thuong || 1.0;
    const { damage, isCritical } = calculateDamage({
      isCorrect,
      responseTimeSeconds: thoi_gian_giay,
      baseDamage: 12,
      petDamageMultiplier: petMultiplier
    });

    // Record turn
    const ma_luot_tra_loi = `turn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await tx.execute(`
      INSERT INTO luot_tra_loi (
        ma_luot_tra_loi, ma_cau_trong_tran, ma_nguoi_choi_trong_tran,
        vi_tri_dap_an_chon, la_dap_an_dung, thoi_gian_tra_loi_giay, sat_thuong_gay_ra
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      ma_luot_tra_loi,
      questionInMatch.ma_cau_trong_tran,
      player.ma_nguoi_choi_trong_tran,
      typeof vi_tri_dap_an_chon === 'number' ? vi_tri_dap_an_chon : (isCorrect ? 1 : 0),
      isCorrect ? 1 : 0,
      thoi_gian_giay,
      damage
    ]);

    // Apply damage to opponent
    let newOpponentHp = opponent.mau_hien_tai;
    if (damage > 0) {
      newOpponentHp = applyDamage(opponent.mau_hien_tai, damage);
      await tx.execute(
        'UPDATE nguoi_choi_trong_tran SET mau_hien_tai = $1 WHERE ma_nguoi_choi_trong_tran = $2',
        [newOpponentHp, opponent.ma_nguoi_choi_trong_tran]
      );
      await tx.execute(
        'UPDATE nguoi_choi_trong_tran SET tong_sat_thuong_gay_ra = tong_sat_thuong_gay_ra + $1 WHERE ma_nguoi_choi_trong_tran = $2',
        [damage, player.ma_nguoi_choi_trong_tran]
      );
    }

    return { player, isCorrect, damage, isCritical, newOpponentHp };
  });

  if (replayed) {
    const state = await getMatchState(ma_tran);
    return {
      la_dap_an_dung: isCorrect, sat_thuong_gay_ra: damage, la_chi_mang: isCritical,
      tran_ket_thuc: state.trang_thai === 'KET_THUC', trang_thai_tran: state, replayed: true
    };
  }

  // Check match conclusion (either K.O. or last question completed by both)
  let matchEnded = false;
  if (newOpponentHp <= 0) {
    // K.O. VICTORY!
    matchEnded = true;
    await concludeMatch(ma_tran, player.ma_nguoi_dung, 'KO_VICTORY');
  } else {
    // Check if all questions in match have been answered by both players
    const totalTurns = await db.query(`
      SELECT count(*) as cnt
      FROM luot_tra_loi l
      JOIN cau_hoi_trong_tran qm ON l.ma_cau_trong_tran = qm.ma_cau_trong_tran
      WHERE qm.ma_tran = $1
    `, [ma_tran]);

    const count = totalTurns && totalTurns[0] ? totalTurns[0].cnt : 0;
    const qCountRows = await db.query('SELECT count(*) as qcnt FROM cau_hoi_trong_tran WHERE ma_tran = $1', [ma_tran]);
    const qCount = qCountRows && qCountRows[0] ? qCountRows[0].qcnt : 10;
    if (count >= qCount * 2) {
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
    tran_ket_thuc: matchEnded,
    trang_thai_tran: updatedState
  };
}

/**
 * Conclude match by specific winner
 */
async function concludeMatch(matchId, winnerUserId, reason = 'KO_VICTORY') {
  return db.transaction(async tx => {
    const lock = db.isPostgres ? ' FOR UPDATE' : '';
    const match = await tx.queryOne('SELECT * FROM tran_dau_1v1 WHERE ma_tran=$1' + lock, [matchId]);
    if (!match || match.trang_thai === 'KET_THUC') return;

    const players = await tx.query(
      'SELECT * FROM nguoi_choi_trong_tran WHERE ma_tran=$1 ORDER BY ma_nguoi_dung', [matchId]
    );
    if (players.length !== 2 || (winnerUserId && !players.some(p => p.ma_nguoi_dung === winnerUserId))) {
      throw new Error('Kết quả trận đấu không hợp lệ.');
    }

    if (match.che_do === 'RANKED') await syncArenaSeason(tx);

    // Stable lock order keeps simultaneous settlements for the same users consistent.
    for (const player of players) {
      await tx.queryOne('SELECT ma_nguoi_dung FROM nguoi_dung WHERE ma_nguoi_dung=$1' + lock, [player.ma_nguoi_dung]);
    }

    const playerIds = players.map(p => p.ma_nguoi_choi_trong_tran);
    const turns = await tx.query(
      'SELECT ma_nguoi_choi_trong_tran FROM luot_tra_loi WHERE ma_nguoi_choi_trong_tran IN ($1,$2)', playerIds
    );
    const answered = new Set(turns.map(t => t.ma_nguoi_choi_trong_tran));
    const participated = playerIds.every(id => answered.has(id));
    const ranked = match.che_do === 'RANKED' && Boolean(match.ma_mon)
      && players.every(p => !p.ma_nguoi_dung.startsWith('usr_bot_'));

    if (reason === 'DAU_HANG' && winnerUserId) {
      await tx.execute(
        'UPDATE nguoi_choi_trong_tran SET mau_hien_tai=0 WHERE ma_tran=$1 AND ma_nguoi_dung<>$2',
        [matchId, winnerUserId]
      );
    }

    await tx.execute(
      `UPDATE tran_dau_1v1 SET trang_thai='KET_THUC', thoi_gian_ket_thuc=SYSDATETIME(),
       nguoi_thang_cuoc=$1, ly_do_ket_thuc=$2 WHERE ma_tran=$3`,
      [winnerUserId || null, reason, matchId]
    );
    for (const player of players) {
      const userId = player.ma_nguoi_dung;
      const result = !winnerUserId ? 'HOA' : userId === winnerUserId ? 'THANG' : 'THUA';
      const earnsReward = participated && !userId.startsWith('usr_bot_');
      const reward = earnsReward ? arenaRules.rewards(ranked ? 'RANKED' : 'CASUAL', result) : { coins: 0, exp: 0 };
      let delta = 0;
      if (ranked && earnsReward) {
        const key = [userId, match.ma_mon];
        const previous = await tx.queryOne('SELECT diem FROM diem_dau_hang WHERE ma_nguoi_dung=$1 AND ma_mon=$2', key);
        const before = Number(previous?.diem || 0);
        const after = Math.max(0, before + arenaRules.delta(result, Number(player.mau_hien_tai)));
        delta = after - before;
        if (previous) {
          await tx.execute('UPDATE diem_dau_hang SET diem=$1 WHERE ma_nguoi_dung=$2 AND ma_mon=$3', [after, ...key]);
        } else {
          await tx.execute('INSERT INTO diem_dau_hang(ma_nguoi_dung,ma_mon,diem) VALUES($1,$2,$3)', [...key, after]);
        }
      }
      if (reward.exp) reward.exp = (await addExperienceInTransaction(tx, userId, reward.exp, { repeat: true })).expAwarded;
      await tx.execute(
        `UPDATE nguoi_choi_trong_tran SET ket_qua=$1, xu_nhan_duoc=$2, exp_nhan_duoc=$3,
         diem_hang_thay_doi=$4 WHERE ma_nguoi_choi_trong_tran=$5`,
        [result, reward.coins, reward.exp, delta, player.ma_nguoi_choi_trong_tran]
      );
      if (reward.coins) {
        await mutateCoinsInTransaction(tx, userId, reward.coins, 'THUONG_TRAN_DAU', `${match.che_do}: ${result} [${matchId}]`);
      }

    }
  });
}

/**
 * Conclude match by total score / HP comparison
 */
async function concludeMatchByScore(ma_tran) {
  const players = await db.query('SELECT * FROM nguoi_choi_trong_tran WHERE ma_tran = $1', [ma_tran]);
  if (players.length < 2) return;

  const p1 = players[0];
  const p2 = players[1];

  // Fetch correct answer counts per player from luot_tra_loi
  const turns = await db.query(`
    SELECT l.ma_nguoi_choi_trong_tran, l.la_dap_an_dung
    FROM luot_tra_loi l
    JOIN cau_hoi_trong_tran qm ON l.ma_cau_trong_tran = qm.ma_cau_trong_tran
    WHERE qm.ma_tran = $1
  `, [ma_tran]);

  const p1Score = (turns || []).filter(t => t.ma_nguoi_choi_trong_tran === p1.ma_nguoi_choi_trong_tran && Boolean(t.la_dap_an_dung)).length;
  const p2Score = (turns || []).filter(t => t.ma_nguoi_choi_trong_tran === p2.ma_nguoi_choi_trong_tran && Boolean(t.la_dap_an_dung)).length;

  const outcome = resolveMatchOutcome({
    p1HP: Number(p1.mau_hien_tai) || 0,
    p2HP: Number(p2.mau_hien_tai) || 0,
    p1Score,
    p2Score,
    p1Damage: Number(p1.tong_sat_thuong_gay_ra) || 0,
    p2Damage: Number(p2.tong_sat_thuong_gay_ra) || 0,
    hasAnyAnswer: (turns && turns.length > 0)
  });

  let winnerId = null;
  let reason = 'TIMEOUT_SCORE';

  if (outcome.p1Result === 'THANG') {
    winnerId = p1.ma_nguoi_dung;
  } else if (outcome.p2Result === 'THANG') {
    winnerId = p2.ma_nguoi_dung;
  } else {
    reason = 'DRAW';
  }

  await concludeMatch(ma_tran,winnerId,reason);
}

/**
 * Surrender match voluntarily
 */
async function surrenderMatch(ma_tran, surrenderingUserId) {
  const participant=await db.queryOne('SELECT ma_nguoi_dung FROM nguoi_choi_trong_tran WHERE ma_tran=$1 AND ma_nguoi_dung=$2',[ma_tran,surrenderingUserId]);
  if(!participant)throw new Error('Bạn không thuộc trận đấu này.');
  const match = await db.queryOne('SELECT trang_thai FROM tran_dau_1v1 WHERE ma_tran = $1', [ma_tran]);
  if (!match || match.trang_thai === 'KET_THUC') return await getMatchState(ma_tran);

  // Find opponent
  const opponent = await db.queryOne(`
    SELECT ma_nguoi_dung FROM nguoi_choi_trong_tran
    WHERE ma_tran = $1 AND ma_nguoi_dung != $2
  `, [ma_tran, surrenderingUserId]);

  const winnerId = opponent ? opponent.ma_nguoi_dung : null;
  await concludeMatch(ma_tran, winnerId, 'DAU_HANG');
  return await getMatchState(ma_tran);
}

async function concludeIfResolved(matchId,userId){
 const state=await getMatchState(matchId);
 if(!state.nguoi_choi.some(p=>p.ma_nguoi_dung===userId))throw new Error('Bạn không thuộc trận đấu này.');
 if(state.trang_thai==='KET_THUC')return state;
 const alive=state.nguoi_choi.filter(p=>Number(p.mau_hien_tai)>0);
 if(alive.length<2)await concludeMatch(matchId,alive[0]?.ma_nguoi_dung||null,'KO_VICTORY');
 else{
  const counts=await db.queryOne('SELECT COUNT(*) AS n FROM luot_tra_loi l JOIN nguoi_choi_trong_tran p ON p.ma_nguoi_choi_trong_tran=l.ma_nguoi_choi_trong_tran WHERE p.ma_tran=$1',[matchId]);
  if(Number(counts.n)>=state.cau_hoi.length*2)await concludeMatchByScore(matchId);
 }
 return getMatchState(matchId);
}
module.exports = {
  createMatch,
  concludeIfResolved,
  getMatchState,
  submitTurnAnswer,
  concludeMatch,
  surrenderMatch
};
