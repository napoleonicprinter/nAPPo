import fs from 'fs';
const content = fs.readFileSync('dist-standard/assets/index-pMZY26u7.js', 'utf8');
const idx = content.indexOf('setItem("sitesData"');
if (idx !== -1) console.log(content.substring(Math.max(0, idx - 150), idx + 150));
else console.log('not found');
