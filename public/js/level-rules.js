/* One definition shared by Node services and the learner UI. */
(function (root, factory) {
  const rules = factory();
  if (typeof module === 'object' && module.exports) module.exports = rules;
  else root.LevelRules = rules;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const thresholds = [
    { minExp: 0, title: 'TAN_THU', level: 1, label: 'Tân thủ', icon: '🌱' },
    { minExp: 100, title: 'TAP_SU', level: 2, label: 'Tập sự', icon: '📖' },
    { minExp: 500, title: 'THONG_THAI_1', level: 3, label: 'Thông thái I', icon: '💡' },
    { minExp: 1500, title: 'THONG_THAI_2', level: 4, label: 'Thông thái II', icon: '✨' },
    { minExp: 3500, title: 'THONG_THAI_3', level: 5, label: 'Thông thái III', icon: '🌟' },
    { minExp: 7000, title: 'DAI_SU', level: 6, label: 'Đại sư', icon: '👑' }
  ];
  function progress(value) {
    const totalExp = Math.max(0, Number(value) || 0);
    const current = [...thresholds].reverse().find(r => totalExp >= r.minExp);
    const next = thresholds.find(r => r.level === current.level + 1) || null;
    const earned = totalExp - current.minExp;
    const needed = next ? next.minExp - current.minExp : 0;
    return { ...current, totalExp, nextExp: next?.minExp ?? null, nextLevel: next?.level ?? null,
      earned, needed, remaining: next ? Math.max(0, next.minExp - totalExp) : 0,
      percent: next ? Math.min(100, Math.floor(earned / needed * 100)) : 100 };
  }
  return { thresholds, progress };
});
