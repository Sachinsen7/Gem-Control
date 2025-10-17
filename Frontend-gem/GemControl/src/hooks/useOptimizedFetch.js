import { useState, useEffect, useCallback } from 'react';
import { optimizedGet, batchRequests } from '../utils/apiOptimizer';

/**
 * Custom hook for optimized data fetching
 */
export const useOptimizedFetch = (url, params = {}, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await optimizedGet(url, params, options);
            setData(Array.isArray(response.data) ? response.data : response.data || []);
        } catch (err) {
            setError(err);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [url, JSON.stringify(params), JSON.stringify(options)]);

    useEffect(() => {
        if (url) {
            fetchData();
        }
    }, [fetchData, url]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
};

/**
 * Custom hook for batch data fetching
 */
export const useBatchFetch = (requests, dependencies = []) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const responses = await batchRequests(requests);
            setData(responses.map(response =>
                Array.isArray(response.data) ? response.data : response.data || []
            ));
        } catch (err) {
            setError(err);
            setData(requests.map(() => []));
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(requests)]);

    useEffect(() => {
        if (requests.length > 0) {
            fetchData();
        }
    }, [fetchData, ...dependencies]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
};