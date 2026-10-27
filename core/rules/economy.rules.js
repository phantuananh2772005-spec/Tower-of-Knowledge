/**
 * PURE BUSINESS RULES: KINH TẾ (XU & DANH HIỆU DẪN XUẤT TỪ EXP)
 * Thuần hàm: nhận dữ liệu, tính toán, trả kết quả.
 * Đảm bảo danh hiệu không bị tụt khi tiêu xu.
 */

const levelRules = require('../../public/js/level-rules');
const RANK_THRESHOLDS = [...levelRules.thresholds].reverse();

/**
 * Suy ra Danh hiệu học vị dựa trên Tổng điểm kinh nghiệm tích lũy (EXP).
 * Thuộc tính dẫn xuất: Chỉ tăng theo thời gian, không phụ thuộc số dư Xu.
 * @param {number} totalExp - Tổng điểm kinh nghiệm tích lũy
 * @returns {string} Mã danh hiệu (TAN_THU, TAP_SU, THONG_THAI_1...)
 */
function deriveRankTitle(totalExp) {
  const exp = Math.max(0, Number(totalExp) || 0);
  for (const rank of RANK_THRESHOLDS) {
    if (exp >= rank.minExp) {
      return rank.title;
    }
  }
  return 'TAN_THU';
}

/**
 * Suy ra Cấp độ số nguyên (1 - 6) dựa trên Tổng điểm kinh nghiệm tích lũy (EXP).
 * @param {number} totalExp - Tổng điểm kinh nghiệm tích lũy
 * @returns {number} Cấp độ (1: Tân thủ, 2: Tập sự, 3: Thông thái I, 4: Thông thái II, 5: Thông thái III, 6: Đại sư)
 */
function deriveUserLevel(totalExp) {
  const exp = Math.max(0, Number(totalExp) || 0);
  for (const rank of RANK_THRESHOLDS) {
    if (exp >= rank.minExp) {
      return rank.level;
    }
  }
  return 1;
}

/**
 * Kiểm tra khả năng chi trả Xu.
 * @param {number} currentCoins - Số dư Xu hiện tại
 * @param {number} cost - Chi phí cần thanh toán
 * @returns {boolean} Đủ xu hay không
 */
function canAfford(currentCoins, cost) {
  return Number(currentCoins) >= Number(cost);
}

/**
 * Tính số dư mới sau khi cộng hoặc trừ Xu.
 * @param {number} currentCoins - Số dư hiện tại
 * @param {number} changeAmount - Số lượng thay đổi (dương là cộng, âm là trừ)
 * @returns {{ newCoins: number, isSuccess: boolean, errorMessage: string|null }}
 */
function applyCoinChange(currentCoins, changeAmount) {
  const current = Number(currentCoins) || 0;
  const change = Number(changeAmount) || 0;
  const newBalance = current + change;

  if (newBalance < 0) {
    return {
      newCoins: current,
      isSuccess: false,
      errorMessage: 'Số dư Xu Tri Thức không đủ để thực hiện giao dịch.'
    };
  }

  return {
    newCoins: newBalance,
    isSuccess: true,
    errorMessage: null
  };
}

module.exports = {
  levelProgress: levelRules.progress,
  RANK_THRESHOLDS,
  deriveRankTitle,
  deriveUserLevel,
  canAfford,
  applyCoinChange
};
