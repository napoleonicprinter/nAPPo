const https = require('https');

const urls = [
    'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/refs/heads/main/public/assets/images/Sites/Daoiz.webp',
    'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/main/public/assets/images/Sites/Daoiz.webp',
    'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/refs/heads/main/public/assets/images/Sites/Daoíz.webp',
    'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/refs/heads/main/public/assets/Dao%C3%ADz.webp',
    'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/refs/heads/main/public/assets/images/Sites/Dao%C3%ADz.webp'
];

urls.forEach(url => {
    https.get(url, { headers: { 'User-Agent': 'ImageTester/1.0' } }, res => {
        console.log(`URL: ${url} -> Status: ${res.statusCode}, Content-Length: ${res.headers['content-length']}`);
    }).on('error', err => {
        console.error(`URL: ${url} -> Error: ${err.message}`);
    });
});
