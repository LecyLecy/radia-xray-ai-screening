import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hasToken = Boolean(localStorage.getItem('access_token'));
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && hasToken && !isLoginRequest) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      window.location.assign('/login');
    }

    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (error, fallbackMessage) => {
  const detail = error.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(', ');
  }

  return detail || error.message || fallbackMessage;
};

export default api;
