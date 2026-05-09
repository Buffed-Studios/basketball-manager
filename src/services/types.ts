// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  username: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

export interface Scenario {
  id: string;
  name: string;
  currentYear: number;
  createdAt: string;
}

export interface CreateScenarioRequest {
  name: string;
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
}

export interface Roster {
  team: Team;
  players: Player[];
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  age: number;
  teamId?: string;
  overall: number;
}

export interface PlayerStats {
  playerId: string;
  season: number;
  gamesPlayed: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  turnoversPerGame: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
}

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------

export type GameStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Game {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  status: GameStatus;
  yearNumber: number;
}

export interface StartGameRequest {
  homeTeamId: string;
  awayTeamId: string;
}

export interface StandingEntry {
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  winPercentage: number;
  gamesBack: number;
}

// WebSocket play-by-play event pushed to /topic/game/{gameId}
export interface GameEvent {
  type: string;
  description: string;
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeRemaining: string;
  scoringPlayerId?: string;
}
