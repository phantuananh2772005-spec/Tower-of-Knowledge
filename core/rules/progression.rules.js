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
    const val = a.lua_chon !== undefined ? a.lua_chon : a.chi_muc_chon;
    answerMap.set(String(a.ma_cau_hoi), Number(val));
  }

  const totalQuestions = officialQuestions.length;
  let correctCount = 0;
  const details = [];

  for (const q of officialQuestions) {
    const userChoice = answerMap.has(String(q.ma_cau_hoi)) ? answerMap.get(String(q.ma_cau_hoi)) : -1;
    const isCorrect = userChoice === Number(q.vi_tri_dap_an_dung);

    if (isCorrect) {
      correctCount++;
    }

    details.push({
      ma_cau_hoi: q.ma_cau_hoi,
      la_dung: isCorrect,
      lua_chon: userChoice,
      dap_an_dung: Number(q.vi_tri_dap_an_dung),
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
  const sorted = [...orderedCheckpoints].sort((a, b) => a.thu_tu - b.thu_tu);
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
