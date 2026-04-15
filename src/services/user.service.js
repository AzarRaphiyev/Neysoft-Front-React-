import api from '../utils/api';

export const getUsers = async () => {
  const response = await api.get('/auth/users');
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const changeUserPassword = async (userId, newPassword) => {
  // Use PUT or POST depending on backend standard, usually PUT or PATCH for a specific property
  const response = await api.put(`/auth/users/${userId}/password`, { password: newPassword });
  return response.data;
};
