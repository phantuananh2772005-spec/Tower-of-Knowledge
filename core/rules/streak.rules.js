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

function normalizeDateStr(input, useVietnamTz = false) {
  if (!input) return null;
  if (input instanceof Date) {
    return useVietnamTz ? toVietnamDateString(input) : input.toISOString().slice(0, 10);
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return useVietnamTz ? toVietnamDateString(parsed) : parsed.toISOString().slice(0, 10);
    }
  }
  return null;
}

/**
 * Tính toán trạng thái chuỗi Streak mới khi có hoạt động học tập / đấu trường.
 * Hỗ trợ cả 2 dạng gọi:
 *   1) Tham số vị trí: evaluateStreak(lastActiveDate, todayDate, currentStreak)
 *   2) Đối tượng: evaluateStreak({ lastActivityDate, currentStreak, currentDate })
 * @returns {{
 *   newStreak: number,
 *   hasChanged: boolean,
 *   reason: string,
 *   shouldUpdateDate: boolean,
 *   streakIncremented: boolean,
 *   todayStr: string
 * }}
 */
function evaluateStreak(lastActiveDateOrObj, todayDate, currentStreak) {
  let rawLast = lastActiveDateOrObj;
  let rawToday = todayDate;
  let rawStreak = currentStreak;

  if (typeof lastActiveDateOrObj === 'object' && lastActiveDateOrObj !== null && !(lastActiveDateOrObj instanceof Date)) {
    rawLast = lastActiveDateOrObj.lastActivityDate ?? lastActiveDateOrObj.lastActiveDate ?? null;
    rawToday = lastActiveDateOrObj.currentDate ?? lastActiveDateOrObj.todayDate ?? new Date();
    rawStreak = lastActiveDateOrObj.currentStreak ?? 0;
  }

  const normLast = normalizeDateStr(rawLast, false);
  const normToday = normalizeDateStr(rawToday || new Date(), true);
  const normStreak = Math.max(0, Number(rawStreak) || 0);

  // Lần đầu tiên học tập hoặc tài khoản chưa từng kích hoạt streak (streak = 0)
  if (!normLast || normStreak <= 0) {
    return {
      newStreak: 1,
      hasChanged: true,
      reason: 'FIRST_ACTIVITY',
      shouldUpdateDate: true,
      streakIncremented: true,
      todayStr: normToday
    };
  }

  // Đã có hoạt động hôm nay rồi: Bỏ qua, không cộng 2 lần trong ngày
  if (normLast === normToday) {
    return {
      newStreak: normStreak,
      hasChanged: false,
      reason: 'ALREADY_ACTIVE_TODAY',
      shouldUpdateDate: false,
      streakIncremented: false,
      todayStr: normToday
    };
  }

  const diffDays = getDayDifference(normLast, normToday);

  if (diffDays === 1) {
    // Học ngày liền kề: Tăng chuỗi +1
    return {
      newStreak: normStreak + 1,
      hasChanged: true,
      reason: 'CONSECUTIVE_DAY_STREAK_INCREASE',
      shouldUpdateDate: true,
      streakIncremented: true,
      todayStr: normToday
    };
  } else if (diffDays > 1) {
    // Bị gián đoạn quá 1 ngày: Reset về 1 (hoạt động của ngày hôm nay bắt đầu chuỗi mới)
    return {
      newStreak: 1,
      hasChanged: true,
      reason: 'STREAK_BROKEN_RESET_TO_ONE',
      shouldUpdateDate: true,
      streakIncremented: false,
      todayStr: normToday
    };
  } else {
    // Trường hợp ngày không hợp lệ (hệ thống lệch giờ): Giữ nguyên
    return {
      newStreak: normStreak,
      hasChanged: false,
      reason: 'INVALID_DATE_SEQUENCE',
      shouldUpdateDate: false,
      streakIncremented: false,
      todayStr: normToday
    };
  }
}

module.exports = {
  toVietnamDateString,
  getDayDifference,
  evaluateStreak
};
