const GITHUB_RAW_PUBLIC = 'https://raw.githubusercontent.com/napoleonicprinter/nAPPo/main/public';

/**
 * Fallback image error handler that points to GitHub raw assets
 * when a dynamically synced image is not yet bundled in the local APK.
 */
export const handleImageFallback = (e, imagePath) => {
    if (!e || !e.currentTarget || !imagePath) return;
    
    // Prevent infinite loop if GitHub also doesn't have the image
    if (e.currentTarget.dataset.fallbackTried === 'true') {
        return;
    }
    e.currentTarget.dataset.fallbackTried = 'true';

    const fallbackUrl = imagePath.startsWith('http')
        ? imagePath
        : `${GITHUB_RAW_PUBLIC}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;

    e.currentTarget.src = fallbackUrl;
};
