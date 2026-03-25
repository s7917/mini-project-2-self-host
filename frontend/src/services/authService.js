import api from './api';

export const loginWithGithub = () => {
  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/github`;
};

export const getMe = () => api.get('/auth/me');

export const logout = () => api.post('/auth/logout');
