import { Capacitor } from '@capacitor/core';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/main/public';
const GITHUB_RAW_REFS_BASE = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/refs/heads/main/public';

/**
 * Resolves site image filename or URL.
 * - On Native platforms (Android): uses local bundled assets for instant offline loading.
 * - On Web (browsers): fetches directly from GitHub Raw CDN so you do not need to host images on your server.
 * - Preserves external URLs (Wikimedia, museums, etc.)
 */
export const resolveSiteImageUrl = (imagePath) => {
    if (!imagePath) return '';
    // Preserve external URLs (Wikimedia, museums, etc.) that are not pointing to our GitHub repo
    if ((imagePath.startsWith('http://') || imagePath.startsWith('https://')) &&
        !imagePath.includes('githubusercontent.com/napoleonicprinter/nAPPo/')) {
        return imagePath;
    }

    const filename = imagePath.split('/').pop().split('?')[0];

    // If native Capacitor app (Android APK), use bundled asset for offline access
    if (Capacitor.isNativePlatform()) {
        return `./assets/images/Sites/${filename}`;
    }

    // On Web: fetch directly from GitHub Raw
    return `${GITHUB_RAW_BASE}/assets/images/Sites/${filename}`;
};

/**
 * Resolves battle map SVG filename or URL.
 * - On Native: uses local bundled maps.
 * - On Web: fetches directly from GitHub Raw.
 */
export const resolveMapUrl = (mapPath) => {
    if (!mapPath) return '';
    if ((mapPath.startsWith('http://') || mapPath.startsWith('https://')) &&
        !mapPath.includes('githubusercontent.com/napoleonicprinter/nAPPo/')) {
        return mapPath;
    }

    const filename = mapPath.split('/').pop().split('?')[0];

    // If native Capacitor app (Android APK), use bundled asset for offline access
    if (Capacitor.isNativePlatform()) {
        return `./assets/images/Maps/${filename}`;
    }

    // On Web: fetch directly from GitHub Raw
    return `${GITHUB_RAW_BASE}/assets/images/Maps/${filename}`;
};

/**
 * Intelligent multi-tier image error handler:
 * 1. If local asset fails (e.g. newly synced site), try GitHub raw remote URL.
 * 2. Try secondary GitHub raw URL with refs/heads/.
 * 3. Try local root assets folder.
 * 4. Gracefully stops after trying candidate paths to avoid infinite loops.
 */
export const handleImageFallback = (e, imagePath) => {
    if (!e || !e.currentTarget || !imagePath) return;

    const img = e.currentTarget;
    const currentStep = parseInt(img.dataset.fallbackStep || '0', 10);
    const filename = imagePath.split('/').pop().split('?')[0];

    // Candidate URLs to try in order
    const candidates = [];

    // 1. Candidate: standard GitHub raw URL with /images/Sites/
    const standardRemote = `${GITHUB_RAW_BASE}/assets/images/Sites/${filename}`;
    if (img.src !== standardRemote) {
        candidates.push(standardRemote);
    }

    // 2. Candidate: refs/heads GitHub raw URL
    const refsRemote = `${GITHUB_RAW_REFS_BASE}/assets/images/Sites/${filename}`;
    if (!candidates.includes(refsRemote) && img.src !== refsRemote) {
        candidates.push(refsRemote);
    }

    // 3. Candidate: local bundled asset path
    const localSitePath = `./assets/images/Sites/${filename}`;
    if (img.src !== localSitePath && !img.src.endsWith(localSitePath.slice(1))) {
        candidates.push(localSitePath);
    }

    // 4. Candidate: local root assets path
    const localRootPath = `./assets/${filename}`;
    if (img.src !== localRootPath && !img.src.endsWith(localRootPath.slice(1))) {
        candidates.push(localRootPath);
    }

    if (currentStep < candidates.length) {
        const nextUrl = candidates[currentStep];
        img.dataset.fallbackStep = String(currentStep + 1);
        img.src = nextUrl;
    }
};

