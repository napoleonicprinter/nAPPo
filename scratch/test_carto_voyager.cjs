const https = require('https');

const urls = [
    'https://a.basemaps.cartocdn.com/rastertiles/voyager/5/16/10.png',
    'https://a.basemaps.cartocdn.com/rastertiles/voyager/5/16/10@2x.png',
    'https://a.basemaps.cartocdn.com/light_all/5/16/10.png'
];

urls.forEach(url => {
    https.get(url, { headers: { 'User-Agent': 'nAPPoTrails/1.0' } }, res => {
        console.log(`URL: ${url} -> Status: ${res.statusCode}, Content-Type: ${res.headers['content-type']}`);
    });
});
