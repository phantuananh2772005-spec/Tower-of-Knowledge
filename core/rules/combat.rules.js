/**
 * PURE BUSINESS RULES: ĐẤU TRƯỜNG 1V1 THỜI GIAN THỰC
 * Thuần hàm: nhận dữ liệu, tính toán, trả kết quả.
 */

const BASE_DAMAGE = 12; // Mỗi câu đúng gây 12 sát thương tiêu chuẩn (HP tối đa = 100, trận đấu 10-15 câu)

/**
 * Tính toán lượng sát thương gây ra dựa trên tốc độ và tính đúng sai.
 * Hỗ trợ cả 2 dạng gọi: dạng đối tượng { isCorrect, responseTimeSeconds, petDamageMultiplier } hoặc tham số vị trí.
 */
function calculateDamage(isCorrectOrObj, timeElapsedSec, timeLimitSec = 10) {
  let isCorrect, timeElapsed, timeLimit = 10, petMult = 1.0, baseDmg = BASE_DAMAGE;
  if (typeof isCorrectOrObj === 'object' && isCorrectOrObj !== null) {
    isCorrect = Boolean(isCorrectOrObj.isCorrect);
    timeElapsed = isCorrectOrObj.responseTimeSeconds ?? isCorrectOrObj.timeElapsedSec ?? 5;
    timeLimit = isCorrectOrObj.timeLimitSeconds ?? isCorrectOrObj.timeLimitSec ?? 10;
    petMult = isCorrectOrObj.petDamageMultiplier || 1.0;
    baseDmg = isCorrectOrObj.baseDamage || BASE_DAMAGE;
  } else {
    isCorrect = Boolean(isCorrectOrObj);
    timeElapsed = Number(timeElapsedSec) || 5;
    timeLimit = Number(timeLimitSec) || 10;
  }

  if (!isCorrect) {
    const res = { damage: 0, isCritical: false, raw: 0 };
    res.valueOf = () => 0;
    res[Symbol.toPrimitive] = () => 0;
    return res;
  }

  // Trả lời càng nhanh (dưới 50% thời gian) thì nhận thêm sát thương chí mạng (+3)
  const isCritical = timeElapsed <= timeLimit * 0.5;
  const bonus = isCritical ? 3 : 0;
  const finalDamage = Math.round((baseDmg + bonus) * petMult);

  const res = { damage: finalDamage, isCritical, raw: finalDamage };
  res.valueOf = () => finalDamage;
  res[Symbol.toPrimitive] = () => finalDamage;
  return res;
}

/**
 * Tính máu còn lại sau khi chịu sát thương.
 * @param {number} currentHP - Máu hiện tại
 * @param {number} damage - Lượng sát thương nhận
 * @returns {number} Máu mới (tối thiểu = 0)
 */
function applyDamage(currentHP, damage) {
  return Math.max(0, (Number(currentHP) || 0) - (Number(damage) || 0));
}

/**
 * Đánh giá kết quả chung cuộc của trận đấu 1v1.
 * @param {object} params
 * @param {number} params.p1HP - Máu người chơi 1
 * @param {number} params.p2HP - Máu người chơi 2
 * @param {number} params.p1Score - Điểm người chơi 1
 * @param {number} params.p2Score - Điểm người chơi 2
 * @param {boolean} [params.p1Forfeited=false] - Người chơi 1 thoát trận
 * @param {boolean} [params.p2Forfeited=false] - Người chơi 2 thoát trận
 * @param {boolean} [params.hasAnyAnswer=true] - Có ai trả lời câu nào chưa
 * @param {number} [params.winCoins=50] - Xu thưởng thắng
 * @param {number} [params.tieCoins=10] - Xu tham gia khi hòa
 * @returns {{
 *   p1Result: 'THANG'|'THUA'|'HOA'|'CHUA_KET_THUC',
 *   p2Result: 'THANG'|'THUA'|'HOA'|'CHUA_KET_THUC',
 *   matchStatus: 'CHUAN_BI'|'DANG_THI_DAU'|'KET_THUC'|'HUY_TRAN',
 *   p1EarnedCoins: number,
 *   p2EarnedCoins: number,
 *   finishReason: string
 * }}
 */
function resolveMatchOutcome({
  p1HP,
  p2HP,
  p1Score,
  p2Score,
  p1Forfeited = false,
  p2Forfeited = false,
  hasAnyAnswer = true,
  winCoins = 50,
  tieCoins = 10
}) {
  // Trường hợp cả hai cùng thoát hoặc lỗi trước khi có lượt trả lời nào
  if (!hasAnyAnswer && (p1Forfeited || p2Forfeited)) {
    return {
      p1Result: 'HOA',
      p2Result: 'HOA',
      matchStatus: 'HUY_TRAN',
      p1EarnedCoins: 0,
      p2EarnedCoins: 0,
      finishReason: 'BOTH_ABANDONED_BEFORE_START'
    };
  }

  // Trường hợp Người chơi 1 thoát giữa trận -> Người 1 THUA, Người 2 THẮNG
  if (p1Forfeited) {
    return {
      p1Result: 'THUA',
      p2Result: 'THANG',
      matchStatus: 'KET_THUC',
      p1EarnedCoins: 0,
      p2EarnedCoins: winCoins,
      finishReason: 'P1_FORFEITED'
    };
  }

  // Trường hợp Người chơi 2 thoát giữa trận -> Người 2 THUA, Người 1 THẮNG
  if (p2Forfeited) {
    return {
      p1Result: 'THANG',
      p2Result: 'THUA',
      matchStatus: 'KET_THUC',
      p1EarnedCoins: winCoins,
      p2EarnedCoins: 0,
      finishReason: 'P2_FORFEITED'
    };
  }

  // Trường hợp K.O (hết máu)
  if (p1HP <= 0 && p2HP <= 0) {
    return {
      p1Result: 'HOA',
      p2Result: 'HOA',
      matchStatus: 'KET_THUC',
      p1EarnedCoins: tieCoins,
      p2EarnedCoins: tieCoins,
      finishReason: 'MUTUAL_KO_TIE'
    };
  }

  if (p1HP <= 0) {
    return {
      p1Result: 'THUA',
      p2Result: 'THANG',
      matchStatus: 'KET_THUC',
      p1EarnedCoins: 0,
      p2EarnedCoins: winCoins,
      finishReason: 'P1_KNOCKED_OUT'
    };
  }

  if (p2HP <= 0) {
    return {
      p1Result: 'THANG',
      p2Result: 'THUA',
      matchStatus: 'KET_THUC',
      p1EarnedCoins: winCoins,
      p2EarnedCoins: 0,
      finishReason: 'P2_KNOCKED_OUT'
    };
  }

  // Hết số câu hỏi: So sánh điểm số hoặc lượng máu còn lại
  if (p1HP > p2HP) {
    return {
      p1Result: 'THANG',
      p2Result: 'THUA',
      matchStatus: 'KET_THUC',
      p1EarnedCoins: winCoins,
      p2EarnedCoins: 0,
      finishReason: 'P1_MORE_HP'
    };
  } else if (p2HP > p1HP) {
    return {
      p1Result: 'THANG',
      p2Result: 'THUA',
      matchStatus: 'KET_THUC',
      p1EarnedCoins: 0,
      p2EarnedCoins: winCoins,
      finishReason: 'P2_MORE_HP'
    };
  } else {
    // Máu bằng nhau: so sánh điểm
    if (p1Score > p2Score) {
      return {
        p1Result: 'THANG',
        p2Result: 'THUA',
        matchStatus: 'KET_THUC',
        p1EarnedCoins: winCoins,
        p2EarnedCoins: 0,
        finishReason: 'P1_MORE_POINTS'
      };
    } else if (p2Score > p1Score) {
      return {
        p1Result: 'THUA',
        p2Result: 'THANG',
        matchStatus: 'KET_THUC',
        p1EarnedCoins: 0,
        p2EarnedCoins: winCoins,
        finishReason: 'P2_MORE_POINTS'
      };
    } else {
      // Hòa tuyệt đối
      return {
        p1Result: 'HOA',
        p2Result: 'HOA',
        matchStatus: 'KET_THUC',
        p1EarnedCoins: tieCoins,
        p2EarnedCoins: tieCoins,
        finishReason: 'EXACT_TIE'
      };
    }
  }
}

module.exports = {
  BASE_DAMAGE,
  calculateDamage,
  applyDamage,
  resolveMatchOutcome
};
