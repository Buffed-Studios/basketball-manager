import apiClient from './apiClient';

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

export interface Scenario {
  id: number | string;
  [key: string]: unknown;
}

export async function fetchScenarios(): Promise<Scenario[]> {
  const response = await apiClient.get<Scenario[]>('/api/scenarios');
  return response.data;
}

export async function fetchScenario(id: number | string): Promise<Scenario> {
  const response = await apiClient.get<Scenario>(`/api/scenarios/${id}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// Auth  (login endpoint — if the server issues tokens via credentials)
// ---------------------------------------------------------------------------

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

/**
 * Login with credentials. Stores the returned JWT so all subsequent
 * apiClient calls are automatically authenticated.
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { storeToken } = await import('./authService');
  const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
  storeToken(response.data.token);
  return response.data;
}

export { clearToken as logout } from './authService';
