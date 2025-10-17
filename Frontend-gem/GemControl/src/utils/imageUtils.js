import { BASE_URL } from './api';

/**
 * Constructs proper image URL from backend path
 * @param {string} imagePath - The image path from backend
 * @returns {string} - Properly formatted image URL
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return '/fallback-image.png';

    // Remove any duplicate protocol prefixes
    let cleanPath = imagePath.replace(/^https?:\/\/[^\/]+\//, '');

    // Ensure path starts with Uploads/
    if (!cleanPath.startsWith('Uploads/')) {
        cleanPath = cleanPath.replace(/^.*[\\\/]Uploads[\\\/]/, 'Uploads/');
    }

    // Normalize path separators
    cleanPath = cleanPath.replace(/\\/g, '/');

    return `${BASE_URL}/${cleanPath}`;
};

/**
 * Preloads an image to check if it exists
 * @param {string} src - Image source URL
 * @returns {Promise<boolean>} - Promise that resolves to true if image loads
 */
export const preloadImage = (src) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
    });
};

/**
 * Creates an optimized image component with proper error handling
 * @param {Object} props - Image props
 * @returns {JSX.Element} - Optimized image component
 */
export const OptimizedImage = ({
    src,
    alt,
    style,
    onError,
    fallbackSrc = '/fallback-image.png',
    ...props
}) => {
    const handleError = (e) => {
        if (e.target.src !== fallbackSrc) {
            e.target.src = fallbackSrc;
        }
        if (onError) onError(e);
    };

    const imageUrl = getImageUrl(src);

    return (
        <img
            src={imageUrl}
            alt={alt}
            style={style}
            onError={handleError}
            loading="lazy"
            {...props}
        />
    );
};// Expor

export { default as OptimizedImage } from '../components/OptimizedImage';