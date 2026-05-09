import axios from 'axios';
import { env } from '../config/env';
import { getStoredToken, clearToken } from './authService';

const apiClient = axios.create({
  baseURL: env.apiHost,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token to every request if one is stored (i.e. user is logged in).
// Public endpoints (login, register) are called without a token.
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear the stale token so the next request generates a fresh one.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
