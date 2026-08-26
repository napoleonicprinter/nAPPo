const fs = require('fs');
const sitesBaseData = JSON.parse(fs.readFileSync('./src/data/sites.json', 'utf8'));

const derivedSites = sitesBaseData.map(site => {
    const rawSpecial = site.special || site.Special;
    return {
        ...site,
        special: rawSpecial ? (Array.isArray(rawSpecial) ? rawSpecial : [String(rawSpecial)]) : []
    };
});

const filterCategory = ["Battle site", "Naval battle"];
const showArcOnly = true;

const passCat = (site) => {
    if (filterCategory.length === 0) return true;
    return filterCategory.includes(site.category);
};

const sitesFiltered = derivedSites.filter(site => {
    if (showArcOnly && !site.special.includes('arc')) return false;
    if (!passCat(site)) return false;
    return true;
});

console.log('Filtered sites count:', sitesFiltered.length);
sitesFiltered.forEach(s => console.log(`ID: ${s.id}, Name: ${s.name}, Category: ${s.category}, Special: ${JSON.stringify(s.special)}`));
