import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

let unauthorizedHandler = () => {};

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('finora.jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  },
);

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  const response = error.response?.data;
  if (response?.errors && Object.keys(response.errors).length) {
    return Object.values(response.errors).join(' ');
  }
  if (response?.message) return response.message;
  if (!error.response) return 'Unable to reach the server. Check that the backend is running.';
  if (error.response.status >= 500) return 'The server could not complete your request. Please try again.';
  return fallback;
}

export default api;
