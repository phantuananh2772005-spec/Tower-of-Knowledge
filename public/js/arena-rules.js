(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ArenaRules = factory();
})(globalThis, function () {
  const prizes = {
    ranked: { THANG: [50, 75], HOA: [25, 35], THUA: [20, 25] },
    other: { THANG: [25, 35], HOA: [15, 20], THUA: [10, 10] }
  };

  function rewards(mode, result) {
    const [coins, exp] = prizes[mode === 'RANKED' ? 'ranked' : 'other'][result];
    return { coins, exp };
  }

  function delta(result, hp) {
    if (result === 'THANG') return hp >= 50 ? 30 : 25;
    return result === 'THUA' ? -15 : 0;
  }

  function progress(points) {
    const score = Math.max(0, Number(points) || 0);
    const tiers = [
      [0, 'Tân thủ'], [90, 'Tập sự', 40], [210, 'Chuyên cần', 50],
      [360, 'Thông thái', 60], [540, 'Uyên bác', 120], [900, 'Đại sư']
    ];
    const index = tiers.findLastIndex(([minimum]) => score >= minimum);
    const [minimum, name, divisionSize] = tiers[index];
    const division = divisionSize ? Math.min(2, Math.floor((score - minimum) / divisionSize)) : null;
    const label = division === null ? name : name + ' ' + ['III', 'II', 'I'][division];
    const floor = minimum + (division === null ? 0 : division * divisionSize);
    const next = division !== null && division < 2 ? floor + divisionSize : tiers[index + 1]?.[0];
    const badge = ['tan-thu', 'tap-su', 'chuyen-can', 'thong-thai', 'uyen-bac', 'dai-su'][index];
    return { label, badge, percent: next ? Math.floor(100 * (score - floor) / (next - floor)) : 100 };
  }

  return { progress, rewards, delta };
});
