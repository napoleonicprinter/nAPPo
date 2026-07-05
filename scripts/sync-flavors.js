import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const androidAppDir = path.join(rootDir, 'android', 'app');
const androidSrcDir = path.join(androidAppDir, 'src');

const distStandard = path.join(rootDir, 'dist-standard');
const distBattle = path.join(rootDir, 'dist-battle');

const flavorFreeAssets = path.join(androidSrcDir, 'free', 'assets', 'public');
const flavorPaidAssets = path.join(androidSrcDir, 'paid', 'assets', 'public');
const mainAssets = path.join(androidSrcDir, 'main', 'assets', 'public');

console.log('=============================================');
console.log('Sincronizando Archivos Web a Flavors de Android');
console.log('=============================================\n');

// 0. Asegurar que exista la carpeta webDir para que cap sync no falle
const configPath = path.join(rootDir, 'capacitor.config.json');
let webDirName = 'dist';
if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.webDir) webDirName = config.webDir;
}
const webDirPath = path.join(rootDir, webDirName);
if (!fs.existsSync(webDirPath)) {
    fs.mkdirSync(webDirPath, { recursive: true });
    fs.writeFileSync(path.join(webDirPath, 'index.html'), '<html><body>Dummy</body></html>');
}

// 1. Sincronizar Capacitor (esto copiará a main/assets/public)
console.log('1. Ejecutando npx cap sync android para actualizar plugins...');
try {
    execSync('npx cap sync android', { stdio: 'inherit', cwd: rootDir });
} catch (e) {
    console.error('Error durante cap sync:', e.message);
    process.exit(1);
}

// 2. Eliminar la carpeta compartida main/assets/public para evitar duplicados
console.log('\n2. Limpiando carpeta pública compartida (main)...');
if (fs.existsSync(mainAssets)) {
    fs.rmSync(mainAssets, { recursive: true, force: true });
    console.log('   ✓ main/assets/public eliminada.');
}

// Helper para copiar carpetas recursivamente
function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
    
    const items = fs.readdirSync(from);
    for (const item of items) {
        const fromPath = path.join(from, item);
        const toPath = path.join(to, item);
        const stat = fs.statSync(fromPath);
        
        if (stat.isDirectory()) {
            copyFolderSync(fromPath, toPath);
        } else {
            fs.copyFileSync(fromPath, toPath);
        }
    }
}

// 3. Copiar a flavor Free (Standard)
console.log('\n3. Copiando archivos de la versión Standard al flavor "free"...');
if (!fs.existsSync(distStandard)) {
    console.error(`   ❌ No se encontró ${distStandard}. ¡Ejecuta npm run build:all primero!`);
    process.exit(1);
}
// Limpiar e inyectar
if (fs.existsSync(flavorFreeAssets)) fs.rmSync(flavorFreeAssets, { recursive: true, force: true });
copyFolderSync(distStandard, flavorFreeAssets);
console.log('   ✓ Archivos copiados a free/assets/public');

// 4. Copiar a flavor Paid (Battle)
console.log('\n4. Copiando archivos de la versión de Batallas al flavor "paid"...');
if (!fs.existsSync(distBattle)) {
    console.error(`   ❌ No se encontró ${distBattle}. ¡Ejecuta npm run build:all primero!`);
    process.exit(1);
}
// Limpiar e inyectar
if (fs.existsSync(flavorPaidAssets)) fs.rmSync(flavorPaidAssets, { recursive: true, force: true });
copyFolderSync(distBattle, flavorPaidAssets);
console.log('   ✓ Archivos copiados a paid/assets/public');

console.log('\n✅ ¡Todo listo!');
console.log('Ahora puedes abrir Android Studio y compilar los bundles para "freeRelease" y "paidRelease".');
