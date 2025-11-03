

/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
    }

    /**
     * Start timing an operation
     */
    startTiming(label) {
        this.metrics.set(label, {
            startTime: performance.now(),
            endTime: null,
            duration: null
        });
    }

    /**
     * End timing an operation
     */
    endTiming(label) {
        const metric = this.metrics.get(label);
        if (metric) {
            metric.endTime = performance.now();
            metric.duration = metric.endTime - metric.startTime;

            // Log slow operations (> 1 second)
            if (metric.duration > 1000) {
                console.warn(`Slow operation detected: ${label} took ${metric.duration.toFixed(2)}ms`);
            }

            return metric.duration;
        }
        return null;
    }

    /**
     * Get timing for an operation
     */
    getTiming(label) {
        const metric = this.metrics.get(label);
        return metric ? metric.duration : null;
    }

    /**
     * Get all metrics
     */
    getAllMetrics() {
        const result = {};
        for (const [label, metric] of this.metrics.entries()) {
            result[label] = {
                duration: metric.duration,
                startTime: metric.startTime,
                endTime: metric.endTime
            };
        }
        return result;
    }

    /**
     * Clear all metrics
     */
    clear() {
        this.metrics.clear();
    }

    /**
     * Monitor API call performance
     */
    monitorApiCall(label, apiCall) {
        return async (...args) => {
            this.startTiming(label);
            try {
                const result = await apiCall(...args);
                this.endTiming(label);
                return result;
            } catch (error) {
                this.endTiming(label);
                throw error;
            }
        };
    }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * HOC for monitoring component render performance
 */
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
    return function MonitoredComponent(props) {
        const startTime = performance.now();

        React.useEffect(() => {
            const endTime = performance.now();
            const renderTime = endTime - startTime;

            if (renderTime > 100) { // Log renders > 100ms
                console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
            }
        });

        return React.createElement(WrappedComponent, props);
    };
};