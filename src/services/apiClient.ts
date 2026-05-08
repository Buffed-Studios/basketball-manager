import axios from 'axios';
import { env } from '../config/env';
import {
  getStoredToken,
  generateServiceToken,
  storeToken,
  clearToken,
} from './authService';

const apiClient = axios.create({
  baseURL: env.apiHost,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token to every request.
// Falls back to a freshly generated service token if no stored token exists.
apiClient.interceptors.request.use(async (config) => {
  let token = getStoredToken();
  if (!token) {
    token = await generateServiceToken();
    storeToken(token);
  }
  config.headers.Authorization = `Bearer ${token}`;
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
