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
    throw new Error(getApiErrorMessage(error, 'Failed to create medical staff.'), { cause: error });
  }
};

export const updateDoctor = async (doctorId, payload) => {
  try {
    const response = await api.patch(`/admin/doctors/${doctorId}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update medical staff.'), { cause: error });
  }
};

export const deleteDoctor = async (doctorId) => {
  try {
    await api.delete(`/admin/doctors/${doctorId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete medical staff.'), { cause: error });
  }
};

export const getPatients = async () => {
  try {
    const response = await api.get('/admin/patients');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load patients.'), { cause: error });
  }
};

export const createPatient = async (payload) => {
  try {
    const response = await api.post('/admin/patients', payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to create patient.'), { cause: error });
  }
};

export const updatePatient = async (patientId, payload) => {
  try {
    const response = await api.patch(`/admin/patients/${patientId}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update patient.'), { cause: error });
  }
};

export const deletePatient = async (patientId) => {
  try {
    await api.delete(`/admin/patients/${patientId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete patient.'), { cause: error });
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
