import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../src/data');

const GITHUB_SITES_PREFIX = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/refs/heads/main/public/assets/images/Sites/';
const GITHUB_MAPS_PREFIX = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/refs/heads/main/public/assets/images/Maps/';

function optimizeSites() {
    const filePath = path.join(DATA_DIR, 'sites.json');
    if (!fs.existsSync(filePath)) return;

    const raw = fs.readFileSync(filePath, 'utf8');
    const sites = JSON.parse(raw);
    const beforeSize = Buffer.byteLength(raw);

    const optimized = sites.map(site => {
        const s = { ...site };

        // Fix typos in schema
        if (s.desciption && !s.description) {
            s.description = s.desciption;
            delete s.desciption;
        }

        // Shorten image URL prefix if hosted on GitHub raw Sites folder
        if (typeof s.image === 'string' && s.image.startsWith(GITHUB_SITES_PREFIX)) {
            s.image = s.image.substring(GITHUB_SITES_PREFIX.length);
        }

        // Fix typo in Wikipedia URL
        if (typeof s.wikipedia_link === 'string' && s.wikipedia_link.startsWith('hhttps://')) {
            s.wikipedia_link = s.wikipedia_link.replace('hhttps://', 'https://');
        }

        // Round coordinates to 5 decimals (~1.1 meter precision)
        if (typeof s.latitude === 'number') {
            s.latitude = Math.round(s.latitude * 100000) / 100000;
        }
        if (typeof s.longitude === 'number') {
            s.longitude = Math.round(s.longitude * 100000) / 100000;
        }

        // Compact ISO dates (2025-02-26T10:00:00Z -> 2025-02-26)
        if (typeof s.createDate === 'string' && s.createDate.includes('T')) {
            s.createDate = s.createDate.split('T')[0];
        }

        // Optimize maps array
        if (Array.isArray(s.maps)) {
            s.maps = s.maps.map(m => {
                const map = { ...m };
                if (typeof map.url === 'string' && map.url.startsWith(GITHUB_MAPS_PREFIX)) {
                    map.url = map.url.substring(GITHUB_MAPS_PREFIX.length);
                }
                if (Array.isArray(map.bounds)) {
                    map.bounds = map.bounds.map(pair =>
                        Array.isArray(pair)
                            ? pair.map(coord => typeof coord === 'number' ? Math.round(coord * 100000) / 100000 : coord)
                            : pair
                    );
                }
                if (map.free === false) {
                    delete map.free;
                }
                return map;
            });
        }

        // Remove empty arrays and falsy/empty strings
        if (Array.isArray(s.commander_Tie) && s.commander_Tie.length === 0) delete s.commander_Tie;
        if (Array.isArray(s.commander_Victor) && s.commander_Victor.length === 0) delete s.commander_Victor;
        if (Array.isArray(s.commander_Loss) && s.commander_Loss.length === 0) delete s.commander_Loss;
        if (s.more_info_link === '') delete s.more_info_link;
        if (s.site_link === '') delete s.site_link;
        if (s.youtube_link === '') delete s.youtube_link;
        if (s.special === false || (Array.isArray(s.special) && s.special.length === 0)) delete s.special;

        return s;
    });

    const formatted = JSON.stringify(optimized, null, 2);
    fs.writeFileSync(filePath, formatted, 'utf8');
    const afterSize = Buffer.byteLength(formatted);

    console.log(`sites.json: ${(beforeSize / 1024).toFixed(1)} KB -> ${(afterSize / 1024).toFixed(1)} KB (${((1 - afterSize / beforeSize) * 100).toFixed(1)}% reduction)`);
}

function optimizeEvents() {
    const filePath = path.join(DATA_DIR, 'events.json');
    if (!fs.existsSync(filePath)) return;

    const raw = fs.readFileSync(filePath, 'utf8');
    const events = JSON.parse(raw);
    const beforeSize = Buffer.byteLength(raw);

    const optimized = events.map(event => {
        const e = { ...event };
        if (e.more_info_link === '') delete e.more_info_link;
        if (e.siteId === '' || e.siteId === null) delete e.siteId;
        return e;
    });

    const formatted = JSON.stringify(optimized, null, 2);
    fs.writeFileSync(filePath, formatted, 'utf8');
    const afterSize = Buffer.byteLength(formatted);

    console.log(`events.json: ${(beforeSize / 1024).toFixed(1)} KB -> ${(afterSize / 1024).toFixed(1)} KB (${((1 - afterSize / beforeSize) * 100).toFixed(1)}% reduction)`);
}

console.log('Optimizing JSON data files...');
optimizeSites();
optimizeEvents();
console.log('Optimization complete!');
