import api from './api';

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Creates a cache key from URL and params
 */
const createCacheKey = (url, params = {}) => {
    const paramString = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
    return `${url}${paramString}`;
};

/**
 * Checks if cached data is still valid
 */
const isCacheValid = (cacheEntry) => {
    return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
};

/**
 * Optimized API GET request with caching
 */
export const optimizedGet = async (url, params = {}, options = {}) => {
    const { useCache = true, cacheTime = CACHE_DURATION } = options;
    const cacheKey = createCacheKey(url, params);

    // Check cache first
    if (useCache && cache.has(cacheKey)) {
        const cacheEntry = cache.get(cacheKey);
        if (isCacheValid(cacheEntry)) {
            return Promise.resolve(cacheEntry.data);
        } else {
            cache.delete(cacheKey);
        }
    }

    try {
        const response = await api.get(url, { params });

        // Cache the response
        if (useCache) {
            cache.set(cacheKey, {
                data: response,
                timestamp: Date.now()
            });
        }

        return response;
    } catch (error) {
        console.error(`API Error for ${url}:`, error);
        throw error;
    }
};

/**
 * Optimized API POST request
 */
export const optimizedPost = async (url, data, config = {}) => {
    try {
        const response = await api.post(url, data, config);

        // Clear related cache entries after successful POST
        clearRelatedCache(url);

        return response;
    } catch (error) {
        console.error(`API Error for POST ${url}:`, error);
        throw error;
    }
};

/**
 * Clear cache entries related to a URL
 */
const clearRelatedCache = (url) => {
    const keysToDelete = [];
    for (const key of cache.keys()) {
        if (key.includes(url.split('/')[1])) { // Match base endpoint
            keysToDelete.push(key);
        }
    }
    keysToDelete.forEach(key => cache.delete(key));
};

/**
 * Clear all cache
 */
export const clearCache = () => {
    cache.clear();
};

/**
 * Batch API requests
 */
export const batchRequests = async (requests) => {
    try {
        const promises = requests.map(({ url, params, options }) =>
            optimizedGet(url, params, options)
        );
        return await Promise.all(promises);
    } catch (error) {
        console.error('Batch request error:', error);
        throw error;
    }
};

/**
 * Preload data for better UX
 */
export const preloadData = async (endpoints) => {
    const promises = endpoints.map(endpoint => {
        if (typeof endpoint === 'string') {
            return optimizedGet(endpoint).catch(() => null); // Don't fail if preload fails
        } else {
            return optimizedGet(endpoint.url, endpoint.params, endpoint.options).catch(() => null);
        }
    });

    return Promise.allSettled(promises);
};