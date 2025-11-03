class DashboardCache {
    constructor() {
        this.cache = new Map();
        this.CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for dashboard data
    }

    generateKey(endpoint, params = {}) {
        const paramString = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
        return `${endpoint}${paramString}`;
    }

    isValid(cacheEntry) {
        return Date.now() - cacheEntry.timestamp < this.CACHE_DURATION;
    }

    get(endpoint, params = {}) {
        const key = this.generateKey(endpoint, params);
        const cacheEntry = this.cache.get(key);

        if (cacheEntry && this.isValid(cacheEntry)) {
            console.log(`[DashboardCache] Cache hit for ${endpoint}`);
            return cacheEntry.data;
        }

        return null;
    }

    set(endpoint, data, params = {}) {
        const key = this.generateKey(endpoint, params);
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        console.log(`[DashboardCache] Cached data for ${endpoint}`);
    }

    clear(endpoint = null) {
        if (endpoint) {
            const keysToDelete = [];
            for (const key of this.cache.keys()) {
                if (key.startsWith(endpoint)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.cache.delete(key));
            console.log(`[DashboardCache] Cleared cache for ${endpoint}`);
        } else {
            // Clear all cache
            this.cache.clear();
            console.log('[DashboardCache] Cleared all cache');
        }
    }

    invalidateRelated(endpoints) {
        endpoints.forEach(endpoint => this.clear(endpoint));
    }
}

export const dashboardCache = new DashboardCache();