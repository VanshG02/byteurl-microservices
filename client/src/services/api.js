// src/services/api.js
import axios from "axios";

const API_BASE = "http://localhost:8080";
// const AUTH_BASE_URL = "http://localhost:5001";
// const SHORTENER_BASE_URL = "http://localhost:5002";

// Auth service via gateway
export const authClient = axios.create({
  baseURL: `${API_BASE}/auth`,
});

export const shortenerClient = axios.create({
  baseURL: `${API_BASE}/api`,
});
// Read token from localStorage
// function getToken() {
//   return localStorage.getItem("authToken");
// }

// Axios for auth service
// export const authClient = axios.create({
//   baseURL: AUTH_BASE_URL,
// });

// Axios for shortener service
// export const shortenerClient = axios.create({
//   baseURL: SHORTENER_BASE_URL,
// });

// Attach token automatically to shortener requests
shortenerClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
});
