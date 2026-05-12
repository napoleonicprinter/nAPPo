const fs = require('fs');
const buf = fs.readFileSync('d:\\nAPPo_trails\\src\\data\\testLocation.json');
console.log(buf.slice(0, 10).toString('hex'));
