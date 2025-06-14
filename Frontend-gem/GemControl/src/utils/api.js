import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3002/api/admin",
  withCredentials: true, // Enable cookies
});

export default api;
