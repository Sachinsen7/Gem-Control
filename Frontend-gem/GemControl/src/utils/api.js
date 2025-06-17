import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3002/api/admin",
  withCredentials: true, // Enable cookies
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Token in request:", token); // Debug
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
