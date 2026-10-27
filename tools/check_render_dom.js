const https = require('https');

https.get('https://tower-of-knowledge.onrender.com/', (res) => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('Render Status:', res.statusCode);
    console.log('Render Contains Brand Logo Header:', html.includes('Tháp Tri Thức Logo'));
    console.log('Render Contains pyra_phoenix:', html.includes('pyra_phoenix'));
    console.log('Render Contains admin_aurum:', html.includes('admin_aurum'));
    console.log('Render Contains bot_dracobot:', html.includes('bot_dracobot'));
  });
}).on('error', (err) => console.log('Render error:', err.message));
