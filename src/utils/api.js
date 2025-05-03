import axios from "axios";
import axiosRetry from "axios-retry";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (process.env.NODE_ENV === "production" ? "https://projectxapi.onrender.com" : "http://localhost:5000"),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
// Add response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshResponse = await axios.get('/api/refresh-token', {
          withCredentials: true
        });
        
        return api(originalRequest);
      } catch (refreshError) {
        window.location = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;