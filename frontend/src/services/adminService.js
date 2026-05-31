import api, { getApiErrorMessage } from './api';

export const getDoctors = async () => {
  try {
    const response = await api.get('/admin/doctors');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load medical staff.'), { cause: error });
  }
};

export const createDoctor = async (payload) => {
  try {
    const response = await api.post('/admin/doctors', payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create medical staff account.'), { cause: error });
  }
};
