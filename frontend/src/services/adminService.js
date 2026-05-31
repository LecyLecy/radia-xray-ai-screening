import api, { getApiErrorMessage } from './api';

export const getDoctors = async () => {
  try {
    const response = await api.get('/admin/doctors');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load medical staff.'), { cause: error });
  }
};

export const searchPatientsByEmail = async (email) => {
  try {
    const response = await api.get('/admin/patients/search', {
      params: { email },
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to search patients.'), { cause: error });
  }
};

export const promotePatientToDoctor = async (payload) => {
  try {
    const response = await api.post('/admin/doctors/promote', payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to promote patient to medical staff.'), { cause: error });
  }
};
