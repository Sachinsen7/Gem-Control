import { BASE_URL } from "./api";

/**
 * Constructs proper image URL from backend path
 * @param {string} imagePath - The image path from backend
 * @returns {string} - Properly formatted image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log("[getImageUrl] No image path provided");
    return "/fallback-image.svg";
  }

  // Reject non-string values early
  if (typeof imagePath !== "string") {
    console.log("[getImageUrl] Non-string image path provided, using fallback");
    return "/fallback-image.svg";
  }

  const trimmed = imagePath.trim();
  console.log("[getImageUrl] Processing image path:", trimmed);

  // Ignore obvious merge conflict markers only
  if (
    trimmed.includes("<<<<<<<") ||
    trimmed.includes("=======") ||
    trimmed.includes(">>>>>>>")
  ) {
    console.log("[getImageUrl] Merge conflict markers detected in path");
    return "/fallback-image.svg";
  }

  // Allow data/blob URLs directly
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // If it's already a full Cloudinary URL, return as is
  if (
    trimmed.startsWith("https://res.cloudinary.com/") ||
    trimmed.startsWith("http://res.cloudinary.com/")
  ) {
    return trimmed;
  }

  // If it's a full HTTP/HTTPS URL, return as is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Handle relative/local paths
  let cleanPath = trimmed;
  // Remove any duplicate protocol prefixes
  cleanPath = cleanPath.replace(/^https?:\/\/[^\/]+\//, "");
  // Normalize path separators
  cleanPath = cleanPath.replace(/\\/g, "/");
  // Ensure it starts with Uploads/ when serving from backend static folder
  if (!cleanPath.startsWith("Uploads/")) {
    cleanPath = cleanPath.replace(/^.*[\\\/]Uploads[\\\/]/, "Uploads/");
  }

  const finalUrl = `${BASE_URL}/${cleanPath}`;
  console.log("[getImageUrl] Final URL:", finalUrl);
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
export { default as OptimizedImage } from "../components/OptimizedImage";
