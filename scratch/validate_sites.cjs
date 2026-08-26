const fs = require('fs');

try {
    const raw = fs.readFileSync('./src/data/sites.json', 'utf8');
    const sites = JSON.parse(raw);
    console.log(`Parsed ${sites.length} sites successfully.`);

    const invalidSites = [];
    sites.forEach((site, index) => {
        if (typeof site.latitude !== 'number' || typeof site.longitude !== 'number' || isNaN(site.latitude) || isNaN(site.longitude)) {
            invalidSites.push({ index, id: site.id, name: site.name, lat: site.latitude, lon: site.longitude, raw: site });
        }
    });

    if (invalidSites.length > 0) {
        console.error(`Found ${invalidSites.length} invalid sites:`);
        console.error(JSON.stringify(invalidSites, null, 2));
    } else {
        console.log('All sites have valid numeric latitude and longitude!');
    }
} catch (err) {
    console.error('JSON parse or validation error:', err.message);
}
