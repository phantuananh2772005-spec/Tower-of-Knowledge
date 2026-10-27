const http = require('http');

http.get('http://localhost:3000/pet-gallery.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP status:', res.statusCode);
    console.log('Has grid-batch-3:', data.includes('id="grid-batch-3"'));
    console.log('Has grid-batch-4:', data.includes('id="grid-batch-4"'));
    console.log('Has bot_dracobot:', data.includes('bot_dracobot'));
    console.log('Has admin_nguyet:', data.includes('admin_nguyet'));
    console.log('Has admin_aurum:', data.includes('admin_aurum'));
  });
}).on('error', err => {
  console.error('Request error:', err.message);
});
