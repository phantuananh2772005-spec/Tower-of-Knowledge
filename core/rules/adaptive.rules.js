/**
 * Adaptive Learning & Session Telemetry Business Rules
 * Pure business logic: Spaced repetition weighting, mastery scoring,
 * and adaptive question sampling.
 */

/**
 * Calculates updated memory state for a question after a user attempt.
 * @param {object|null} currentMemory - Existing memory state from DB
 * @param {object} attempt - Telemetry of the attempt { la_dung, thoi_gian_giay, so_lan_tra_cuu }
 * @returns {object} Updated memory state
 */
function calculateQuestionWeight(currentMemory, attempt) {
  const mem = currentMemory ? { ...currentMemory } : {
    so_lan_lam: 0,
    so_lan_dung: 0,
    so_lan_sai: 0,
    streak: 0,
    thoi_gian_tb: 0,
    tong_so_lan_tra_cuu: 0,
    trong_so: 1.0,
    lan_lam_cuoi: null
  };

  const laDung = Boolean(attempt.la_dung);
  const timeSec = Math.max(0.5, Number(attempt.thoi_gian_giay) || 5.0);
  const lookups = Math.max(0, parseInt(attempt.so_lan_tra_cuu, 10) || 0);

  mem.so_lan_lam += 1;
  mem.tong_so_lan_tra_cuu += lookups;
  mem.lan_lam_cuoi = new Date().toISOString();

  // Lưu chi tiết các mốc thời gian tra cứu lý thuyết gắn với câu hỏi này
  if (attempt.nhat_ky_tra_cuu && Array.isArray(attempt.nhat_ky_tra_cuu) && attempt.nhat_ky_tra_cuu.length > 0) {
    mem.lich_su_tra_cuu = mem.lich_su_tra_cuu || [];
    mem.lich_su_tra_cuu.push(...attempt.nhat_ky_tra_cuu);
    if (mem.lich_su_tra_cuu.length > 10) {
      mem.lich_su_tra_cuu = mem.lich_su_tra_cuu.slice(-10);
    }
    const lastLookup = attempt.nhat_ky_tra_cuu[attempt.nhat_ky_tra_cuu.length - 1];
    mem.lan_tra_cuu_cuoi = lastLookup.thoi_diem;
  }

  // Moving average response time
  mem.thoi_gian_tb = Math.round(((mem.thoi_gian_tb * (mem.so_lan_lam - 1) + timeSec) / mem.so_lan_lam) * 10) / 10;

  if (laDung) {
    mem.so_lan_dung += 1;
    mem.streak += 1;

    if (timeSec <= 8.0 && lookups === 0) {
      // Fast automatic recall without consulting theory
      if (mem.streak >= 3) {
        mem.trong_so = Math.max(0.1, Math.round(mem.trong_so * 0.4 * 100) / 100);
      } else if (mem.streak === 2) {
        mem.trong_so = Math.max(0.2, Math.round(mem.trong_so * 0.6 * 100) / 100);
      } else {
        mem.trong_so = Math.max(0.4, Math.round(mem.trong_so * 0.75 * 100) / 100);
      }
    } else if (timeSec > 20.0 || lookups > 0) {
      // Correct but hesitated or looked up theory: maintain high review priority
      mem.trong_so = Math.max(1.0, Math.min(1.8, Math.round(mem.trong_so * 1.1 * 100) / 100));
      mem.streak = 1; // reset streak to 1 because assistance or long hesitation was involved
    } else {
      // Normal speed (8s - 20s), no theory lookup
      mem.trong_so = Math.max(0.4, Math.round(mem.trong_so * 0.7 * 100) / 100);
    }
  } else {
    // Incorrect answer
    mem.so_lan_sai += 1;
    mem.streak = 0;

    if (lookups > 0) {
      // Failed even after reading theory: severe gap
      mem.trong_so = Math.min(5.0, Math.max(2.5, Math.round(mem.trong_so * 2.2 * 100) / 100));
    } else {
      // Standard failure
      mem.trong_so = Math.min(4.0, Math.max(2.0, Math.round(mem.trong_so * 1.8 * 100) / 100));
    }
  }

  return mem;
}

/**
 * Aggregates overall session statistics from question details.
 * @param {Array<object>} details - Array of question attempt records
 * @returns {object} { thoi_gian_tong_giay, ti_le_dung, toc_do_trung_binh_giay, tong_so_lan_tra_cuu }
 */
function aggregateSessionTelemetry(details = []) {
  if (!details || details.length === 0) {
    return {
      thoi_gian_tong_giay: 0,
      ti_le_dung: 0,
      toc_do_trung_binh_giay: 0,
      tong_so_lan_tra_cuu: 0
    };
  }

  let totalTime = 0;
  let correctCount = 0;
  let totalLookups = 0;

  details.forEach(d => {
    totalTime += (Number(d.thoi_gian_giay) || 0);
    if (d.la_dung) correctCount++;
    totalLookups += (parseInt(d.so_lan_tra_cuu, 10) || 0);
  });

  const count = details.length;
  const pct = Math.round((correctCount / count) * 100);
  const avgSpeed = Math.round((totalTime / count) * 10) / 10;

  return {
    thoi_gian_tong_giay: Math.round(totalTime * 10) / 10,
    ti_le_dung: pct,
    toc_do_trung_binh_giay: avgSpeed,
    tong_so_lan_tra_cuu: totalLookups
  };
}

/**
 * Selects an adaptive subset of questions based on memory state weights.
 * Target distribution:
 * - 40% High Weight (previously failed, looked up, or slow)
 * - 40% Unseen / Medium Weight (fresh concepts)
 * - 20% Low Weight / Mastered (cross-validation)
 *
 * @param {Array<object>} allQuestions - All candidate questions for the checkpoint/step
 * @param {object} memoryMap - Map of { [ma_cau_hoi]: memoryState }
 * @param {number} targetCount - Desired number of questions to pick
 * @returns {Array<object>} Selected question array
 */
function selectAdaptiveQuestions(allQuestions = [], memoryMap = {}, targetCount = 10) {
  if (!allQuestions || allQuestions.length === 0) return [];
  if (allQuestions.length <= targetCount) {
    return [...allQuestions].sort(() => Math.random() - 0.5);
  }

  const highWeightBucket = [];
  const unseenMediumBucket = [];
  const lowWeightBucket = [];

  allQuestions.forEach(q => {
    const mem = memoryMap[q.ma_cau_hoi];
    if (!mem) {
      unseenMediumBucket.push(q);
    } else if (mem.trong_so >= 1.5 || mem.so_lan_sai > 0 && mem.streak === 0) {
      highWeightBucket.push({ q, weight: mem.trong_so });
    } else if (mem.trong_so < 0.7 && mem.streak >= 2) {
      lowWeightBucket.push({ q, weight: mem.trong_so });
    } else {
      unseenMediumBucket.push(q);
    }
  });

  // Sort high weights descending (most critical first)
  highWeightBucket.sort((a, b) => b.weight - a.weight);

  const highTarget = Math.max(1, Math.round(targetCount * 0.4));
  const medTarget = Math.max(1, Math.round(targetCount * 0.4));
  const lowTarget = Math.max(1, targetCount - highTarget - medTarget);

  const selected = [];
  const selectedIds = new Set();

  function addCandidate(q) {
    if (q && !selectedIds.has(q.ma_cau_hoi)) {
      selected.push(q);
      selectedIds.add(q.ma_cau_hoi);
    }
  }

  // 1. Pick from high weight bucket (40%)
  for (let i = 0; i < highWeightBucket.length && selected.length < highTarget; i++) {
    addCandidate(highWeightBucket[i].q);
  }

  // 2. Pick from unseen/medium bucket (40%)
  const shuffledMed = [...unseenMediumBucket].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffledMed.length && (selected.length < highTarget + medTarget); i++) {
    addCandidate(shuffledMed[i]);
  }

  // 3. Pick from low weight / mastered bucket (20%)
  const shuffledLow = lowWeightBucket.map(item => item.q).sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffledLow.length && selected.length < targetCount; i++) {
    addCandidate(shuffledLow[i]);
  }

  // 4. Fill any remaining spots from any unpicked question
  if (selected.length < targetCount) {
    const remaining = allQuestions.filter(q => !selectedIds.has(q.ma_cau_hoi)).sort(() => Math.random() - 0.5);
    for (const q of remaining) {
      if (selected.length >= targetCount) break;
      addCandidate(q);
    }
  }

  // Final shuffle so question order is natural
  return selected.sort(() => Math.random() - 0.5);
}

module.exports = {
  calculateQuestionWeight,
  aggregateSessionTelemetry,
  selectAdaptiveQuestions
};
