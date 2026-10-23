/**
 * Extreme Survival Challenge Service (Thi Đấu Cực Hạn)
 * Endless Roguelite Survival Quiz with 5 Lives, Combo Multipliers,
 * and Seamless Batch-Prefetching.
 */

const db = require('../database/db');
const { mutateCoins, addExperience } = require('./economy.service');
const { evaluateQuizSubmission } = require('../core/rules/progression.rules');

/**
 * Format raw question from DB into a safe client format (NEVER reveal answer position)
 * In Extreme Survival mode, all question formats are adapted into high-speed 4-option questions.
 */
function formatSafeQuestion(q) {
  let noiDung = q.noi_dung;
  let dapAn = null;
  let loaiCauHoi = q.loai_cau_hoi || 'TRAC_NGHIEM_4';

  if (q.loai_cau_hoi === 'TRAC_NGHIEM_4' || (!q.loai_cau_hoi && q.dap_an_a)) {
    dapAn = [q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d].filter(Boolean);
  } else if (q.loai_cau_hoi === 'DIEN_TU') {
    try {
      const parsed = typeof q.du_lieu_cau_hoi === 'string' ? JSON.parse(q.du_lieu_cau_hoi) : q.du_lieu_cau_hoi;
      if (parsed && parsed.sentence_template && parsed.options) {
        noiDung = parsed.sentence_template.replace('{blank}', '______');
        dapAn = parsed.options;
      }
    } catch (e) {}
  } else if (q.loai_cau_hoi === 'NOI_CAP') {
    try {
      const parsed = typeof q.du_lieu_cau_hoi === 'string' ? JSON.parse(q.du_lieu_cau_hoi) : q.du_lieu_cau_hoi;
      if (parsed && parsed.pairs && parsed.pairs.length >= 2) {
        const targetPair = parsed.pairs[0];
        noiDung = `Khái niệm / Định nghĩa nào tương ứng chính xác với "${targetPair.left}"?`;
        dapAn = parsed.pairs.map(p => p.right);
      } else if (parsed && Array.isArray(parsed.left_items) && Array.isArray(parsed.right_items) && parsed.matches) {
        const targetLeft = parsed.left_items[0];
        noiDung = `Khái niệm / Định nghĩa nào tương ứng chính xác với "${targetLeft.text}"?`;
        dapAn = parsed.right_items.map(r => r.text);
      }
    } catch (e) {}
  } else if (q.loai_cau_hoi === 'SAP_XEP_CAU') {
    try {
      const parsed = typeof q.du_lieu_cau_hoi === 'string' ? JSON.parse(q.du_lieu_cau_hoi) : q.du_lieu_cau_hoi;
      if (parsed && parsed.correct_order && parsed.correct_order.length > 0) {
        noiDung = `${q.noi_dung} (Đâu là trình tự cú pháp chuẩn?)`;
        const correctStr = parsed.correct_order.join(' → ');
        const revStr = [...parsed.correct_order].reverse().join(' → ');
        const shuf1 = [...parsed.correct_order].sort().join(' → ');
        const shuf2 = [parsed.correct_order[1], parsed.correct_order[0], ...parsed.correct_order.slice(2)].join(' → ');
        dapAn = [correctStr, revStr, shuf1, shuf2];
      }
    } catch (e) {}
  }

  if (!dapAn || dapAn.length < 2) {
    dapAn = [q.dap_an_a || 'Đúng', q.dap_an_b || 'Sai', q.dap_an_c || 'Khác', q.dap_an_d || 'Không xác định'];
  }

  return {
    ma_cau_hoi: q.ma_cau_hoi,
    noi_dung: noiDung,
    loai_cau_hoi: loaiCauHoi,
    muc_bloom: q.muc_bloom || 'NHO',
    do_kho: q.do_kho || 1,
    dap_an: dapAn,
    giai_thich: q.giai_thich || ''
  };
}

/**
 * Start an Extreme Survival Session
 * Fetches course info and ALL questions for the course at once.
 * The client stores all questions in RAM, shuffles them, and serves them instantly
 * without needing chunked DB requests during gameplay.
 */
async function startSession(ma_mon = 'mon_csdl', ma_nguoi_dung = null) {
  // Resolve ma_mon from slug if needed
  let course = await db.queryOne('SELECT ma_mon, ten_mon FROM mon_hoc WHERE ma_mon = $1 OR slug = $1', [ma_mon]);
  if (!course) {
    course = await db.queryOne('SELECT TOP 1 ma_mon, ten_mon FROM mon_hoc ORDER BY thu_tu ASC');
  }
  const resolvedMon = course ? course.ma_mon : 'mon_csdl';

  // Fetch ALL questions for this course at once
  const rawQuestions = await db.query(`
    SELECT q.ma_cau_hoi, q.noi_dung, q.loai_cau_hoi, q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d,
           q.du_lieu_cau_hoi, q.muc_bloom, q.do_kho, q.vi_tri_dap_an_dung, q.giai_thich
    FROM cau_hoi q
    JOIN moc_bai_hoc m ON q.ma_moc = m.ma_moc
    JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
    WHERE c.ma_mon = $1
    ORDER BY NEWID()
  `, [resolvedMon]);

  const formattedQuestions = (rawQuestions || []).map(formatSafeQuestion);

  return {
    ma_mon: resolvedMon,
    ten_mon: course ? course.ten_mon : 'Cơ sở Dữ liệu',
    tong_so_cau_trong_kho: formattedQuestions.length,
    max_sinh_mang: 5,
    thoi_gian_moi_cau: 25,
    danh_sach_cau_hoi: formattedQuestions,
    questions: formattedQuestions
  };
}

/**
 * Fetch the next batch of questions (kept as backward-compatible fallback)
 */
async function getNextBatch(ma_mon = 'mon_csdl', excludeIds = []) {
  let course = await db.queryOne('SELECT ma_mon FROM mon_hoc WHERE ma_mon = $1 OR slug = $1', [ma_mon]);
  const resolvedMon = course ? course.ma_mon : 'mon_csdl';

  let rawQuestions = [];
  const safeExclude = Array.isArray(excludeIds) ? excludeIds.filter(id => typeof id === 'string' && id.trim().length > 0) : [];

  if (safeExclude.length > 0) {
    const safeInClause = safeExclude.map(id => `'${id.replace(/'/g, "''")}'`).join(',');
    rawQuestions = await db.query(`
      SELECT q.ma_cau_hoi, q.noi_dung, q.loai_cau_hoi, q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d,
             q.du_lieu_cau_hoi, q.muc_bloom, q.do_kho, q.vi_tri_dap_an_dung, q.giai_thich
      FROM cau_hoi q
      JOIN moc_bai_hoc m ON q.ma_moc = m.ma_moc
      JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
      WHERE c.ma_mon = $1 AND q.ma_cau_hoi NOT IN (${safeInClause})
      ORDER BY NEWID()
    `, [resolvedMon]);
  } else {
    rawQuestions = await db.query(`
      SELECT q.ma_cau_hoi, q.noi_dung, q.loai_cau_hoi, q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d,
             q.du_lieu_cau_hoi, q.muc_bloom, q.do_kho, q.vi_tri_dap_an_dung, q.giai_thich
      FROM cau_hoi q
      JOIN moc_bai_hoc m ON q.ma_moc = m.ma_moc
      JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
      WHERE c.ma_mon = $1
      ORDER BY NEWID()
    `, [resolvedMon]);
  }

  const formattedQuestions = (rawQuestions || []).map(formatSafeQuestion);

  return {
    ma_mon: resolvedMon,
    so_luong: formattedQuestions.length,
    da_het_kho: formattedQuestions.length === 0,
    danh_sach_cau_hoi: formattedQuestions,
    questions: formattedQuestions
  };
}

/**
 * Check an answer in real-time
 */
async function checkAnswer(ma_cau_hoi, tra_loi) {
  if (!ma_cau_hoi) throw new Error('Mã câu hỏi không được để trống.');

  const q = await db.queryOne('SELECT * FROM cau_hoi WHERE ma_cau_hoi = $1', [ma_cau_hoi]);
  if (!q) throw new Error('Không tìm thấy câu hỏi trong ngân hàng đề.');

  let isCorrect = false;
  let viTriDapAnDung = 0;
  let dapAnDungText = '';

  const choiceIdx = typeof tra_loi === 'number' ? tra_loi : parseInt(tra_loi, 10);

  if (q.loai_cau_hoi === 'TRAC_NGHIEM_4' || (!q.loai_cau_hoi && q.dap_an_a)) {
    viTriDapAnDung = Number(q.vi_tri_dap_an_dung ?? 0);
    isCorrect = (choiceIdx === viTriDapAnDung);
    const answers = [q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d];
    dapAnDungText = answers[viTriDapAnDung] || '';
  } else if (q.loai_cau_hoi === 'DIEN_TU') {
    try {
      const parsed = typeof q.du_lieu_cau_hoi === 'string' ? JSON.parse(q.du_lieu_cau_hoi) : q.du_lieu_cau_hoi;
      const opts = parsed.options || [];
      const expected = String(parsed.blank_answer || '').trim().toLowerCase();
      viTriDapAnDung = opts.findIndex(o => String(o).trim().toLowerCase() === expected);
      if (viTriDapAnDung < 0) viTriDapAnDung = 0;
      dapAnDungText = parsed.blank_answer;

      if (choiceIdx >= 0 && choiceIdx < opts.length) {
        isCorrect = (String(opts[choiceIdx]).trim().toLowerCase() === expected);
      } else if (typeof tra_loi === 'string') {
        isCorrect = (String(tra_loi).trim().toLowerCase() === expected);
      }
    } catch (e) {
      isCorrect = false;
    }
  } else if (q.loai_cau_hoi === 'NOI_CAP') {
    try {
      const parsed = typeof q.du_lieu_cau_hoi === 'string' ? JSON.parse(q.du_lieu_cau_hoi) : q.du_lieu_cau_hoi;
      if (parsed.pairs && parsed.pairs[0]) {
        viTriDapAnDung = 0; // Cặp đầu tiên được ghép chính xác với right[0]
        dapAnDungText = parsed.pairs[0].right;
        isCorrect = (choiceIdx === 0 || tra_loi === dapAnDungText);
      } else if (parsed.left_items && parsed.right_items && parsed.matches) {
        const targetLeftId = parsed.left_items[0].id;
        const targetRightId = parsed.matches[targetLeftId];
        const rightItem = parsed.right_items.find(r => r.id === targetRightId) || parsed.right_items[0];
        const correctIndex = parsed.right_items.findIndex(r => r.id === targetRightId);
        viTriDapAnDung = correctIndex >= 0 ? correctIndex : 0;
        dapAnDungText = rightItem.text;
        isCorrect = (choiceIdx === viTriDapAnDung || tra_loi === dapAnDungText);
      }
    } catch (e) {
      isCorrect = false;
    }
  } else if (q.loai_cau_hoi === 'SAP_XEP_CAU') {
    try {
      const parsed = typeof q.du_lieu_cau_hoi === 'string' ? JSON.parse(q.du_lieu_cau_hoi) : q.du_lieu_cau_hoi;
      viTriDapAnDung = 0; // Trình tự cú pháp chuẩn ở vị trí 0
      dapAnDungText = parsed.correct_order.join(' → ');
      isCorrect = (choiceIdx === 0);
    } catch (e) {
      isCorrect = false;
    }
  }

  return {
    ma_cau_hoi,
    is_correct: isCorrect,
    la_dung: isCorrect,
    vi_tri_dap_an_dung: viTriDapAnDung,
    correct_answer: dapAnDungText,
    dap_an_dung: viTriDapAnDung,
    dap_an_dung_text: dapAnDungText,
    giai_thich: q.giai_thich || 'Khái niệm trọng tâm giúp khắc sâu kiến thức.'
  };
}

/**
 * Conclude an Extreme Survival Match
 * Computes rewards (Coins & EXP), records history, and returns performance summary
 */
async function finishSession(ma_nguoi_dung, sessionData = {}) {
  const {
    ma_mon = 'mon_csdl',
    tong_so_cau_lam = sessionData.total_answered || sessionData.tong_so_cau_lam || 0,
    tong_so_cau_dung = sessionData.correct_count || sessionData.tong_so_cau_dung || 0,
    chuoi_dung_cao_nhat = sessionData.max_streak || sessionData.chuoi_dung_cao_nhat || 0,
    tong_diem = sessionData.total_score || sessionData.tong_diem || 0,
    thoi_gian_giay = sessionData.duration_seconds || sessionData.thoi_gian_giay || 0,
    vong_lap = sessionData.loops_completed || sessionData.vong_lap || 1
  } = sessionData;

  // Reward Calculations: Proportional to survival endurance
  const earnedCoins = Math.min(250, Math.floor(tong_diem / 40) + tong_so_cau_dung * 2 + chuoi_dung_cao_nhat * 3);
  const earnedExp = Math.min(600, tong_so_cau_dung * 6 + chuoi_dung_cao_nhat * 10 + (vong_lap - 1) * 60);

  if (ma_nguoi_dung) {
    if (earnedCoins > 0) {
      await mutateCoins(ma_nguoi_dung, earnedCoins, 'THI_DAU_CUC_HAN', `Thưởng Sinh Tồn Cực Hạn (${tong_so_cau_dung} câu đúng)`);
    }
    if (earnedExp > 0) {
      await addExperience(ma_nguoi_dung, earnedExp);
    }

    // Persist session telemetry
    const sampleMoc = await db.queryOne(`
      SELECT TOP 1 m.ma_moc 
      FROM moc_bai_hoc m 
      JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong 
      WHERE c.ma_mon = $1 
      ORDER BY m.thu_tu ASC
    `, [ma_mon]);

    const ma_phien = `sess_cuchan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const accPct = tong_so_cau_lam > 0 ? Math.round((tong_so_cau_dung / tong_so_cau_lam) * 100) : 0;
    const avgSec = tong_so_cau_lam > 0 ? Number((thoi_gian_giay / tong_so_cau_lam).toFixed(1)) : 0;

    const questionLog = Array.isArray(sessionData.danh_sach_cau_hoi) && sessionData.danh_sach_cau_hoi.length > 0
      ? sessionData.danh_sach_cau_hoi 
      : (Array.isArray(sessionData.questions) && sessionData.questions.length > 0 ? sessionData.questions : null);

    const detailPayload = questionLog || sessionData;

    try {
      await db.execute(`
        INSERT INTO lich_su_phien_hoc (
          ma_phien, ma_nguoi_dung, ma_moc, loai_phien, buoc_so,
          thoi_gian_tong_giay, ti_le_dung, toc_do_trung_binh_giay, tong_so_lan_tra_cuu, chi_tiet_cau_hoi
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        ma_phien,
        ma_nguoi_dung,
        sampleMoc ? sampleMoc.ma_moc : 'moc_csdl_01_01',
        'THI_DAU_CUC_HAN',
        vong_lap,
        thoi_gian_giay,
        accPct,
        avgSec,
        0,
        JSON.stringify(detailPayload)
      ]);
    } catch (errLog) {
      console.warn('⚠️ Extreme session log notice:', errLog.message);
    }
  }

  // Determine achievement badge
  let badgeTitle = 'Tập Sự Cực Hạn';
  if (tong_so_cau_dung >= 50) badgeTitle = 'Huyền Thoại Bất Tử';
  else if (tong_so_cau_dung >= 30) badgeTitle = 'Bậc Thầy Bền Bỉ';
  else if (tong_so_cau_dung >= 15) badgeTitle = 'Dũng Giả Bất Khuất';
  else if (tong_so_cau_dung >= 5) badgeTitle = 'Chiến Binh Sinh Tồn';

  return {
    success: true,
    badgeTitle,
    earnedCoins,
    earnedExp,
    rewards: {
      coins: earnedCoins,
      exp: earnedExp
    },
    summary: {
      tong_so_cau_lam,
      total_answered: tong_so_cau_lam,
      tong_so_cau_dung,
      correct_count: tong_so_cau_dung,
      chuoi_dung_cao_nhat,
      max_streak: chuoi_dung_cao_nhat,
      tong_diem,
      total_score: tong_diem,
      thoi_gian_giay,
      vong_lap,
      loops_completed: vong_lap,
      badge: badgeTitle
    }
  };
}

module.exports = {
  startSession,
  getNextBatch,
  checkAnswer,
  finishSession
};
