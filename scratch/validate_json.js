import fs from 'fs';
import path from 'path';

const dataFiles = [
    'sites.json',
    'events.json',
    'news.json',
    'shopping.json',
    'shows.json'
];

const dataPath = 'd:/nAPPo_trails/src/data';

dataFiles.forEach(file => {
    const filePath = path.join(dataPath, file);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        console.log(`${file}: Valid JSON. Count: ${Array.isArray(data) ? data.length : 'Object'}`);
        
        if (file === 'sites.json') {
            data.forEach((site, index) => {
                if (!site.name) console.error(`Site at index ${index} (ID: ${site.id}) is missing a name!`);
                if (site.latitude === undefined || site.longitude === undefined) console.error(`Site at index ${index} (ID: ${site.id}) is missing coordinates!`);
            });
        }
    } catch (e) {
        console.error(`${file}: Invalid JSON! Error: ${e.message}`);
        // Try to find the line number
        const lines = fs.readFileSync(filePath, 'utf8').split('\n');
        // JSON.parse error usually gives a position.
    }
});
