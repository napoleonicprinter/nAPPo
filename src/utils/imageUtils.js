const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/main/public';

/**
 * Intelligent multi-tier image error handler:
 * 1. Checks if a GitHub raw URL is missing the `/images/Sites/` subfolder and fixes it.
 * 2. Falls back between local bundled assets (`/assets/images/Sites/...`) and GitHub raw remote URLs.
 * 3. Gracefully stops after trying candidate paths to avoid infinite loops.
 */
export const handleImageFallback = (e, imagePath) => {
    if (!e || !e.currentTarget || !imagePath) return;

    const img = e.currentTarget;
    const currentStep = parseInt(img.dataset.fallbackStep || '0', 10);
    const filename = imagePath.split('/').pop().split('?')[0];

    // Candidate URLs to try in order
    const candidates = [];

    // 1. If original path is a GitHub URL missing '/images/Sites/', candidate is fixed GitHub URL
    if (imagePath.includes('githubusercontent.com') && !imagePath.includes('/images/Sites/')) {
        candidates.push(`${GITHUB_RAW_BASE}/assets/images/Sites/${filename}`);
    }

    // 2. Candidate: standard GitHub raw URL with /images/Sites/
    const standardRemote = `${GITHUB_RAW_BASE}/assets/images/Sites/${filename}`;
    if (!candidates.includes(standardRemote) && imagePath !== standardRemote) {
        candidates.push(standardRemote);
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
