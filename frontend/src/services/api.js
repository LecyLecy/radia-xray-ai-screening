import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Otomatis menyelipkan Bearer Token ke setiap request jika token ada di localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Sesuaikan nama key yang dipakai Adin
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;