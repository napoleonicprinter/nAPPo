const fs = require('fs');
const https = require('https');

try {
    const sites = JSON.parse(fs.readFileSync('./src/data/sites.json', 'utf8'));
    console.log(`Checking image URLs for ${sites.length} sites...`);

    const daoizSite = sites.find(s => String(s.id) === '134');
    console.log("Site 134 Image URL in sites.json:", daoizSite?.image);

} catch (err) {
    console.error(err);
}
