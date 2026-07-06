import fs from 'fs';

async function run() {
    const res = await fetch("https://fr.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&titles=Batailles_grav%C3%A9es_sur_l%27arc_de_triomphe_de_l%27%C3%89toile&format=json");
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    const wt = page.revisions[0].slots.main['*'];
    
    const lines = wt.split('\n');
    let inList = false;
    const battles = new Set();
    
    for (const line of lines) {
        if (line.includes('== Piliers ==') || line.includes('== Boucliers')) {
            inList = true;
        }
        if (line.includes('== Bas-reliefs') || line.includes('== Articles connexes')) {
            inList = false;
        }
        
        if (inList && line.startsWith('*')) {
            // Examples:
            // * [[Bataille de Valmy|Valmy]]
            // * [[Valmy]]
            // * Valmy
            let name = line.substring(1).trim();
            if (name.includes('[[')) {
                const match = name.match(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/);
                if (match) {
                    name = match[1];
                }
            } else {
                name = name.replace(/<ref.*?>.*?<\/ref>/g, '').replace(/{{.*?}}/g, '').replace(/<.*?>/g, '').trim();
            }
            name = name.split('(')[0].trim();
            if (name && name.length > 2 && !name.includes('Fichier:') && !name.includes('Image:')) {
                battles.add(name);
            }
        }
    }
    
    const arcBattlesArray = Array.from(battles);
    const sites = JSON.parse(fs.readFileSync('./src/data/sites.json', 'utf8'));
    
    const missing = [];
    for (const b of arcBattlesArray) {
        const lowerB = b.toLowerCase();
        // Remove accents for comparison
        const normalizedB = lowerB.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const found = sites.some(s => {
            const sName = (s.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const sLoc = (s.location || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const sDesc = (s.description || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            return sName.includes(normalizedB) || sLoc.includes(normalizedB) || sDesc.includes(normalizedB);
        });
        
        if (!found) {
            missing.push(b);
        }
    }
    
    fs.writeFileSync('missing_arc_battles.txt', missing.join('\n'));
    console.log('Found ' + arcBattlesArray.length + ' total battles on the Arc.');
    console.log('Found ' + missing.length + ' missing in sites.json.');
}

run();
