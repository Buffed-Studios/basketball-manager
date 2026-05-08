import apiClient from './apiClient';
import { storeToken, clearToken } from './authService';
import type { User, RegisterRequest, LoginRequest, LoginResponse } from './types';

export async function register(body: RegisterRequest): Promise<void> {
  await apiClient.post('/api/auth/register', body);
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', body);
  storeToken(response.data.token);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout');
  clearToken();
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>('/api/auth/me');
  return response.data;
}
