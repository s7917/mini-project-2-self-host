import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error;
    const isAuthFailure = status === 401 || (status === 400 && message === 'Invalid token.');

    if (isAuthFailure) {
      localStorage.removeItem('token');

      if (window.location.pathname !== '/') {
        window.location.assign('/');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
