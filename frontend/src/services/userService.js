import api, { getApiErrorMessage } from './api';

export const getCurrentUserProfile = async () => {
  try {
    const response = await api.get('/users/me/profile');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load user profile.'), { cause: error });
  }
};
