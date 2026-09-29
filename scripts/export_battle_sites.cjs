const fs = require('fs');
const path = require('path');

const sitesPath = path.join(__dirname, '..', 'src', 'data', 'sites.json');
const sites = JSON.parse(fs.readFileSync(sitesPath, 'utf8'));

const battleSites = sites.filter(s => s.category === 'Battle site');

const csvRows = ['"Name","Year"'];
battleSites.forEach(s => {
    const name = (s.name || '').trim().replace(/"/g, '""');
    const year = s.year !== undefined && s.year !== null ? String(s.year).trim() : '';
    csvRows.push(`"${name}",${year}`);
});

const outputPath = path.join(__dirname, '..', 'battle_sites.csv');
const publicOutputPath = path.join(__dirname, '..', 'public', 'battle_sites.csv');

fs.writeFileSync(outputPath, csvRows.join('\r\n'), 'utf8');
fs.writeFileSync(publicOutputPath, csvRows.join('\r\n'), 'utf8');

console.log(`Successfully exported ${battleSites.length} battle sites to battle_sites.csv`);
