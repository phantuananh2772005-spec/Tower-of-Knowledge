const http = require('http');

http.get('http://localhost:3000/index.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP status:', res.statusCode);
    console.log('Has admin_aurum:', data.includes('admin_aurum'));
    console.log('Has admin_nguyet:', data.includes('admin_nguyet'));
    console.log('Has bot_dracobot:', data.includes('bot_dracobot'));
    console.log('Has bot_glitchy:', data.includes('bot_glitchy'));
    console.log('Has bot_tickbot:', data.includes('bot_tickbot'));
    console.log('Has bot_gloop:', data.includes('bot_gloop'));
  });
}).on('error', err => {
  console.error('Request error:', err.message);
});
