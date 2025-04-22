import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api',
});

export const generatePDF = (data) => API.post('/bills/generate-pdf', data, {
  responseType: 'blob'
});

export const getBills = () => API.get('/bills');