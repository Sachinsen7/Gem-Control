import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { dashboardCache } from '../utils/dashboardCache';

export const useDashboardData = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [monthlySalesData, setMonthlySalesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Check cache first
            const cachedDashboard = dashboardCache.get('/getDashboardData');
            const cachedMonthlySales = dashboardCache.get('/getMonthlySalesData');

            if (cachedDashboard && cachedMonthlySales) {
                console.log('[useDashboardData] Using cached data');
                setDashboardData(cachedDashboard);
                setMonthlySalesData(cachedMonthlySales);
                setLoading(false);
                return;
            }

            console.log('[useDashboardData] Fetching fresh data');
            const startTime = performance.now();

            // Fetch both endpoints in parallel
            const [dashboardResponse, monthlySalesResponse] = await Promise.all([
                cachedDashboard ? Promise.resolve({ data: cachedDashboard }) : api.get('/getDashboardData'),
                cachedMonthlySales ? Promise.resolve({ data: cachedMonthlySales }) : api.get('/getMonthlySalesData')
            ]);

            const endTime = performance.now();
            console.log(`[useDashboardData] Fetch completed in ${endTime - startTime}ms`);

            // Cache the responses
            if (!cachedDashboard) {
                dashboardCache.set('/getDashboardData', dashboardResponse.data);
            }
            if (!cachedMonthlySales) {
                dashboardCache.set('/getMonthlySalesData', monthlySalesResponse.data);
            }

            setDashboardData(dashboardResponse.data);
            setMonthlySalesData(monthlySalesResponse.data);

        } catch (err) {
            console.error('[useDashboardData] Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshData = useCallback(() => {
        dashboardCache.clear();
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        dashboardData,
        monthlySalesData,
        loading,
        error,
        refreshData
    };
};