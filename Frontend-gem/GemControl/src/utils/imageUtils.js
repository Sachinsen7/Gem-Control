import { BASE_URL } from "./api";

/**
 * Constructs proper image URL from backend path
 * @param {string} imagePath - The image path from backend
 * @returns {string} - Properly formatted image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log('[getImageUrl] No image path provided');
    return "/fallback-image.png";
  }

  console.log('[getImageUrl] Processing image path:', imagePath);

  // If it's already a full Cloudinary URL, return as is
  if (imagePath.startsWith('https://res.cloudinary.com/') ||
    imagePath.startsWith('http://res.cloudinary.com/')) {
    console.log('[getImageUrl] Cloudinary URL detected:', imagePath);
    return imagePath;
  }

  // If it's a full HTTP/HTTPS URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('[getImageUrl] Full URL detected:', imagePath);
    return imagePath;
  }

  // Handle relative paths - could be from local server or Cloudinary
  let cleanPath = imagePath;

  // Remove any duplicate protocol prefixes
  cleanPath = cleanPath.replace(/^https?:\/\/[^\/]+\//, "");

  // Normalize path separators
  cleanPath = cleanPath.replace(/\\/g, "/");

  // For local server paths, ensure they start with Uploads/
  if (!cleanPath.startsWith("Uploads/") && !cleanPath.includes('cloudinary')) {
    cleanPath = cleanPath.replace(/^.*[\\\/]Uploads[\\\/]/, "Uploads/");
  }

  const finalUrl = `${BASE_URL}/${cleanPath}`;
  console.log('[getImageUrl] Final URL:', finalUrl);
  return finalUrl;
};

/**
 * Preloads an image to check if it exists
 * @param {string} src - Image source URL
 * @returns {Promise<boolean>} - Promise that resolves to true if image loads
 */
export const preloadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    let resolved = false;

    img.onload = () => {
      if (!resolved) {
        resolved = true;
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    };

    // Add timeout to prevent hanging
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, 10000); // 10 second timeout

    img.src = src;
  });
};

// Export the optimized image component
export { default as OptimizedImage } from '../components/OptimizedImage';