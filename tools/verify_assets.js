const http = require('http');

const pets = ['bot_gloop', 'bot_tickbot', 'bot_glitchy', 'bot_dracobot', 'admin_aurum', 'admin_nguyet'];

async function checkUrl(urlPath) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: 'HEAD'
    }, (res) => {
      resolve({ status: res.statusCode, length: res.headers['content-length'] });
    });
    req.on('error', (err) => resolve({ error: err.message }));
    req.end();
  });
}

async function run() {
  for (const p of pets) {
    const idlePath = `/assets/pets/${p}/03_spritesheet/${p}_idle.gif`;
    const atkPath = `/assets/pets/${p}/03_spritesheet/${p}_attack.gif`;
    const r1 = await checkUrl(idlePath);
    const r2 = await checkUrl(atkPath);
    console.log(`${p}: IDLE => status ${r1.status} (${r1.length} bytes), ATK => status ${r2.status} (${r2.length} bytes)`);
  }
}

run();
