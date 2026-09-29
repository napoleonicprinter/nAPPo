const fs = require('fs');
const path = require('path');

const sitesPath = path.join(__dirname, '..', 'src', 'data', 'sites.json');
const sites = JSON.parse(fs.readFileSync(sitesPath, 'utf8'));

const isArc = (site) => {
    if (!site || !site.special) return false;
    if (Array.isArray(site.special)) {
        return site.special.some(sp => String(sp).trim().toLowerCase() === 'arc');
    }
    return String(site.special).trim().toLowerCase() === 'arc';
};

const hasFranceVictor = (site) => {
    if (!site.victor) return false;
    if (Array.isArray(site.victor)) {
        return site.victor.some(v => String(v).trim().toLowerCase() === 'france');
    }
    return String(site.victor).trim().toLowerCase() === 'france';
};

const matches = sites.filter(s => {
    const isBattleSite = s.category && s.category.trim().toLowerCase() === 'battle site';
    return isBattleSite && isArc(s) && !hasFranceVictor(s);
});

console.log(`Found ${matches.length} matching records:\n`);
matches.forEach((s, idx) => {
    console.log(`${idx + 1}. ID: ${s.id}`);
    console.log(`   Name: ${s.name}`);
    console.log(`   Year: ${s.year || s.date || 'N/A'}`);
    console.log(`   Location: ${s.location}, ${s.country}`);
    console.log(`   Victor: ${JSON.stringify(s.victor || null)}`);
    console.log(`   Defeated: ${JSON.stringify(s.defeated || null)}`);
    console.log(`   Tie: ${JSON.stringify(s.tie || null)}`);
    console.log(`   Special: ${JSON.stringify(s.special)}`);
    console.log(`   Commanders (Victor): ${JSON.stringify(s.commander_Victor || [])}`);
    console.log(`   Commanders (Loss): ${JSON.stringify(s.commander_Loss || [])}`);
    console.log(`   Commanders (Tie): ${JSON.stringify(s.commander_Tie || [])}`);
    console.log('---');
});
