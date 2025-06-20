import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3002/api/admin",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Token in request:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const BASE_URL = "http://localhost:3002"; // For static file URLs
export default api;
