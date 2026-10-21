/**
 * PURE BUSINESS RULES: LỘ TRÌNH LEO THÁP & ĐÁNH GIÁ TRẮC NGHIỆM
 * Thuần hàm: nhận dữ liệu, tính toán, trả kết quả.
 */

/**
 * Đánh giá kết quả làm bài trắc nghiệm của người học.
 * @param {Array<{ ma_cau_hoi: string, lua_chon: number }>} submittedAnswers - Danh sách câu trả lời người học gửi
 * @param {Array<{ ma_cau_hoi: string, vi_tri_dap_an_dung: number, giai_thich: string }>} officialQuestions - Ngân hàng câu hỏi từ DB
 * @param {number} passScore - Điểm đạt yêu cầu
 * @param {number} rewardCoins - Số xu thưởng khi hoàn thành
 * @param {number} rewardExp - Số exp thưởng khi hoàn thành
 * @returns {{
 *   totalQuestions: number,
 *   correctCount: number,
 *   scorePercentage: number,
 *   isPassed: boolean,
 *   earnedCoins: number,
 *   earnedExp: number,
 *   details: Array<{ ma_cau_hoi: string, la_dung: boolean, lua_chon: number, dap_an_dung: number, giai_thich: string }>
 * }}
 */
function evaluateQuizSubmission(submittedAnswers, officialQuestions, passScore = 70, rewardCoins = 20, rewardExp = 50) {
  const answerMap = new Map();
  for (const a of (submittedAnswers || [])) {
    if (a && a.ma_cau_hoi) {
      answerMap.set(String(a.ma_cau_hoi), a);
    }
  }

  const totalQuestions = officialQuestions.length;
  let correctCount = 0;
  const details = [];

  for (const q of officialQuestions) {
    const userSubmission = answerMap.get(String(q.ma_cau_hoi));
    let isCorrect = false;
    let userDisplayChoice = null;
    const loai = q.loai_cau_hoi || 'TRAC_NGHIEM_4';

    if (!userSubmission) {
      isCorrect = false;
    } else if (loai === 'NOI_CAP') {
      let parsed = {};
      try {
        parsed = typeof q.du_lieu_cau_hoi === 'string' ? JSON.parse(q.du_lieu_cau_hoi) : (q.du_lieu_cau_hoi || {});
      } catch (e) { parsed = {}; }
      const expectedPairs = parsed.pairs || [];
      const userPairs = userSubmission.matched_pairs || userSubmission.cap_ghep || [];
      if (expectedPairs.length > 0 && userPairs.length === expectedPairs.length) {
        isCorrect = expectedPairs.every(ep =>
          userPairs.some(up => String(up.left).trim() === String(ep.left).trim() && String(up.right).trim() === String(ep.right).trim())
        );
      }
      userDisplayChoice = `${userPairs.length}/${expectedPairs.length} cặp`;
    } else if (loai === 'DIEN_TU') {
      let parsed = {};
      try {
        parsed = typeof q.du_lieu_cau_hoi === 'string' ? JSON.parse(q.du_lieu_cau_hoi) : (q.du_lieu_cau_hoi || {});
      } catch (e) { parsed = {}; }
      const expected = String(parsed.blank_answer || '').trim().toLowerCase();
      const actual = String(userSubmission.selected_word || userSubmission.tu_dien || userSubmission.lua_chon || '').trim().toLowerCase();
      isCorrect = Boolean(expected && actual === expected);
      userDisplayChoice = actual;
    } else if (loai === 'SAP_XEP_CAU') {
      let parsed = {};
      try {
        parsed = typeof q.du_lieu_cau_hoi === 'string' ? JSON.parse(q.du_lieu_cau_hoi) : (q.du_lieu_cau_hoi || {});
      } catch (e) { parsed = {}; }
      const expectedOrder = parsed.correct_order || [];
      const userOrder = userSubmission.ordered_words || userSubmission.thu_tu_tu || [];
      if (expectedOrder.length > 0 && userOrder.length === expectedOrder.length) {
        isCorrect = expectedOrder.every((word, idx) => String(word).trim() === String(userOrder[idx]).trim());
      }
      userDisplayChoice = userOrder.join(' ');
    } else {
      // Default: TRAC_NGHIEM_4
      const val = userSubmission.lua_chon !== undefined ? userSubmission.lua_chon : userSubmission.chi_muc_chon;
      const userChoice = val !== undefined ? Number(val) : -1;
      isCorrect = userChoice === Number(q.vi_tri_dap_an_dung);
      userDisplayChoice = userChoice;
    }

    if (isCorrect) {
      correctCount++;
    }

    details.push({
      ma_cau_hoi: q.ma_cau_hoi,
      loai_cau_hoi: loai,
      la_dung: isCorrect,
      lua_chon: userDisplayChoice,
      dap_an_dung: q.vi_tri_dap_an_dung !== undefined && q.vi_tri_dap_an_dung !== null ? Number(q.vi_tri_dap_an_dung) : null,
      giai_thich: q.giai_thich || ''
    });
  }

  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPassed = scorePercentage >= passScore;
  const earnedCoins = isPassed ? rewardCoins : 0;
  const earnedExp = isPassed ? rewardExp : Math.round(rewardExp * 0.2);

  return {
    totalQuestions,
    correctCount,
    scorePercentage,
    isPassed,
    earnedCoins,
    earnedExp,
    awardedCoins: earnedCoins,
    awardedExp: earnedExp,
    tong_cau: totalQuestions,
    so_cau_dung: correctCount,
    diem_so: scorePercentage,
    dat_yeu_cau: isPassed,
    xu_nhan_duoc: earnedCoins,
    exp_nhan_duoc: earnedExp,
    details
  };
}

/**
 * Tính phần trăm hoàn thành môn học.
 * @param {number} totalNodes - Tổng số mốc của môn
 * @param {number} completedNodes - Số mốc đã hoàn thành
 * @returns {number} Phần trăm hoàn thành (0 - 100)
 */
function calculateCompletionPercentage(totalNodes, completedNodes) {
  if (!totalNodes || totalNodes <= 0) return 0;
  const pct = (Number(completedNodes) / Number(totalNodes)) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
}

/**
 * Tìm mốc kế tiếp theo thứ tự tuần tự để mở khóa (Lazy Creation).
 * @param {Array<{ ma_moc: string, thu_tu: number }>} orderedCheckpoints - Toàn bộ mốc theo thứ tự
 * @param {string} currentCheckpointId - Mã mốc vừa hoàn thành
 * @returns {{ nextCheckpoint: object|null, isCourseFinished: boolean }}
 */
function findNextCheckpointToUnlock(orderedCheckpoints, currentCheckpointId) {
  const sorted = [...orderedCheckpoints].sort((a, b) => {
    const chA = a.chuong_thu_tu !== undefined ? Number(a.chuong_thu_tu) : 0;
    const chB = b.chuong_thu_tu !== undefined ? Number(b.chuong_thu_tu) : 0;
    if (chA !== chB) return chA - chB;
    return Number(a.thu_tu) - Number(b.thu_tu);
  });
  const currentIndex = sorted.findIndex(c => String(c.ma_moc) === String(currentCheckpointId));

  if (currentIndex === -1 || currentIndex === sorted.length - 1) {
    return {
      nextCheckpoint: null,
      isCourseFinished: true
    };
  }

  return {
    nextCheckpoint: sorted[currentIndex + 1],
    isCourseFinished: false
  };
}

module.exports = {
  evaluateQuizSubmission,
  calculateCompletionPercentage,
  findNextCheckpointToUnlock
};
