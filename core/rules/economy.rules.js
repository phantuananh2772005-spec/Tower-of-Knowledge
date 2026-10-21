/**
 * PURE BUSINESS RULES: KINH TẾ (XU & DANH HIỆU DẪN XUẤT TỪ EXP)
 * Thuần hàm: nhận dữ liệu, tính toán, trả kết quả.
 * Đảm bảo danh hiệu không bị tụt khi tiêu xu.
 */

const RANK_THRESHOLDS = [
  { minExp: 7000, title: 'DAI_SU' },
  { minExp: 3500, title: 'THONG_THAI_3' },
  { minExp: 1500, title: 'THONG_THAI_2' },
  { minExp: 500,  title: 'THONG_THAI_1' },
  { minExp: 100,  title: 'TAP_SU' },
  { minExp: 0,    title: 'TAN_THU' }
];

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
  RANK_THRESHOLDS,
  deriveRankTitle,
  canAfford,
  applyCoinChange
};
