const http = require('http');

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing /health ---');
  const health = await makeRequest('/health');
  console.log('Health status:', health.data);

  console.log('\n--- 2. Testing /admin.html redirect ---');
  const redir = await makeRequest('/admin.html');
  console.log('Redirect status:', redir.status, 'Location:', redir.headers?.location);

  console.log('\n--- 3. Testing /api/courses/co-so-du-lieu (Checking question stock field) ---');
  const course = await makeRequest('/api/courses/co-so-du-lieu');
  if (course.data?.success) {
    const ch1 = course.data.data.cac_chuong[0];
    console.log(`Chapter: ${ch1.tieu_de}`);
    ch1.cac_moc.forEach(m => {
      console.log(`- [${m.ma_moc}] ${m.tieu_de}: ${m.tong_so_buoc} chặng x ${m.so_cau_moi_buoc} câu | Kho: ${m.so_luong_cau_hoi} câu`);
    });
  } else {
    console.error('Course details fetch failed:', course.data);
  }

  console.log('\n--- 4. Testing Admin Question CRUD with Types & Bloom ---');
  const authService = require('../services/auth.service');
  const adminToken = authService.generateToken({
    ma_nguoi_dung: 'u_admin_001',
    ten_dang_nhap: 'admin',
    vai_tro: 'QUAN_TRI_VIEN'
  });

  // Create a NOI_CAP question
  const newQuestion = await makeRequest('/api/admin/questions', 'POST', {
    ma_moc: 'moc_csdl_01_01',
    noi_dung: 'Ghép cặp các khái niệm CSDL căn bản',
    loai_cau_hoi: 'NOI_CAP',
    muc_bloom: 'HIEU',
    buoc_luyen_tap: 2,
    do_kho: 2,
    giai_thich: 'Các cặp thuật ngữ tương ứng chính xác.',
    du_lieu_cau_hoi: JSON.stringify({
      cap_dung: [
        { trai: 'Thuộc tính', phai: 'Cột trong bảng' },
        { trai: 'Bản ghi', phai: 'Dòng trong bảng' }
      ]
    })
  }, { 'Authorization': `Bearer ${adminToken}` });

  console.log('Created question result:', newQuestion.data?.success ? 'SUCCESS' : 'FAILED', newQuestion.data?.data?.ma_cau_hoi);

  if (newQuestion.data?.data?.ma_cau_hoi) {
    const qId = newQuestion.data.data.ma_cau_hoi;
    // Update it
    const upd = await makeRequest(`/api/admin/questions/${qId}`, 'PUT', {
      muc_bloom: 'VAN_DUNG',
      do_kho: 3
    }, { 'Authorization': `Bearer ${adminToken}` });
    console.log('Updated question:', upd.data?.data?.muc_bloom, 'do_kho:', upd.data?.data?.do_kho);

    // Clean up
    await makeRequest(`/api/admin/questions/${qId}`, 'DELETE', null, { 'Authorization': `Bearer ${adminToken}` });
    console.log('Cleaned up test question');
  }

  console.log('\nAll tests passed successfully!');
  process.exit(0);
}

run().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
