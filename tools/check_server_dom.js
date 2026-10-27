const http = require('http');

http.get('http://localhost:3000/', (res) => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Contains Brand Logo Header:', html.includes('Tháp Tri Thức Logo'));
    console.log('Contains pyra_phoenix in allPets:', html.includes('pyra_phoenix'));
    console.log('Contains admin_aurum in allPets:', html.includes('admin_aurum'));
    console.log('Contains bot_dracobot in botPool:', html.includes('bot_dracobot'));
  });
}).on('error', console.error);
