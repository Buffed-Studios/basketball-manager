import apiClient from './apiClient';
import type { Player, PlayerStats } from './types';

export async function getFreeAgents(scenarioId: string): Promise<Player[]> {
  const response = await apiClient.get<Player[]>(`/api/scenarios/${scenarioId}/free-agents`);
  return response.data;
}

export async function getPlayer(scenarioId: string, playerId: string): Promise<Player> {
  const response = await apiClient.get<Player>(
    `/api/scenarios/${scenarioId}/players/${playerId}`,
  );
  return response.data;
}

export async function getPlayerStats(scenarioId: string, playerId: string): Promise<PlayerStats> {
  const response = await apiClient.get<PlayerStats>(
    `/api/scenarios/${scenarioId}/players/${playerId}/stats`,
  );
  return response.data;
}
