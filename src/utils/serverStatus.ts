import { env } from '../config/env';

export type ApiStatus = 'checking' | 'online' | 'offline';

/**
 * Pings the unauthenticated /api/health endpoint.
 * Returns 'online' on a 2xx response, 'offline' on any error or 5xx.
 */
export async function checkApiStatus(): Promise<ApiStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${env.apiHost}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    return response.ok ? 'online' : 'offline';
  } catch {
    return 'offline';
  }
}
