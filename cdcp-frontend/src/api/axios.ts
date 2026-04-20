import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired / invalid token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('displayName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
