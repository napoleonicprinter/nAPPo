const https = require('https');

const baseUrl = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/main/src/data';

const files = ['sites.json', 'shows.json', 'shopping.json', 'events.json', 'news.json', 'messages.json', 'deals.json'];

files.forEach(file => {
    const url = `${baseUrl}/${file}?t=${Date.now()}`;
    https.get(url, { headers: { 'User-Agent': 'nAPPoTrailsApp/1.0' } }, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log(`FETCH ${file}: Status ${res.statusCode}, Length ${body.length} bytes`);
            if (res.statusCode === 200) {
                try {
                    const json = JSON.parse(body);
                    console.log(`  -> Valid JSON! Array count: ${Array.isArray(json) ? json.length : 'Object'}`);
                } catch (e) {
                    console.error(`  -> Invalid JSON: ${e.message}`);
                }
            }
        });
    }).on('error', err => {
        console.error(`FETCH ${file} ERROR:`, err.message);
    });
});
