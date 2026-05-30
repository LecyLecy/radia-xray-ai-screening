import api, { getApiErrorMessage } from './api';

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const session = response.data;

    localStorage.setItem('access_token', session.access_token);
    localStorage.setItem('refresh_token', session.refresh_token);
    localStorage.setItem('userRole', session.user.role);
    localStorage.setItem('userId', session.user.user_id);
    localStorage.setItem('userEmail', session.user.email);

    return session;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Login failed.'), { cause: error });
  }
};

export const registerPatient = async (payload) => {
  try {
    const response = await api.post('/auth/register/patient', payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Patient registration failed.'), { cause: error });
  }
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
};
