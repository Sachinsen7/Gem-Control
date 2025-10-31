import axios from "axios";
import { performanceMonitor } from "./performanceMonitor";

const api = axios.create({
  baseURL: "http://localhost:3002/api/admin",
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Start performance monitoring
  const requestLabel = `${config.method?.toUpperCase()} ${config.url}`;
  performanceMonitor.startTiming(requestLabel);
  config.metadata = { startTime: Date.now(), label: requestLabel };

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Note: Accept-Encoding is automatically handled by the browser

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // End performance monitoring
    if (response.config.metadata) {
      performanceMonitor.endTiming(response.config.metadata.label);
    }
    return response;
  },
  (error) => {
    // End performance monitoring on error
    if (error.config?.metadata) {
      performanceMonitor.endTiming(error.config.metadata.label);
    }

    // Enhanced error logging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    return Promise.reject(error);
  }
);

export const BASE_URL = "http://localhost:3002";
export default api;
