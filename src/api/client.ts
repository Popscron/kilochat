import { API_URL } from './config';

let token: string | null = null;

export function setToken(next: string | null) {
  token = next;
}

export function getToken() {
  return token;
}

type ApiResult<T> = T & { success: boolean; error?: string };

export async function api<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = (await response.json().catch(() => ({}))) as ApiResult<T>;
  if (!response.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export function login(phone: string, password: string) {
  return api<{ token: string; user: unknown }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export function loginWithPhone(phone: string) {
  return api<{ token: string; user: unknown }>('/api/auth/phone', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function bootstrap() {
  return api<{
    me: import('@/data/types').Profile;
    contacts: import('@/data/types').Contact[];
    chats: import('@/data/types').Chat[];
    messages: import('@/data/types').Message[];
  }>('/api/bootstrap');
}

export function sendMessage(chatId: string, text: string) {
  return api<{ message: import('@/data/types').Message }>(`/api/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ type: 'text', text }),
  });
}

export function markChatReadOnServer(chatId: string) {
  return api(`/api/chats/${chatId}`, {
    method: 'PATCH',
    body: JSON.stringify({ unreadCount: 0 }),
  });
}

export function updateMe(patch: { name?: string; avatar?: string; about?: string; note?: string }) {
  return api<{ user: import('@/data/types').Profile }>('/api/me', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}
