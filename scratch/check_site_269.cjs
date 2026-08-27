const fs = require('fs');
const https = require('https');

const localSites = JSON.parse(fs.readFileSync('./src/data/sites.json', 'utf8'));
const site269Local = localSites.find(s => String(s.id) === '269');
console.log("LOCAL site 269:", JSON.stringify(site269Local, null, 2));

const url = `https://raw.githubusercontent.com/napoleonicprinter/nAPPo/main/src/data/sites.json?t=${Date.now()}`;
https.get(url, { headers: { 'User-Agent': 'Tester/1.0' } }, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const githubSites = JSON.parse(body);
            const site269Github = githubSites.find(s => String(s.id) === '269');
            console.log("\nGITHUB site 269:", JSON.stringify(site269Github, null, 2));
        } else {
            console.log("GITHUB HTTP Status:", res.statusCode);
        }
    });
});
