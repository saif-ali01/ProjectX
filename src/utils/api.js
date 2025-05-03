import axios from "axios";
import axiosRetry from "axios-retry";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (process.env.NODE_ENV === "production" ? "https://projectxapi.onrender.com" : "http://localhost:5000"),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Configure axios-retry
axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000, // Exponential backoff: 1s, 2s, 3s
  retryCondition: (error) => {
    return error.response?.status === 429 || error.response?.status >= 500;
  },
});

export { api };