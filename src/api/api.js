import axios from 'axios';

const endpoint = import.meta.env.VITE_API_URL || 'https://najot-edu.softwareengineer.uz/api/v1';

export const api = axios.create({
  baseURL: endpoint,
  timeout: 10000,
});

// Request: tokenni qo'shish
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: 401 (token eskirgan) bo'lsa — logout qilish
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.removeItem('accessToken');
      // Login sahifasiga yo'naltirish (full reload bilan)
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);
