const https = require('https');

const urls = [
    'https://a.tile.openstreetmap.org/5/16/10.png',
    'https://a.basemaps.cartocdn.com/light_all/5/16/10.png',
    'https://a.basemaps.cartocdn.com/dark_all/5/16/10.png',
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/5/10/16',
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/10/16'
];

urls.forEach(url => {
    https.get(url, { headers: { 'User-Agent': 'nAPPoTrails/1.0' } }, res => {
        console.log(`URL: ${url} -> Status: ${res.statusCode}, Content-Type: ${res.headers['content-type']}`);
    }).on('error', err => {
        console.error(`URL: ${url} -> Error: ${err.message}`);
    });
});
