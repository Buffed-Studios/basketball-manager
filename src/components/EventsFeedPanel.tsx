import { useRef, useEffect } from 'react';
import {
  CalendarDaysIcon,
  SignalIcon,
  SignalSlashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useScenarioEvents } from '../hooks/useScenarioEvents';
import type { LeagueEventResponse } from '../services/types';

// ---------------------------------------------------------------------------
// Event type → badge colour mapping
// ---------------------------------------------------------------------------

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  TRADE:       { bg: 'bg-blue-500/15',   text: 'text-blue-300',   label: 'Trade' },
  SIGNING:     { bg: 'bg-green-500/15',  text: 'text-green-300',  label: 'Signing' },
  RELEASE:     { bg: 'bg-red-500/15',    text: 'text-red-300',    label: 'Release' },
  INJURY:      { bg: 'bg-yellow-500/15', text: 'text-yellow-300', label: 'Injury' },
  RETIREMENT:  { bg: 'bg-gray-500/15',   text: 'text-gray-300',   label: 'Retirement' },
  AWARD:       { bg: 'bg-purple-500/15', text: 'text-purple-300', label: 'Award' },
  GAME_RESULT: { bg: 'bg-orange-500/15', text: 'text-orange-300', label: 'Game' },
  DRAFT_PICK:  { bg: 'bg-cyan-500/15',   text: 'text-cyan-300',   label: 'Draft' },
};

function getTypeMeta(type: string) {
  return (
    TYPE_STYLES[type.toUpperCase()] ?? {
      bg: 'bg-gray-700/50',
      text: 'text-gray-400',
      label: type,
    }
  );
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Individual event row
// ---------------------------------------------------------------------------

function EventRow({ event, isNew }: Readonly<{ event: LeagueEventResponse; isNew: boolean }>) {
  const meta = getTypeMeta(event.type);

  return (
    <li
      className={`flex gap-3 px-4 py-3 border-b border-gray-800 last:border-0 transition-colors ${
        isNew ? 'bg-orange-500/5' : 'hover:bg-gray-800/40'
      }`}
    >
      {/* Type badge */}
      <span
        className={`mt-0.5 shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${meta.bg} ${meta.text}`}
      >
        {meta.label}
      </span>

      {/* Description + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 leading-snug">{event.description}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Season {event.yearNumber}
          {event.createdAt && (
            <span className="ml-2 text-gray-600">{formatTimestamp(event.createdAt)}</span>
          )}
        </p>
      </div>

      {/* "NEW" pulse indicator */}
      {isNew && (
        <span className="mt-1 shrink-0 inline-flex h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

interface EventsFeedPanelProps {
  scenarioId: string;
}

export default function EventsFeedPanel({ scenarioId }: Readonly<EventsFeedPanelProps>) {
  const { events, isLoading, isConnected, error } = useScenarioEvents(scenarioId);

  // Track which IDs arrived after the initial load so we can highlight them
  const initialLoadedRef = useRef(false);
  const knownIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoading && !initialLoadedRef.current && events.length > 0) {
      initialLoadedRef.current = true;
      events.forEach((e) => knownIdsRef.current.add(e.id));
    }
  }, [isLoading, events]);

  // Any event whose id isn't in the initial set is "new" (came via WebSocket)
  const isNew = (event: LeagueEventResponse) =>
    initialLoadedRef.current && !knownIdsRef.current.has(event.id);

  // Register newly-arrived events so they only pulse once
  useEffect(() => {
    if (initialLoadedRef.current) {
      events.forEach((e) => {
        if (!knownIdsRef.current.has(e.id)) {
          // Keep them highlighted briefly, then register as known
          setTimeout(() => knownIdsRef.current.add(e.id), 4000);
        }
      });
    }
  }, [events]);

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-orange-400 shrink-0" />
          <h2 className="text-sm font-semibold text-white">League Events</h2>
          {events.length > 0 && (
            <span className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
              {events.length}
            </span>
          )}
        </div>

        {/* Connection indicator */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <>
              <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <SignalIcon className="h-4 w-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Live</span>
            </>
          ) : (
            <>
              <SignalSlashIcon className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 mx-4 mt-3 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs shrink-0">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-gray-500">
          <ArrowPathIcon className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading event history…</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && events.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20">
            <CalendarDaysIcon className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-sm text-gray-400">No league events yet.</p>
          <p className="text-xs text-gray-600">Events will appear here as the season progresses.</p>
        </div>
      )}

      {/* Event feed */}
      {!isLoading && events.length > 0 && (
        <ul className="flex-1 overflow-y-auto divide-y divide-transparent">
          {events.map((event) => (
            <EventRow key={event.id} event={event} isNew={isNew(event)} />
          ))}
        </ul>
      )}
    </div>
  );
}
