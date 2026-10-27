const http = require('http');

const files = [
  '/favicon.ico',
  '/assets/favicon-32x32.png',
  '/assets/logo.png',
  '/assets/logo_transparent.png',
  '/assets/logo_original.jpg',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

async function checkUrl(urlPath) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: 'HEAD'
    }, (res) => {
      resolve({ path: urlPath, status: res.statusCode, length: res.headers['content-length'] });
    });
    req.on('error', (err) => resolve({ path: urlPath, error: err.message }));
    req.end();
  });
}

async function run() {
  for (const f of files) {
    const r = await checkUrl(f);
    console.log(`${r.path} => ${r.status} (${r.length} bytes)`);
  }
}

run();
