/**
 * PURE BUSINESS RULES: TÍNH TOÁN CHUỖI HỌC TẬP (STREAK)
 * Thiết kế thuần hàm (Pure function): Không đọc Date.now(), không gọi DB.
 * Đầu vào là dữ liệu cụ thể -> Đầu ra là kết quả tính toán.
 * Dễ dàng chuyển dịch 1-1 sang C# (C# static class StreakRules).
 */

/**
 * Chuyển đổi đối tượng Date thành chuỗi 'YYYY-MM-DD' theo múi giờ Việt Nam (UTC+7).
 * @param {Date} date - Đối tượng Date (hoặc timestamp)
 * @returns {string} Chuỗi ngày định dạng 'YYYY-MM-DD'
 */
function toVietnamDateString(date) {
  const d = new Date(date);
  // Thêm 7 tiếng để chuyển từ UTC sang UTC+7
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const vnTime = new Date(utc + (3600000 * 7));
  const year = vnTime.getFullYear();
  const month = String(vnTime.getMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Tính số ngày chênh lệch giữa 2 chuỗi ngày 'YYYY-MM-DD'.
 * @param {string} dateStr1 - Ngày trước
 * @param {string} dateStr2 - Ngày sau
 * @returns {number} Số ngày chênh lệch
 */
function getDayDifference(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + 'T00:00:00Z');
  const d2 = new Date(dateStr2 + 'T00:00:00Z');
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Tính toán trạng thái chuỗi Streak mới khi có hoạt động học tập / đấu trường.
 * @param {string|null} lastActiveDate - Chuỗi ngày hoạt động cuối 'YYYY-MM-DD' (hoặc null nếu chưa từng học)
 * @param {string} todayDate - Chuỗi ngày hôm nay theo giờ VN 'YYYY-MM-DD'
 * @param {number} currentStreak - Chuỗi streak hiện tại
 * @returns {{ newStreak: number, hasChanged: boolean, reason: string }}
 */
function evaluateStreak(lastActiveDate, todayDate, currentStreak) {
  // Lần đầu tiên học tập
  if (!lastActiveDate) {
    return {
      newStreak: 1,
      hasChanged: true,
      reason: 'FIRST_ACTIVITY'
    };
  }

  // Đã có hoạt động hôm nay rồi: Bỏ qua, không cộng 2 lần trong ngày
  if (lastActiveDate === todayDate) {
    return {
      newStreak: currentStreak,
      hasChanged: false,
      reason: 'ALREADY_ACTIVE_TODAY'
    };
  }

  const diffDays = getDayDifference(lastActiveDate, todayDate);

  if (diffDays === 1) {
    // Học ngày liền kề: Tăng chuỗi +1
    return {
      newStreak: currentStreak + 1,
      hasChanged: true,
      reason: 'CONSECUTIVE_DAY_STREAK_INCREASE'
    };
  } else if (diffDays > 1) {
    // Bị gián đoạn quá 1 ngày: Reset về 1 (hoạt động của ngày hôm nay bắt đầu chuỗi mới)
    return {
      newStreak: 1,
      hasChanged: true,
      reason: 'STREAK_BROKEN_RESET_TO_ONE'
    };
  } else {
    // Trường hợp ngày không hợp lệ (hệ thống lệch giờ): Giữ nguyên
    return {
      newStreak: currentStreak,
      hasChanged: false,
      reason: 'INVALID_DATE_SEQUENCE'
    };
  }
}

module.exports = {
  toVietnamDateString,
  getDayDifference,
  evaluateStreak
};
