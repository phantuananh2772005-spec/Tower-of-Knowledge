/**
 * Comprehensive Live Verification of Render Production:
 * 1. User Registration & Auth
 * 2. Course Enrollment
 * 3. 4-Step Bloom Progression with Telemetry Tracking (Time, Speed, Lookups)
 * 4. Step 4 completion -> Checkpoint DA_HOAN_THANH -> Next Checkpoint DA_MO
 * 5. Telemetry & Memory weight validation
 */

const assert = require('assert');

const BASE_URL = 'https://tower-of-knowledge.onrender.com';

async function fetchJson(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const resp = await fetch(url, options);
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`[${resp.status}] ${data.error?.message || JSON.stringify(data)}`);
  }
  return data;
}

async function runLiveVerification() {
  console.log('================================================================');
  console.log('🚀 LIVE VERIFICATION ON RENDER PRODUCTION');
  console.log('🔗 URL:', BASE_URL);
  console.log('================================================================\n');

  // 1. Health check
  const health = await fetchJson('/health');
  console.log('1. Health check:', health.data);
  assert.strictEqual(health.data.status, 'HEALTHY');

  // 2. Register test learner
  const num = Math.floor(Math.random() * 90000) + 10000;
  const username = `bloom_student_${num}`;
  const regRes = await fetchJson('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ten_dang_nhap: username,
      email: `${username}@nctu.edu.vn`,
      mat_khau: 'MatKhau@123',
      ten_hien_thi: 'Sinh Viên Duolingo'
    })
  });
  const token = regRes.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log(`2. Registered learner: ${username} (Initial rank: ${regRes.data.nguoi_dung.danh_hieu}, Coins: ${regRes.data.nguoi_dung.xu_tri_thuc})`);

  // 3. Enroll in course
  const enrollRes = await fetchJson('/api/courses/co-so-du-lieu/enroll', {
    method: 'POST',
    headers: authHeaders
  });
  console.log(`3. Course enrollment: ${enrollRes.data.message}`);

  // 4. Progress through all 4 Duolingo Steps
  for (let step = 1; step <= 4; step++) {
    console.log(`\n--- Running Step ${step}/4 ---`);
    const contentRes = await fetchJson(`/api/checkpoints/moc_csdl_01_01?step=${step}`, {
      headers: authHeaders
    });
    const questions = contentRes.data.danh_sach_cau_hoi;
    console.log(`   Loaded ${questions.length} questions for Step ${step}`);

    const answers = [];
    for (const q of questions) {
      if (q.loai_cau_hoi === 'NOI_CAP' && q.du_lieu) {
        const pairs = [];
        const pm = q.du_lieu.pairsMap || {};
        for (const [left, right] of Object.entries(pm)) {
          pairs.push({ left, right });
        }
        answers.push({
          ma_cau_hoi: q.ma_cau_hoi,
          matched_pairs: pairs,
          thoi_gian_giay: 7.2,
          so_lan_tra_cuu: step === 1 ? 1 : 0
        });
      } else if (q.loai_cau_hoi === 'DIEN_TU' && q.du_lieu) {
        answers.push({
          ma_cau_hoi: q.ma_cau_hoi,
          selected_word: q.du_lieu.blank_answer,
          thoi_gian_giay: 5.0,
          so_lan_tra_cuu: 0
        });
      } else if (q.loai_cau_hoi === 'SAP_XEP_CAU' && q.du_lieu) {
        answers.push({
          ma_cau_hoi: q.ma_cau_hoi,
          ordered_words: q.du_lieu.correct_order,
          thoi_gian_giay: 8.0,
          so_lan_tra_cuu: 0
        });
      } else {
        // Trắc nghiệm: find correct choice via check-answer
        let correctIdx = 0;
        for (let i = 0; i < 4; i++) {
          const chk = await fetchJson('/api/checkpoints/moc_csdl_01_01/check-answer', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              ma_cau_hoi: q.ma_cau_hoi,
              tra_loi: { ma_cau_hoi: q.ma_cau_hoi, chi_muc_chon: i }
            })
          });
          if (chk.data.la_dung) {
            correctIdx = i;
            break;
          }
        }
        answers.push({
          ma_cau_hoi: q.ma_cau_hoi,
          chi_muc_chon: correctIdx,
          thoi_gian_giay: 4.5,
          so_lan_tra_cuu: 0
        });
      }
    }

    const stepRes = await fetchJson('/api/checkpoints/moc_csdl_01_01/submit-step', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        buoc: step,
        cau_tra_loi: answers
      })
    });

    console.log(`   ✓ Step ${step} Passed: ${stepRes.data.isPassed} (${stepRes.data.scorePercentage}%)`);
    console.log(`   ✓ Telemetry:`, stepRes.data.telemetry);
    console.log(`   ✓ Next Step: ${stepRes.data.buoc_ke_tiep}`);
    assert.strictEqual(stepRes.data.isPassed, true, `Step ${step} must pass`);
    assert(stepRes.data.telemetry, 'Telemetry must be present');
    if (step === 1) {
      assert(stepRes.data.telemetry.tong_so_lan_tra_cuu >= 1, 'Lookup in step 1 should be recorded');
    }
  }

  // 5. Verify Roadmap Progression on Render
  console.log('\n--- 5. Verifying Roadmap Progression on Render ---');
  const courseProg = await fetchJson('/api/courses/co-so-du-lieu', {
    headers: authHeaders
  });
  const m1 = courseProg.data.cac_chuong[0].cac_moc[0];
  const m2 = courseProg.data.cac_chuong[0].cac_moc[1];

  console.log(`   Mốc 1.1 Status: ${m1.trang_thai} (Steps: ${m1.cac_buoc_hoan_thanh})`);
  console.log(`   Mốc 1.2 Status: ${m2.trang_thai} (Next unlocked checkpoint)`);
  assert.strictEqual(m1.trang_thai, 'DA_HOAN_THANH', 'Mốc 1.1 must be DA_HOAN_THANH after completing all 4 steps');
  assert.strictEqual(m1.cac_buoc_hoan_thanh, '4/4', 'Mốc 1.1 must show 4/4 steps completed');
  assert.strictEqual(m2.trang_thai, 'DA_MO', 'Mốc 1.2 must be DA_MO (unlocked)');

  console.log('\n================================================================');
  console.log('🎉 100% LIVE VERIFICATION SUCCESSFUL ON RENDER PRODUCTION!');
  console.log('================================================================\n');
}

runLiveVerification().catch(err => {
  console.error('❌ Live verification failed:', err);
  process.exit(1);
});
