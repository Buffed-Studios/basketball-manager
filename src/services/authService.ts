import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env';

const TOKEN_STORAGE_KEY = 'bm_auth_token';

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(env.jwtSecretKey);
}

/**
 * Generates a signed JWT using the shared VITE_JWT_SECRET_KEY.
 * Used for programmatic / service-account style access.
 */
export async function generateServiceToken(subject: string = 'client'): Promise<string> {
  return new SignJWT({ sub: subject })
    .setProtectedHeader({ alg: 'HS384' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecretKey());
}

/** Persist a token (e.g. returned from a login endpoint) to sessionStorage. */
export function storeToken(token: string): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/** Remove the stored token (logout). */
export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

/** Return the stored token, or null if none exists. */
export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Verify and decode a JWT. Returns the payload or null if invalid / expired.
 */
export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ['HS384'] });
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Returns true if a stored token exists and is not expired.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload !== null;
}
