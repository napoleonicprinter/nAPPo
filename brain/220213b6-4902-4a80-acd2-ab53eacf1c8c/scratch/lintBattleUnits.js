const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('d:\\nAPPo_trails\\src\\data\\battleUnits.json', 'utf8'));
    console.log("JSON is valid");
    const ids = new Set();
    data.forEach(battle => {
        if (ids.has(battle.id)) console.error("Duplicate battle id:", battle.id);
        ids.add(battle.id);
        const unitIds = new Set();
        battle.units.forEach(unit => {
            if (unitIds.has(unit.id)) console.error("Duplicate unit id in battle", battle.id, ":", unit.id);
            unitIds.add(unit.id);
        });
    });
} catch (e) {
    console.error("JSON Error:", e.message);
}
