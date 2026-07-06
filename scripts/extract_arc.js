import fs from 'fs';

async function run() {
    const wt = fs.readFileSync('wt.txt', 'utf8');
    
    const lines = wt.split('\n');
    let battles = [];
    let inTable = false;
    for (const line of lines) {
        if (line.includes('== Grandes arcades ==') || line.includes('== Petites arcades ==') || line.includes('== Boucliers de l\'attique ==') || line.includes('== Bas-reliefs ==')) {
            inTable = true;
        }
        if (line.includes('== Liste alphabétique ==')) {
            inTable = false;
        }
        
        if (inTable && line.startsWith('|') && !line.startsWith('|-') && !line.startsWith('|}') && !line.includes('•')) {
            let l = line.substring(1).trim();
            let name = l;
            
            // Matches [[Link|DISPLAY]] -> we want DISPLAY
            if (l.includes('[[')) {
                const m = l.match(/\[\[[^|\]]+\|([^\]]+)\]\]/);
                if (m) {
                    name = m[1];
                } else {
                    const m2 = l.match(/\[\[([^\]]+)\]\]/);
                    if (m2) name = m2[1];
                }
            } else if (l.includes('{{Lien')) {
                const m = l.match(/texte=([^|}]+)/);
                if (m) name = m[1];
            } else {
                name = l.replace(/<.*?>/g, '').trim();
            }
            
            // Clean up
            name = name.replace(/{{.*?}}/g, '').replace(/<.*?>/g, '').trim();
            
            if (name && name.length > 2 && !name.includes('Fichier:') && !name.includes('align=')) {
                battles.push(name);
            }
        }
    }
    
    battles = Array.from(new Set(battles));
    
    const sites = JSON.parse(fs.readFileSync('./src/data/sites.json', 'utf8'));
    
    const missing = [];
    let foundCount = 0;
    for (const b of battles) {
        // e.g. "LILLE" -> "lille"
        // some might be "TOURCOING"
        let lowerB = b.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        
        // Remove 'st ' or 'ste ' or 'le ' or 'la ' from the beginning for better matching
        lowerB = lowerB.replace(/^(le |la |les |l'|st |ste |sainte |saint |san )/, '');
        
        const found = sites.some(s => {
            const sName = (s.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const sLoc = (s.location || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const sDesc = (s.description || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            // Since arc has single word, we check if it is included
            return sName.includes(lowerB) || sLoc.includes(lowerB) || sDesc.includes(lowerB);
        });
        
        if (!found) {
            missing.push(b);
        } else {
            foundCount++;
        }
    }
    
    fs.writeFileSync('missing_arc_battles.txt', missing.join('\n'));
    console.log('Found ' + battles.length + ' total battles on the Arc.');
    console.log('Matched ' + foundCount + ' battles in sites.json.');
    console.log('Found ' + missing.length + ' missing in sites.json.');
}

run();
