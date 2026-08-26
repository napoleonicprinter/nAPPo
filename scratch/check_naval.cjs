const fs = require('fs');
const sites = JSON.parse(fs.readFileSync('./src/data/sites.json', 'utf8'));

const navalSites = sites.filter(s => s.category === 'Naval battle');
console.log('Total Naval battle sites:', navalSites.length);
navalSites.forEach(s => {
    const special = s.special;
    const isArc = Array.isArray(special) ? special.includes('arc') : (typeof special === 'string' && special.toLowerCase().includes('arc'));
    console.log(`ID: ${s.id}, Name: ${s.name}, Special: ${JSON.stringify(special)}, isArc: ${isArc}`);
});
