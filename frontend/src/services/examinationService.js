import api from './api';

// 1. Ambil Semua Daftar Pasien (Ganti dari /patients menjadi /doctor/patients)
export const getAllPatients = async () => {
  try {
    const response = await api.get('/doctor/patients'); // Sesuai baris ke-1 kelompok Doctor di Swagger
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Gagal mengambil data pasien";
  }
};

// 2. Ambil Histori / Detail Medis Pasien Spesifik (Ganti dari /examinations/patient/:id menjadi /doctor/patients/:id)
export const getPatientExaminations = async (patientId) => {
  try {
    const response = await api.get(`/doctor/patients/${patientId}`); // Sesuai baris ke-2 kelompok Doctor di Swagger
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Gagal mengambil data rekam medis";
  }
};

// 3. Upload File Citra X-Ray Baru
export const uploadXRayImage = async (patientId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    // Sesuaikan param query/body jika Adin membutuhkan data tambahan di endpoint /doctor/examinations
    
    const response = await api.post('/doctor/examinations', formData, { // Sesuai baris ke-3 kelompok Doctor di Swagger
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Gagal mengunggah citra X-Ray";
  }
};