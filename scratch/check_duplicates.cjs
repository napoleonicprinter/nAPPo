const fs = require('fs');

try {
    const raw = fs.readFileSync('./src/data/sites.json', 'utf8');
    const sites = JSON.parse(raw);
    console.log(`Total sites in sites.json: ${sites.length}`);

    const idCounts = {};
    const duplicates = [];

    sites.forEach((site, index) => {
        const id = String(site.id);
        if (idCounts[id]) {
            idCounts[id].push({ index, name: site.name });
        } else {
            idCounts[id] = [{ index, name: site.name }];
        }
    });

    Object.keys(idCounts).forEach(id => {
        if (idCounts[id].length > 1) {
            duplicates.push({ id, occurrences: idCounts[id] });
        }
    });

    if (duplicates.length > 0) {
        console.error(`Found ${duplicates.length} duplicate site IDs:`);
        console.error(JSON.stringify(duplicates, null, 2));
    } else {
        console.log('No duplicate site IDs found in sites.json!');
    }
} catch (err) {
    console.error('Validation error:', err.message);
}
