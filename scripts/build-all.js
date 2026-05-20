import { execSync } from 'child_process';
import fs from 'fs';

// Clean old folders
if (fs.existsSync('dist-standard')) {
    fs.rmSync('dist-standard', { recursive: true, force: true });
}
if (fs.existsSync('dist-battle')) {
    fs.rmSync('dist-battle', { recursive: true, force: true });
}

console.log('Building Standard version...');
execSync('npm run build:standard', { stdio: 'inherit' });
if (fs.existsSync('dist')) {
    fs.renameSync('dist', 'dist-standard');
    console.log('✔ Standard version built in "dist-standard"\n');
}

console.log('Building Battle version...');
execSync('npm run build:battle', { stdio: 'inherit' });
if (fs.existsSync('dist')) {
    fs.renameSync('dist', 'dist-battle');
    console.log('✔ Battle version built in "dist-battle"\n');
}

console.log('Both builds are ready! 🎉');
console.log('- Standard version folder: "dist-standard"');
console.log('- Battle version folder:   "dist-battle"');
