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
    return { label: Number(points) > 0 ? 'Đã xếp hạng' : 'Chưa có điểm hạng', percent: 0 };
  }

  return { progress, rewards, delta };
});
