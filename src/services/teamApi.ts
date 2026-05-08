import apiClient from './apiClient';
import type { Team, Roster } from './types';

export async function getTeams(scenarioId: string): Promise<Team[]> {
  const response = await apiClient.get<Team[]>(`/api/scenarios/${scenarioId}/teams`);
  return response.data;
}

export async function getTeamRoster(scenarioId: string, teamId: string): Promise<Roster> {
  const response = await apiClient.get<Roster>(
    `/api/scenarios/${scenarioId}/teams/${teamId}/roster`,
  );
  return response.data;
}
