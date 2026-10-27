const path = require('path');
const db = require(path.join(__dirname, '../database/db'));
db.query('SELECT ma_thu_cung, ten_thu_cung FROM thu_cung').then(r => {
  console.log('Pets in DB:', JSON.stringify(r, null, 2));
}).catch(console.error);
