import apiClient from './apiClient';
import type { Game, StartGameRequest, StandingEntry } from './types';

const base = (scenarioId: string) => `/api/scenarios/${scenarioId}/games`;

// ---------------------------------------------------------------------------
// Ad-hoc live game (WebSocket)
// Starts a new game between two teams. Subscribe to /topic/game/{gameId}
// via STOMP to receive GameEvent messages.
// ---------------------------------------------------------------------------

export async function startGame(scenarioId: string, body: StartGameRequest): Promise<Game> {
  const response = await apiClient.post<Game>(`${base(scenarioId)}/start`, body);
  return response.data;
}

// ---------------------------------------------------------------------------
// Season management
// ---------------------------------------------------------------------------

export async function generateSeason(scenarioId: string, yearNumber: number): Promise<Game[]> {
  const response = await apiClient.post<Game[]>(
    `${base(scenarioId)}/season/${yearNumber}/generate`,
  );
  return response.data;
}

export async function getSeason(scenarioId: string, yearNumber: number): Promise<Game[]> {
  const response = await apiClient.get<Game[]>(`${base(scenarioId)}/season/${yearNumber}`);
  return response.data;
}

export async function getStandings(
  scenarioId: string,
  yearNumber: number,
): Promise<StandingEntry[]> {
  const response = await apiClient.get<StandingEntry[]>(
    `${base(scenarioId)}/season/${yearNumber}/standings`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Individual game actions
// ---------------------------------------------------------------------------

/** Instantly simulate a scheduled game (no WebSocket). */
export async function simulateGame(scenarioId: string, gameId: string): Promise<Game> {
  const response = await apiClient.post<Game>(`${base(scenarioId)}/${gameId}/simulate`);
  return response.data;
}

/**
 * Start live WebSocket streaming of a scheduled game.
 * After calling this, subscribe to /topic/game/{gameId} via STOMP
 * to receive play-by-play GameEvent messages.
 */
export async function watchGame(scenarioId: string, gameId: string): Promise<Game> {
  const response = await apiClient.post<Game>(`${base(scenarioId)}/${gameId}/watch`);
  return response.data;
}

/** Fast-forward a currently-running watched game to its final result. */
export async function skipGame(scenarioId: string, gameId: string): Promise<Game> {
  const response = await apiClient.post<Game>(`${base(scenarioId)}/${gameId}/skip`);
  return response.data;
}
