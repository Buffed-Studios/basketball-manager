import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BoltIcon,
  SignalIcon,
  SignalSlashIcon,
} from '@heroicons/react/24/outline';
import { watchGame, skipGame } from '../services/gameApi';
import { env } from '../config/env';
import type { GameEvent } from '../services/types';

// ---------------------------------------------------------------------------
// Location state passed via navigate()
// ---------------------------------------------------------------------------

export interface WatchGameLocationState {
  scenarioId: string;
  homeTeamName: string;
  awayTeamName: string;
  gameNumber: number;
  season: number;
}

// ---------------------------------------------------------------------------
// Event type styling
// ---------------------------------------------------------------------------

function getEventStyle(type: string): { text: string; bg: string; icon: string } {
  switch (type.toUpperCase()) {
    case 'FOUR_POINT':
      return { text: 'text-purple-300', bg: 'bg-purple-500/10 border-purple-500/30', icon: '🏀' };
    case 'THREE_POINT':
      return { text: 'text-purple-300', bg: 'bg-purple-500/10 border-purple-500/30', icon: '🎯' };
    case 'TWO_POINT':
      return { text: 'text-green-300', bg: 'bg-green-500/10 border-green-500/30', icon: '✓' };
    case 'FREE_THROW':
      return { text: 'text-blue-300', bg: 'bg-blue-500/10 border-blue-500/30', icon: '•' };
    case 'TURNOVER':
      return { text: 'text-red-300', bg: 'bg-red-500/10 border-red-500/30', icon: '✕' };
    case 'FOUL':
      return { text: 'text-yellow-300', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: '⚠' };
    case 'REBOUND':
      return { text: 'text-cyan-300', bg: 'bg-cyan-500/10 border-cyan-500/30', icon: '↻' };
    case 'STEAL':
      return { text: 'text-pink-300', bg: 'bg-pink-500/10 border-pink-500/30', icon: '⚡' };
    case 'BLOCK':
      return { text: 'text-orange-300', bg: 'bg-orange-500/10 border-orange-500/30', icon: '🛡' };
    case 'GAME_OVER':
    case 'FINAL':
      return { text: 'text-white', bg: 'bg-orange-500/20 border-orange-500/50', icon: '🏆' };
    default:
      return { text: 'text-gray-400', bg: 'bg-gray-800/20 border-gray-700/30', icon: '•' };
  }
}

function formatEventType(type: string): string {
  switch (type.toUpperCase()) {
    case 'FOUR_POINT':   return '4PT';
    case 'THREE_POINT':  return '3PT';
    case 'TWO_POINT':    return '2PT';
    case 'FREE_THROW':   return 'FT';
    case 'GAME_OVER':
    case 'FINAL':        return 'FINAL';
    default:             return type.replace('_', ' ');
  }
}

// ---------------------------------------------------------------------------
// Quarter progress indicator
// ---------------------------------------------------------------------------

function pipClass(pip: number, quarter: number): string {
  if (pip < quarter) return 'bg-orange-500';
  if (pip === quarter) return 'bg-orange-400 animate-pulse';
  return 'bg-gray-700';
}

function QuarterPips({ quarter }: Readonly<{ quarter: number }>) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4].map((q) => (
        <span
          key={q}
          className={`inline-block h-1.5 w-5 rounded-full transition-colors ${pipClass(q, quarter)}`}
        />
      ))}
      {quarter > 4 && (
        <span className="text-xs text-orange-400 font-semibold ml-1">OT</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connection status badge
// ---------------------------------------------------------------------------

interface ConnectionStatusProps {
  isConnecting: boolean;
  isFinished: boolean;
  isConnected: boolean;
}

function ConnectionStatus({ isConnecting, isFinished, isConnected }: Readonly<ConnectionStatusProps>) {
  if (isConnecting) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-500">
        <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
        Connecting…
      </span>
    );
  }
  if (isFinished) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full">
        Final
      </span>
    );
  }
  if (isConnected) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-400">
        <SignalIcon className="h-3.5 w-3.5" />
        <span className="animate-pulse">Live</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <SignalSlashIcon className="h-3.5 w-3.5" />
      Disconnected
    </span>
  );
}

// ---------------------------------------------------------------------------
// Module-level STOMP helpers (keep component complexity low)
// ---------------------------------------------------------------------------

interface GameEventCallbacks {
  onScore: (homeScore: number, awayScore: number) => void;
  onClock: (quarter: number, timeRemaining: string) => void;
  onEvent: (ev: GameEvent & { _key: number }) => void;
  onFinished: () => void;
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (msg: string) => void;
  onWebSocketError: (msg: string) => void;
  isActive: () => boolean;
  nextKey: () => number;
}

function buildStompClient(topic: string, cbs: GameEventCallbacks): Client {
  // Use SockJS for WebSocket connection (backend has SockJS enabled)
  const socket = new SockJS(`${env.apiHost}/ws`);
  let subscription: ReturnType<Client['subscribe']> | null = null;

  function onMessage(msg: { body: string }) {
    if (!cbs.isActive()) return;
    try {
      const ev = JSON.parse(msg.body) as GameEvent;
      cbs.onScore(ev.homeScore, ev.awayScore);
      cbs.onClock(ev.quarter, ev.timeRemaining);
      cbs.onEvent({ ...ev, _key: cbs.nextKey() });
      if (ev.type === 'GAME_OVER' || ev.type === 'FINAL') {
        cbs.onFinished();
      }
    } catch { /* ignore malformed frames */ }
  }

  const client = new Client({
    webSocketFactory: () => socket,
    // No connectHeaders needed - backend WebSocket endpoint is open (auth happens on /watch HTTP call)
    reconnectDelay: 0, // Disable auto-reconnect to prevent duplicate subscriptions
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      cbs.onConnected();
      // Unsubscribe previous subscription if it exists (shouldn't happen with reconnectDelay: 0)
      if (subscription) {
        subscription.unsubscribe();
      }
      // Create new subscription
      subscription = client.subscribe(topic, onMessage);
    },
    onDisconnect: () => {
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }
      if (cbs.isActive()) cbs.onDisconnected();
    },
    onStompError: (frame) => {
      if (cbs.isActive()) cbs.onError(frame.headers?.['message'] ?? 'STOMP error');
    },
    onWebSocketError: (event) => {
      if (cbs.isActive()) cbs.onWebSocketError((event as ErrorEvent).message ?? 'WebSocket connection failed');
    },
  });
  client.activate();
  return client;
}

// ---------------------------------------------------------------------------
// WatchGamePage
// ---------------------------------------------------------------------------

export default function WatchGamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as Partial<WatchGameLocationState>;

  const scenarioId = state.scenarioId ?? '';
  const homeTeamName = state.homeTeamName ?? 'Home';
  const awayTeamName = state.awayTeamName ?? 'Away';
  const gameNumber = state.gameNumber ?? 0;

  const [events, setEvents] = useState<Array<GameEvent & { _key: number }>>([]);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [quarter, setQuarter] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<Client | null>(null);
  const activeRef = useRef(true);
  const eventCounterRef = useRef(0);
  const eventsBufferRef = useRef<Array<GameEvent & { _key: number }>>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll feed to bottom on new events
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
  }, [events.length]);

  useEffect(() => {
    if (!gameId || !scenarioId) {
      setError('Missing game or scenario information.');
      setIsConnecting(false);
      return;
    }

    activeRef.current = true;
    const resolvedGameId = gameId;
    const resolvedScenarioId = scenarioId;

    async function startWatch() {
      try {
        const res = await watchGame(resolvedScenarioId, resolvedGameId);
        if (!activeRef.current) return;
        setIsConnecting(false);
        clientRef.current = buildStompClient(res.topic, {
          onScore: (hs, as_) => { setHomeScore(hs); setAwayScore(as_); },
          onClock: (q, t) => { setQuarter(q); setTimeRemaining(t); },
          onEvent: (ev) => { eventsBufferRef.current.push(ev); setEvents([...eventsBufferRef.current]); },
          onFinished: () => setIsFinished(true),
          onConnected: () => setIsConnected(true),
          onDisconnected: () => setIsConnected(false),
          onError: (msg) => setError(`WebSocket error: ${msg}`),
          onWebSocketError: (msg) => setError(`WebSocket connection failed: ${msg}`),
          isActive: () => activeRef.current,
          nextKey: () => { eventCounterRef.current += 1; return eventCounterRef.current; },
        });
      } catch {
        if (activeRef.current) {
          setError('Failed to start the game stream.');
          setIsConnecting(false);
        }
      }
    }

    startWatch();

    return () => {
      activeRef.current = false;
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, gameId]);

  async function handleSkip() {
    if (!gameId || !scenarioId) return;
    setIsSkipping(true);
    try {
      const result = await skipGame(scenarioId, gameId);
      setHomeScore(result.homeScore);
      setAwayScore(result.awayScore);
      setIsFinished(true);
    } catch { /* noop */ }
    clientRef.current?.deactivate();
    setIsSkipping(false);
  }

  function handleBack() {
    navigate(-1);
  }

  // Derived display values
  const homeLeading = homeScore > awayScore;
  const awayLeading = awayScore > homeScore;

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Schedule
        </button>

        <div className="flex items-center gap-2">
          {gameNumber > 0 && (
            <span className="text-xs bg-gray-800 border border-gray-700 text-gray-500 px-2 py-0.5 rounded-full">
              Game {gameNumber}
            </span>
          )}
          <ConnectionStatus
            isConnecting={isConnecting}
            isFinished={isFinished}
            isConnected={isConnected}
          />
        </div>
      </header>

      {/* ── Scoreboard ── */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-6 shrink-0">
        {/* Quarter pips + time */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <QuarterPips quarter={quarter} />
          {timeRemaining && !isFinished && (
            <span className="text-sm font-mono text-gray-400">{timeRemaining}</span>
          )}
        </div>

        {/* Team scores */}
        <div className="flex items-center justify-center gap-0">
          {/* Home */}
          <div className="flex-1 text-center">
            <p className={`text-sm font-semibold mb-2 truncate px-4 ${homeLeading && !isConnecting ? 'text-white' : 'text-gray-500'}`}>
              {homeTeamName}
            </p>
            <p className={`text-7xl font-black tabular-nums leading-none ${homeLeading && !isConnecting ? 'text-white' : 'text-gray-500'}`}>
              {homeScore}
            </p>
          </div>

          {/* Divider */}
          <div className="px-6 text-gray-700 text-3xl font-light select-none">–</div>

          {/* Away */}
          <div className="flex-1 text-center">
            <p className={`text-sm font-semibold mb-2 truncate px-4 ${awayLeading && !isConnecting ? 'text-white' : 'text-gray-500'}`}>
              {awayTeamName}
            </p>
            <p className={`text-7xl font-black tabular-nums leading-none ${awayLeading && !isConnecting ? 'text-white' : 'text-gray-500'}`}>
              {awayScore}
            </p>
          </div>
        </div>
      </div>

      {/* ── Play-by-play feed ── */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-5 py-3">
        {isConnecting && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
            <ArrowPathIcon className="h-6 w-6 animate-spin" />
            <p className="text-sm">Starting game stream…</p>
          </div>
        )}

        {error && !isConnecting && (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          </div>
        )}

        {!isConnecting && !error && events.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-600">Waiting for first play…</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {events.map((ev) => {
            const style = getEventStyle(ev.type);
            const isFinal = ev.type === 'GAME_OVER' || ev.type === 'FINAL';
            return (
              <div
                key={ev._key}
                className={`flex items-start gap-3 py-3 px-3.5 rounded-lg border transition-all ${
                  isFinal
                    ? 'bg-orange-500/10 border-orange-500/30 shadow-lg shadow-orange-500/10'
                    : `${style.bg} border-transparent hover:border-gray-700/50`
                }`}
              >
                {/* Event type badge */}
                <div className="shrink-0 flex flex-col items-center gap-1 min-w-[3.5rem]">
                  <span className="text-lg leading-none">{style.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${style.text}`}>
                    {formatEventType(ev.type)}
                  </span>
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${style.text} ${isFinal ? 'font-bold text-base' : ''}`}>
                    {ev.description}
                  </p>
                  {!isFinal && (
                    <span className="text-[11px] text-gray-600 tabular-nums mt-1 inline-block">
                      Q{ev.quarter} {ev.timeRemaining}
                    </span>
                  )}
                </div>

                {/* Running score */}
                <div className="shrink-0 text-right">
                  <span className={`block tabular-nums font-bold ${
                    isFinal ? 'text-lg text-white' : 'text-sm text-gray-400'
                  }`}>
                    {ev.homeScore}–{ev.awayScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-800 bg-gray-900 shrink-0">
        <span className="text-xs text-gray-600">
          {events.length > 0 ? `${events.length} plays` : ''}
        </span>

        <div className="flex items-center gap-2">
          {isFinished ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
            >
              Back to Schedule
            </button>
          ) : (
            <button
              onClick={handleSkip}
              disabled={isSkipping || isConnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSkipping ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <BoltIcon className="h-4 w-4 text-orange-400" />
              )}
              Skip to End
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
