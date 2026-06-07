// frontend/src/services/api.js
import axios from 'axios';

// Update this URL if your local folder name in XAMPP htdocs differs
export const API_BASE_URL = 'http://localhost/backend';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor to attach Authorization Bearer token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Handle multipart form-data requests automatically if FormData is passed
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
