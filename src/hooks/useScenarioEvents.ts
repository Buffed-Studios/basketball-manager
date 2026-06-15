import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { env } from '../config/env';
import { getStoredToken } from '../services/authService';
import { getEvents } from '../services/scenarioApi';
import type { LeagueEventResponse } from '../services/types';

function getWsUrl(): string {
  return env.apiHost.replace(/^https/, 'wss').replace(/^http/, 'ws') + '/ws';
}

export interface UseScenarioEventsResult {
  events: LeagueEventResponse[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
}

export function useScenarioEvents(scenarioId: string | null): UseScenarioEventsResult {
  const [events, setEvents] = useState<LeagueEventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!scenarioId) return;

    let active = true;

    // Step 1: fetch the last 100 events from the REST endpoint
    setIsLoading(true);
    setError(null);
    setEvents([]);

    getEvents(scenarioId)
      .then((history) => {
        if (active) setEvents(history);
      })
      .catch(() => {
        if (active) setError('Failed to load event history.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    // Step 2: subscribe via STOMP for real-time updates
    const client = new Client({
      brokerURL: getWsUrl(),
      connectHeaders: {
        Authorization: `Bearer ${getStoredToken() ?? ''}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        if (!active) return;
        setIsConnected(true);
        client.subscribe(`/topic/scenario/${scenarioId}/events`, (message) => {
          if (!active) return;
          try {
            const event = JSON.parse(message.body) as LeagueEventResponse;
            setEvents((prev) => [event, ...prev]);
          } catch {
            // ignore malformed frames
          }
        });
      },
      onDisconnect: () => {
        if (active) setIsConnected(false);
      },
      onStompError: (frame) => {
        if (active) {
          setError(`WebSocket error: ${frame.headers?.['message'] ?? 'unknown'}`);
          setIsConnected(false);
        }
      },
      onWebSocketError: () => {
        if (active) {
          setIsConnected(false);
        }
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      active = false;
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [scenarioId]);

  return { events, isLoading, isConnected, error };
}
