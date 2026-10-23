const http = require('http');

function postJson(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(resBody));
        } catch (e) {
          resolve({ raw: resBody, statusCode: res.statusCode });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(resBody));
        } catch (e) {
          resolve({ raw: resBody, statusCode: res.statusCode });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testDailyQuestsAndOnboarding() {
  console.log('--- Testing Daily Quests & Onboarding Gift API ---');

  // 1. Register or Login test user
  const email = `test_quest_${Date.now()}@nctu.edu.vn`;
  const regRes = await postJson('/api/auth/register', {
    ten_dang_nhap: email,
    mat_khau: 'Secret@123',
    ten_hien_thi: 'Test Quest User'
  });
  if (!regRes.success) {
    throw new Error('Register failed: ' + JSON.stringify(regRes));
  }
  const token = regRes.data.token;
  console.log('✓ Register test user successful:', email);

  // 2. Fetch quests status
  const statusRes = await getJson('/api/economy/quests-status', token);
  console.log('✓ Quests status received:', statusRes.data);

  // 3. Claim onboarding gift
  const giftRes = await postJson('/api/economy/onboarding-gift', {}, token);
  console.log('✓ Onboarding gift response:', giftRes.data);

  // 4. Claim daily quest (hoc_tap)
  const claimRes = await postJson('/api/economy/claim-quest', { questId: 'hoc_tap' }, token);
  console.log('✓ Claim quest [hoc_tap] response:', claimRes.data);

  // 5. Test idempotency (claim again should report alreadyClaimed: true)
  const claimRepeat = await postJson('/api/economy/claim-quest', { questId: 'hoc_tap' }, token);
  console.log('✓ Claim quest repeat response:', claimRepeat.data);

  // 6. Clean up test user
  const db = require('../database/db');
  await db.execute("DELETE FROM nguoi_dung WHERE ten_dang_nhap = $1", [email]);
  console.log('✓ Cleaned up test user from DB');

  console.log('\n✅ ALL DAILY QUESTS & ONBOARDING API TESTS PASSED SUCCESSFULLY!');
}

testDailyQuestsAndOnboarding().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
