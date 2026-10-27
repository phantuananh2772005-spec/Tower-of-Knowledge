const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');

console.log('Index.html length:', html.length);
console.log('Has Brand Logo:', html.includes('Tháp Tri Thức Logo'));
console.log('Has pyra_phoenix in ownedPets:', html.includes('pyra_phoenix: true'));
