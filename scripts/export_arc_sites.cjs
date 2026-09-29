const fs = require('fs');
const path = require('path');

const sitesPath = path.join(__dirname, '..', 'src', 'data', 'sites.json');
const sites = JSON.parse(fs.readFileSync(sitesPath, 'utf8'));

const isArcSite = (site) => {
    if (!site || !site.special) return false;
    if (Array.isArray(site.special)) {
        return site.special.some(sp => String(sp).trim().toLowerCase() === 'arc');
    }
    return String(site.special).trim().toLowerCase() === 'arc';
};

const arcSites = sites.filter(isArcSite);

const csvRows = ['"Name"'];
arcSites.forEach(s => {
    const name = (s.name || '').trim().replace(/"/g, '""');
    csvRows.push(`"${name}"`);
});

const outputPath = path.join(__dirname, '..', 'arc_sites.csv');
const publicOutputPath = path.join(__dirname, '..', 'public', 'arc_sites.csv');

fs.writeFileSync(outputPath, csvRows.join('\r\n'), 'utf8');
fs.writeFileSync(publicOutputPath, csvRows.join('\r\n'), 'utf8');

console.log(`Successfully exported ${arcSites.length} Arc sites to arc_sites.csv`);
