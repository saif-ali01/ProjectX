import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (process.env.NODE_ENV === "production" ? "https://projectxapi.onrender.com" : "http://localhost:5000"),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export { api };