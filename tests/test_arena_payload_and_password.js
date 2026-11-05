const { test } = require('node:test');
const assert = require('node:assert/strict');

test('live match exposes only playable data for all four question types', async () => {
  const rows = [
    { loai_cau_hoi: 'TRAC_NGHIEM_4', dap_an_a: 'A', dap_an_b: 'B', vi_tri_dap_an_dung: 1 },
    { loai_cau_hoi: 'DIEN_TU', du_lieu_cau_hoi: { blank_answer: 'B', options: ['B', 'A'] } },
    { loai_cau_hoi: 'NOI_CAP', du_lieu_cau_hoi: { pairs: [{ left: 'L1', right: 'R2' }, { left: 'L2', right: 'R1' }] } },
    { loai_cau_hoi: 'SAP_XEP_CAU', du_lieu_cau_hoi: { correct_order: ['B', 'A'], distractors: ['C'] } }
  ];
  const dbPath = require.resolve('../database/db');
  require.cache[dbPath] = { exports: {
    queryOne: async () => ({ ma_tran: 'test' }),
    query: async sql => sql.includes('SELECT qm.ma_cau_trong_tran, qm.thu_tu_cau') ? rows : []
  } };
  const { getMatchState } = require('../services/arena.service');
  const { cau_hoi: questions } = await getMatchState('test');
  assert.deepEqual(questions.map(q => q.dap_an), [['A', 'B'], ['A', 'B'], [], ['A', 'B', 'C']]);
  assert.deepEqual(questions[2].du_lieu_cau_hoi, { left: ['L1', 'L2'], right: ['R1', 'R2'] });
  assert.doesNotMatch(JSON.stringify(questions), /vi_tri_dap_an_dung|blank_answer|pairs|correct_order|distractors|giai_thich/);
});

test('new password rules reject weak inputs and still verify legacy hashes', async () => {
  const bcrypt = require('bcryptjs');
  const { validatePassword, hashPassword, verifyPassword } = require('../services/password-policy');
  for (const weak of ['short', '123456789012345', 'passwordpassword', 'abcabcabcabcabc']) {
    assert.throws(() => validatePassword(weak));
  }
  const password = 'Mua xuan tren dinh nui';
  validatePassword(password);
  const hash = await hashPassword(password);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword('different password', hash), false);
  assert.equal(await verifyPassword('legacy', await bcrypt.hash('legacy', 4)), true);
});
