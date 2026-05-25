import api from './api';

export const loginUser = async (email, password) => {
  try {
    // Sesuaikan endpoint '/auth/login' dengan API Contract Adin
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Gagal melakukan login";
  }
};