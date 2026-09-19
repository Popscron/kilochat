import {
  bootstrap,
  loginWithPhone,
  registerThisDevice,
  setSessionId,
  setToken,
} from './client';
import { connectSocket, disconnectSocket } from './socket';
import { clearInboxCache, readInboxCache } from '@/data/inbox-cache';
import { hydrateFromServer, resetInbox } from '@/data/store';
import { clearProfileTabIcon } from '@/profile/tab-avatar';
import { readStoredToken, writeStoredToken } from '@/auth/token-store';

async function rememberAuth(token: string, sessionId?: string | null) {
  setToken(token);
  setSessionId(sessionId ?? null);
  await writeStoredToken(token);
}

async function attachThisDevice() {
  try {
    const result = await registerThisDevice();
    if (result.token) {
      await rememberAuth(result.token, result.sessionId);
      connectSocket();
    } else if (result.sessionId) setSessionId(result.sessionId);
  } catch {
    // Listing still works for older sessions.
  }
}

export async function syncThisDevice() {
  await attachThisDevice();
}

export async function restoreSession(onCached?: () => void) {
  const token = await readStoredToken();
  if (!token) return false;
  setToken(token);
  const cached = await readInboxCache();
  if (cached) {
    hydrateFromServer(cached);
    onCached?.();
  }
  try {
    const payload = await bootstrap();
    hydrateFromServer(payload);
    await attachThisDevice();
    connectSocket();
    return true;
  } catch {
    if (cached) {
      connectSocket();
      return true;
    }
    setToken(null);
    setSessionId(null);
    await writeStoredToken(null);
    return false;
  }
}

export async function signInWithPhone(phone: string) {
  const auth = await loginWithPhone(phone);
  await rememberAuth(auth.token, auth.sessionId);
  const payload = await bootstrap();
  hydrateFromServer(payload);
  connectSocket();
}

export async function signOut() {
  disconnectSocket();
  setToken(null);
  setSessionId(null);
  resetInbox();
  clearProfileTabIcon();
  await writeStoredToken(null);
  await clearInboxCache();
}
