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

export interface LeaderboardEntry extends PlayerStats {
  firstName: string;
  lastName: string;
  position: string;
  teamName?: string;
}

export interface LeaderboardPlayerEntry {
  rank: number;
  firstName: string;
  lastName: string;
  teamName: string;
  gamesPlayed: number;
  made: number;
  attempted: number;
  accuracy: number;
}

export interface SeasonLeaderboard {
  yearNumber: number;
  topScorers: LeaderboardPlayerEntry[];
  topTwoPointAccuracy: LeaderboardPlayerEntry[];
  topFourPointAccuracy: LeaderboardPlayerEntry[];
  topRebounders: LeaderboardPlayerEntry[];
  topStealers: LeaderboardPlayerEntry[];
  topBlockers: LeaderboardPlayerEntry[];
  topFreeThrowAccuracy: LeaderboardPlayerEntry[];
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

/** Shape of each game returned inside the season schedule response. */
export interface SeasonGame {
  id: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  yearNumber: number;
  gameNumber: number;
  played: boolean;
  homeScore: number | null;
  awayScore: number | null;
  playedAt: string | null;
  userGame?: boolean;
}

export interface SeasonScheduleResponse {
  yearNumber: number;
  totalGames: number;
  games: SeasonGame[];
}

export interface StartGameRequest {
  homeTeamId: string;
  awayTeamId: string;
}

export interface WatchGameResponse {
  gameId: string;
  topic: string;
}

export interface StandingEntry {
  rank: number;
  teamId: string;
  teamName: string;
  userTeam: boolean;
  gamesPlayed: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
}

// ---------------------------------------------------------------------------
// League Events
// ---------------------------------------------------------------------------

export interface LeagueEventResponse {
  id: string;
  scenarioId: string;
  type: string;
  description: string;
  yearNumber: number;
  createdAt: string;
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
