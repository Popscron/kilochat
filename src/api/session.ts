import { bootstrap, loginWithPhone, setToken } from './client';
import { connectSocket, disconnectSocket } from './socket';
import { clearInboxCache, readInboxCache } from '@/data/inbox-cache';
import { hydrateFromServer, resetInbox } from '@/data/store';
import { readStoredToken, writeStoredToken } from '@/auth/token-store';

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
    connectSocket();
    return true;
  } catch {
    if (cached) {
      connectSocket();
      return true;
    }
    setToken(null);
    await writeStoredToken(null);
    return false;
  }
}

export async function signInWithPhone(phone: string) {
  const auth = await loginWithPhone(phone);
  setToken(auth.token);
  await writeStoredToken(auth.token);
  const payload = await bootstrap();
  hydrateFromServer(payload);
  connectSocket();
}

export async function signOut() {
  disconnectSocket();
  setToken(null);
  resetInbox();
  await writeStoredToken(null);
  await clearInboxCache();
}
