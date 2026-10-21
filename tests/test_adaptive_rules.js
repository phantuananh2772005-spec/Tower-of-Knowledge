const assert = require('assert');
const {
  calculateQuestionWeight,
  aggregateSessionTelemetry,
  selectAdaptiveQuestions
} = require('../core/rules/adaptive.rules');

console.log('=== TEST ADAPTIVE RULES & SESSION TELEMETRY ===');

// 1. Test fast correct answer reduces weight
let mem1 = calculateQuestionWeight(null, { la_dung: true, thoi_gian_giay: 4.0, so_lan_tra_cuu: 0 });
assert.strictEqual(mem1.so_lan_lam, 1);
assert.strictEqual(mem1.so_lan_dung, 1);
assert.strictEqual(mem1.so_lan_sai, 0);
assert.strictEqual(mem1.streak, 1);
assert.ok(mem1.trong_so < 1.0, `Expected trong_so < 1.0, got ${mem1.trong_so}`);

// Consecutive fast answers reduce weight even further
mem1 = calculateQuestionWeight(mem1, { la_dung: true, thoi_gian_giay: 3.5, so_lan_tra_cuu: 0 });
assert.strictEqual(mem1.streak, 2);
mem1 = calculateQuestionWeight(mem1, { la_dung: true, thoi_gian_giay: 5.0, so_lan_tra_cuu: 0 });
assert.strictEqual(mem1.streak, 3);
assert.ok(mem1.trong_so <= 0.25, `Expected deep mastery weight <= 0.25, got ${mem1.trong_so}`);
console.log('   ✓ Fast correct recall drops weight to deep mastery:', mem1.trong_so);

// 2. Test wrong answer increases weight sharply
let memFail = calculateQuestionWeight(null, { la_dung: false, thoi_gian_giay: 15.0, so_lan_tra_cuu: 0 });
assert.strictEqual(memFail.so_lan_sai, 1);
assert.strictEqual(memFail.streak, 0);
assert.ok(memFail.trong_so >= 2.0, `Expected failure weight >= 2.0, got ${memFail.trong_so}`);
console.log('   ✓ Wrong answer elevates weight for repetition:', memFail.trong_so);

// 3. Test wrong answer with theory lookup gives highest priority
let memSevere = calculateQuestionWeight(null, { la_dung: false, thoi_gian_giay: 25.0, so_lan_tra_cuu: 2 });
assert.ok(memSevere.trong_so >= 2.5, `Expected severe gap weight >= 2.5, got ${memSevere.trong_so}`);
console.log('   ✓ Wrong answer with theory lookup gets urgent weight:', memSevere.trong_so);

// 4. Test session telemetry aggregation
const sampleDetails = [
  { ma_cau_hoi: 'q1', thoi_gian_giay: 6.0, la_dung: true, so_lan_tra_cuu: 0 },
  { ma_cau_hoi: 'q2', thoi_gian_giay: 14.0, la_dung: false, so_lan_tra_cuu: 1 },
  { ma_cau_hoi: 'q3', thoi_gian_giay: 10.0, la_dung: true, so_lan_tra_cuu: 0 }
];
const agg = aggregateSessionTelemetry(sampleDetails);
assert.strictEqual(agg.thoi_gian_tong_giay, 30.0);
assert.strictEqual(agg.ti_le_dung, 67); // 2/3 = 67%
assert.strictEqual(agg.toc_do_trung_binh_giay, 10.0);
assert.strictEqual(agg.tong_so_lan_tra_cuu, 1);
console.log('   ✓ Session aggregation computes accurate time, accuracy, speed and lookups:', agg);

// 5. Test adaptive question sampling
const candidateQuestions = [
  { ma_cau_hoi: 'q_hard_1' },
  { ma_cau_hoi: 'q_hard_2' },
  { ma_cau_hoi: 'q_easy_1' },
  { ma_cau_hoi: 'q_easy_2' },
  { ma_cau_hoi: 'q_new_1' },
  { ma_cau_hoi: 'q_new_2' },
  { ma_cau_hoi: 'q_new_3' },
  { ma_cau_hoi: 'q_new_4' }
];

const mockMemory = {
  q_hard_1: { trong_so: 3.0, so_lan_sai: 2, streak: 0 },
  q_hard_2: { trong_so: 2.5, so_lan_sai: 1, streak: 0 },
  q_easy_1: { trong_so: 0.1, so_lan_sai: 0, streak: 4 },
  q_easy_2: { trong_so: 0.15, so_lan_sai: 0, streak: 3 }
};

const picked = selectAdaptiveQuestions(candidateQuestions, mockMemory, 5);
assert.strictEqual(picked.length, 5);
const pickedIds = picked.map(q => q.ma_cau_hoi);
// High weight questions must be prioritized
assert.ok(pickedIds.includes('q_hard_1'), 'High priority question q_hard_1 must be picked');
assert.ok(pickedIds.includes('q_hard_2'), 'High priority question q_hard_2 must be picked');
console.log('   ✓ Adaptive selection picks high-priority questions:', pickedIds);

console.log('🎉 ALL ADAPTIVE LEARNING TESTS PASSED 100%!');
