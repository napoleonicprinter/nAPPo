const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/main/public';
const GITHUB_RAW_REFS_BASE = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/refs/heads/main/public';

/**
 * Resolves site image filename or URL to a local bundled asset path first,
 * or preserves external URLs (Wikimedia, museums, etc.)
 */
export const resolveSiteImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        // If it's a GitHub raw URL to our repo, use local bundled asset for instant offline loading
        if (imagePath.includes('githubusercontent.com') && imagePath.includes('/napoleonicprinter/nAPPo/')) {
            const filename = imagePath.split('/').pop().split('?')[0];
            return `/assets/images/Sites/${filename}`;
        }
        return imagePath;
    }
    if (imagePath.startsWith('/')) {
        return imagePath;
    }
    return `/assets/images/Sites/${imagePath}`;
};

/**
 * Resolves battle map SVG filename or URL to a local bundled asset path first
 */
export const resolveMapUrl = (mapPath) => {
    if (!mapPath) return '';
    if (mapPath.startsWith('http://') || mapPath.startsWith('https://')) {
        if (mapPath.includes('githubusercontent.com') && mapPath.includes('/napoleonicprinter/nAPPo/')) {
            const filename = mapPath.split('/').pop().split('?')[0];
            return `/assets/images/Maps/${filename}`;
        }
        return mapPath;
    }
    if (mapPath.startsWith('/')) {
        return mapPath;
    }
    return `/assets/images/Maps/${mapPath}`;
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
    const localSitePath = `/assets/images/Sites/${filename}`;
    if (img.src !== localSitePath && !img.src.endsWith(localSitePath)) {
        candidates.push(localSitePath);
    }

    // 4. Candidate: local root assets path
    const localRootPath = `/assets/${filename}`;
    if (img.src !== localRootPath && !img.src.endsWith(localRootPath)) {
        candidates.push(localRootPath);
    }

    if (currentStep < candidates.length) {
        const nextUrl = candidates[currentStep];
        img.dataset.fallbackStep = String(currentStep + 1);
        img.src = nextUrl;
    }
};

