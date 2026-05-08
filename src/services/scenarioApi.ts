import apiClient from './apiClient';
import type { Scenario, CreateScenarioRequest } from './types';

export async function getScenarios(): Promise<Scenario[]> {
  const response = await apiClient.get<Scenario[]>('/api/scenarios');
  return response.data;
}

export async function getScenario(scenarioId: string): Promise<Scenario> {
  const response = await apiClient.get<Scenario>(`/api/scenarios/${scenarioId}`);
  return response.data;
}

export async function createScenario(body: CreateScenarioRequest): Promise<Scenario> {
  const response = await apiClient.post<Scenario>('/api/scenarios', body);
  return response.data;
}

export async function deleteScenario(scenarioId: string): Promise<void> {
  await apiClient.delete(`/api/scenarios/${scenarioId}`);
}
