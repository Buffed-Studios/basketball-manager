import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  TableCellsIcon,
  TrophyIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  EyeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { getSeason, getStandings, simulateGame, simulateAllRemaining } from '../services/gameApi';
import { getLeaderboard } from '../services/playerApi';
import { getTeamRoster } from '../services/teamApi';
import type { SeasonGame, StandingEntry, LeaderboardPlayerEntry, SeasonLeaderboard, Player } from '../services/types';
import type { WatchGameLocationState } from './WatchGamePage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = 'schedule' | 'standings' | 'leaderboard';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'schedule',    label: 'Schedule',    icon: CalendarDaysIcon },
  { id: 'standings',   label: 'Standings',   icon: TableCellsIcon   },
  { id: 'leaderboard', label: 'Leaderboard', icon: TrophyIcon       },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Shared: Loading / Error / Empty states
// ---------------------------------------------------------------------------

function LoadingState({ message }: Readonly<{ message: string }>) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
      <ArrowPathIcon className="h-6 w-6 animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function ErrorState({ message }: Readonly<{ message: string }>) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
        <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
        {message}
      </div>
    </div>
  );
}

function EmptyState({ message }: Readonly<{ message: string }>) {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schedule helpers
// ---------------------------------------------------------------------------

function overallColor(overall: number): string {
  if (overall >= 85) return 'text-orange-400';
  if (overall >= 75) return 'text-yellow-400';
  return 'text-gray-400';
}

// ---------------------------------------------------------------------------
// Toggle
// ---------------------------------------------------------------------------

function Toggle({ checked, onChange }: Readonly<{ checked: boolean; onChange: (v: boolean) => void }>) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
        checked ? 'bg-orange-500' : 'bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Roster table (used inside GameOverviewModal)
// ---------------------------------------------------------------------------

function RosterTable({ players }: Readonly<{ players: Player[] }>) {
  if (!players || !Array.isArray(players) || players.length === 0) {
    return <EmptyState message="No roster data available." />;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-800">
          <th className="text-left pb-2 text-xs text-gray-500 font-semibold uppercase">Player</th>
          <th className="text-center pb-2 text-xs text-gray-500 font-semibold uppercase w-12">POS</th>
          <th className="text-right pb-2 text-xs text-gray-500 font-semibold uppercase w-12">OVR</th>
          <th className="text-right pb-2 text-xs text-gray-500 font-semibold uppercase w-12">Age</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800/60">
        {[...players]
          .sort((a, b) => b.overall - a.overall)
          .map((p) => (
            <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
              <td className="py-2 text-white font-medium">{p.firstName} {p.lastName}</td>
              <td className="py-2 text-center text-gray-500 text-xs uppercase tracking-wide">{p.position}</td>
              <td className="py-2 text-right tabular-nums">
                <span className={`font-bold ${overallColor(p.overall)}`}>{p.overall}</span>
              </td>
              <td className="py-2 text-right tabular-nums text-gray-500">{p.age}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Game Overview Modal
// ---------------------------------------------------------------------------

interface GameOverviewModalProps {
  scenarioId: string;
  game: SeasonGame;
  onClose: () => void;
}

function GameOverviewModal({ scenarioId, game, onClose }: Readonly<GameOverviewModalProps>) {
  const [homeRoster, setHomeRoster] = useState<Player[]>([]);
  const [awayRoster, setAwayRoster] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getTeamRoster(scenarioId, game.homeTeamId),
      getTeamRoster(scenarioId, game.awayTeamId),
    ])
      .then(([home, away]) => {
        setHomeRoster(home?.players ?? []);
        setAwayRoster(away?.players ?? []);
      })
      .catch(() => setError('Failed to load roster data.'))
      .finally(() => setIsLoading(false));
  }, [scenarioId, game.homeTeamId, game.awayTeamId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold">{game.homeTeamName}</span>
            <span className="text-gray-600 text-sm">vs</span>
            <span className="text-white font-bold">{game.awayTeamName}</span>
            <span className="ml-1 text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
              Game {game.gameNumber}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-5">
          {isLoading && <LoadingState message="Loading rosters…" />}
          {error && <ErrorState message={error} />}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-3">{game.homeTeamName}</p>
                <RosterTable players={homeRoster} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">{game.awayTeamName}</p>
                <RosterTable players={awayRoster} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schedule tab
// ---------------------------------------------------------------------------

function ScheduleTab({
  scenarioId,
  season,
}: Readonly<{ scenarioId: string; season: number }>) {
  const navigate = useNavigate();
  const [games, setGames] = useState<SeasonGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myGamesOnly, setMyGamesOnly] = useState(false);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [simulatingAll, setSimulatingAll] = useState(false);
  const [overviewGame, setOverviewGame] = useState<SeasonGame | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getSeason(scenarioId, season)
      .then(setGames)
      .catch(() => setError('Failed to load schedule.'))
      .finally(() => setIsLoading(false));
  }, [scenarioId, season]);

  function updateGame(gameId: string, homeScore: number, awayScore: number) {
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, played: true, homeScore, awayScore } : g)),
    );
  }

  async function handleSimulate(game: SeasonGame) {
    setSimulatingId(game.id);
    try {
      const result = await simulateGame(scenarioId, game.id);
      updateGame(game.id, result.homeScore, result.awayScore);
    } catch { /* noop */ }
    setSimulatingId(null);
  }

  async function handleSimulateAll() {
    setSimulatingAll(true);
    try {
      await simulateAllRemaining(scenarioId, season);
      const refreshed = await getSeason(scenarioId, season);
      setGames(refreshed);
    } catch { /* noop */ }
    setSimulatingAll(false);
  }

  const displayed = myGamesOnly ? games.filter((g) => g.userGame) : games;
  const hasRemaining = games.some((g) => !g.played);

  if (isLoading) return <LoadingState message="Loading schedule…" />;
  if (error) return <ErrorState message={error} />;
  if (games.length === 0) return <EmptyState message="No games scheduled for this season." />;

  return (
    <>
      {overviewGame && (
        <GameOverviewModal
          scenarioId={scenarioId}
          game={overviewGame}
          onClose={() => setOverviewGame(null)}
        />
      )}

      <div className="flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-800 shrink-0">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <Toggle checked={myGamesOnly} onChange={setMyGamesOnly} />
            <span className="text-sm text-gray-400">My games only</span>
          </label>
          <button
            onClick={handleSimulateAll}
            disabled={!hasRemaining || simulatingAll}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm font-medium text-gray-300 hover:text-white hover:border-orange-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {simulatingAll ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <BoltIcon className="h-4 w-4 text-orange-400" />
            )}
            Simulate Remaining
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          {displayed.length === 0 ? (
            <EmptyState message="No games match this filter." />
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900 border-b border-gray-800 z-10">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-14">#</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Home</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">Score</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Away</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {displayed.map((game) => {
                  const isSimulating = simulatingId === game.id;
                  const homeWon = game.played && game.homeScore !== null && game.awayScore !== null && game.homeScore > game.awayScore;
                  const awayWon = game.played && game.homeScore !== null && game.awayScore !== null && game.awayScore > game.homeScore;
                  return (
                    <tr key={game.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-2.5 text-gray-600 tabular-nums text-xs">{game.gameNumber}</td>
                      <td className="px-5 py-2.5">
                        {game.played ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-700/60">Final</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-blue-300 bg-blue-500/15">Scheduled</span>
                        )}
                      </td>
                      <td className={`px-5 py-2.5 font-medium ${homeWon ? 'text-white' : 'text-gray-400'}`}>
                        {game.homeTeamName}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {game.played && game.homeScore !== null && game.awayScore !== null ? (
                          <span className="text-white font-bold tabular-nums">{game.homeScore} – {game.awayScore}</span>
                        ) : (
                          <span className="text-gray-600">vs</span>
                        )}
                      </td>
                      <td className={`px-5 py-2.5 font-medium ${awayWon ? 'text-white' : 'text-gray-400'}`}>
                        {game.awayTeamName}
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {!game.played && (
                            <>
                              <button
                                onClick={() => handleSimulate(game)}
                                disabled={isSimulating || simulatingAll}
                                title="Simulate"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-xs font-medium text-gray-300 hover:text-white hover:border-orange-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {isSimulating ? (
                                  <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <BoltIcon className="h-3.5 w-3.5 text-orange-400" />
                                )}
                                Simulate
                              </button>
                              <button
                                onClick={() => {
                                  const state: WatchGameLocationState = {
                                    scenarioId,
                                    homeTeamName: game.homeTeamName,
                                    awayTeamName: game.awayTeamName,
                                    gameNumber: game.gameNumber,
                                    season,
                                  };
                                  navigate(`/watch/${game.id}`, { state });
                                }}
                                disabled={simulatingAll}
                                title="Watch"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-xs font-medium text-gray-300 hover:text-white hover:border-green-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <EyeIcon className="h-3.5 w-3.5 text-green-400" />
                                Watch
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setOverviewGame(game)}
                            title="Overview"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-xs font-medium text-gray-300 hover:text-white hover:border-blue-500/50 transition-colors"
                          >
                            <UsersIcon className="h-3.5 w-3.5 text-blue-400" />
                            Overview
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Standings tab
// ---------------------------------------------------------------------------

function StandingsTab({
  scenarioId,
  season,
}: Readonly<{ scenarioId: string; season: number }>) {
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getStandings(scenarioId, season)
      .then((data) => setStandings(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load standings.'))
      .finally(() => setIsLoading(false));
  }, [scenarioId, season]);

  if (isLoading) return <LoadingState message="Loading standings…" />;
  if (error)     return <ErrorState message={error} />;
  if (standings.length === 0) return <EmptyState message="No standings data for this season." />;

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-900 border-b border-gray-800 z-10">
          <tr>
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-10">#</th>
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Team</th>
            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-14">GP</th>
            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-16">W</th>
            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-16">L</th>
            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">PF</th>
            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">PA</th>
            <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">DIFF</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {standings.map((entry) => {
            let diffColor = 'text-gray-500';
            if (entry.pointDifferential > 0) diffColor = 'text-green-400';
            else if (entry.pointDifferential < 0) diffColor = 'text-red-400';
            return (
              <tr
                key={entry.teamId}
                className={`hover:bg-gray-800/40 transition-colors ${entry.userTeam ? 'bg-orange-500/5' : ''}`}
              >
                <td className="px-5 py-3 text-gray-500 tabular-nums">{entry.rank}</td>
                <td className="px-5 py-3 font-medium">
                  <span className={entry.userTeam ? 'text-orange-300' : 'text-white'}>
                    {entry.teamName}
                  </span>
                  {entry.userTeam && (
                    <span className="ml-2 text-xs text-orange-500/70">You</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-gray-400">{entry.gamesPlayed}</td>
                <td className="px-5 py-3 text-right tabular-nums text-green-400 font-semibold">{entry.wins}</td>
                <td className="px-5 py-3 text-right tabular-nums text-red-400 font-semibold">{entry.losses}</td>
                <td className="px-5 py-3 text-right tabular-nums text-gray-300">{entry.pointsFor}</td>
                <td className="px-5 py-3 text-right tabular-nums text-gray-300">{entry.pointsAgainst}</td>
                <td className={`px-5 py-3 text-right tabular-nums font-medium ${diffColor}`}>
                  {entry.pointDifferential > 0 ? '+' : ''}{entry.pointDifferential}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Leaderboard tab
// ---------------------------------------------------------------------------
// Leaderboard helpers
// ---------------------------------------------------------------------------

interface LeaderboardCategory {
  key: keyof SeasonLeaderboard;
  title: string;
  statLabel: string;
  isAccuracy: boolean;
}

const LEADERBOARD_CATEGORIES: LeaderboardCategory[] = [
  { key: 'topScorers',          title: 'Top Scorers',        statLabel: 'PTS',  isAccuracy: false },
  { key: 'topRebounders',       title: 'Top Rebounders',     statLabel: 'REB',  isAccuracy: false },
  { key: 'topStealers',         title: 'Top Stealers',       statLabel: 'STL',  isAccuracy: false },
  { key: 'topBlockers',         title: 'Top Blockers',       statLabel: 'BLK',  isAccuracy: false },
  { key: 'topTwoPointAccuracy', title: '2PT Accuracy',       statLabel: '2P%',  isAccuracy: true  },
  { key: 'topFourPointAccuracy',title: '4PT Accuracy',       statLabel: '4P%',  isAccuracy: true  },
  { key: 'topFreeThrowAccuracy',title: 'Free Throw Accuracy',statLabel: 'FT%',  isAccuracy: true  },
];

function formatStat(entry: LeaderboardPlayerEntry, isAccuracy: boolean): string {
  if (isAccuracy) return `${entry.accuracy.toFixed(1)}%`;
  return String(entry.made);
}

interface LeaderboardCardProps {
  category: LeaderboardCategory;
  entries: LeaderboardPlayerEntry[];
}

function LeaderboardCard({ category, entries }: Readonly<LeaderboardCardProps>) {
  if (entries.length === 0) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">{category.title}</h3>
        <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
          {category.statLabel}
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-800/60">
        {entries.map((entry, idx) => (
          <div
            key={`${entry.firstName}-${entry.lastName}-${idx}`}
            className={`flex items-center gap-3 px-4 py-2.5 ${idx === 0 ? 'bg-orange-500/5' : 'hover:bg-gray-800/40'} transition-colors`}
          >
            {/* Rank */}
            <span className={`shrink-0 w-5 text-center text-xs font-bold tabular-nums ${idx === 0 ? 'text-orange-400' : 'text-gray-600'}`}>
              {entry.rank}
            </span>

            {/* Player info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${idx === 0 ? 'text-white' : 'text-gray-300'}`}>
                {entry.firstName} {entry.lastName}
              </p>
              <p className="text-xs text-gray-600 truncate">{entry.teamName}</p>
            </div>

            {/* GP */}
            <span className="shrink-0 text-xs text-gray-600 tabular-nums w-10 text-right">
              {entry.gamesPlayed}g
            </span>

            {/* Key stat */}
            <span className={`shrink-0 text-sm font-bold tabular-nums w-14 text-right ${idx === 0 ? 'text-orange-300' : 'text-gray-300'}`}>
              {formatStat(entry, category.isAccuracy)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Leaderboard tab
// ---------------------------------------------------------------------------

function LeaderboardTab({
  scenarioId,
  season,
}: Readonly<{ scenarioId: string; season: number }>) {
  const [data, setData] = useState<SeasonLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getLeaderboard(scenarioId, season)
      .then(setData)
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setIsLoading(false));
  }, [scenarioId, season]);

  if (isLoading) return <LoadingState message="Loading leaderboard…" />;
  if (error)     return <ErrorState message={error} />;
  if (!data)     return <EmptyState message="No player stats available for this season." />;

  return (
    <div className="overflow-auto h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
        {LEADERBOARD_CATEGORIES.map((cat) => (
          <LeaderboardCard
            key={cat.key}
            category={cat}
            entries={(data[cat.key] as LeaderboardPlayerEntry[]) ?? []}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RegularSeasonPage
// ---------------------------------------------------------------------------

interface RegularSeasonPageProps {
  scenarioId: string;
  season: number;
}

export default function RegularSeasonPage({ scenarioId, season }: Readonly<RegularSeasonPageProps>) {
  const [activeTab, setActiveTab] = useState<Tab>('schedule');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-5 py-2 border-b border-gray-800 shrink-0 bg-gray-900/50">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent'
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${activeTab === id ? 'text-orange-400' : ''}`} />
            {label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'schedule'    && <ScheduleTab    scenarioId={scenarioId} season={season} />}
        {activeTab === 'standings'   && <StandingsTab   scenarioId={scenarioId} season={season} />}
        {activeTab === 'leaderboard' && <LeaderboardTab scenarioId={scenarioId} season={season} />}
      </div>
    </div>
  );
}
