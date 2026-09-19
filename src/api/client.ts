import { getDevicePayload } from '@/auth/device';
import { API_URL } from './config';

let token: string | null = null;
let sessionId: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setToken(next: string | null) {
  token = next;
}

export function getToken() {
  return token;
}

export function setSessionId(next: string | null) {
  sessionId = next;
}

export function getSessionId() {
  return sessionId;
}

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function emitUnauthorized() {
  onUnauthorized?.();
}

type ApiResult<T> = T & { success: boolean; error?: unknown };

function apiErrorMessage(data: { error?: unknown }, status: number) {
  const err = data.error;
  if (typeof err === 'string' && err.trim()) return err;
  if (err && typeof err === 'object') {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
    try {
      const serialized = JSON.stringify(err);
      if (serialized && serialized !== '{}') return serialized;
    } catch {
      // keep fallback
    }
  }
  return `Request failed (${status})`;
}

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
    if (response.status === 401 && token) onUnauthorized?.();
    throw new Error(apiErrorMessage(data, response.status));
  }
  return data;
}

export function login(phone: string, password: string) {
  return api<{ token: string; sessionId?: string; user: unknown }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export async function loginWithPhone(phone: string) {
  const device = await getDevicePayload();
  return api<{ token: string; sessionId?: string; user: unknown }>('/api/auth/phone', {
    method: 'POST',
    body: JSON.stringify({ phone, device }),
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

export type AdminUser = {
  id: string;
  name: string;
  phone: string;
  points: number;
  status: 'active' | 'suspended';
  isOwner: boolean;
};

export function listAdminUsers() {
  return api<{ users: AdminUser[] }>('/api/users');
}

export function createAdminUser(body: { name: string; phone: string; points?: number }) {
  return api<{ user: AdminUser }>('/api/users', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAdminUser(
  id: string,
  body: { name?: string; status?: 'active' | 'suspended'; points?: number; addPoints?: number }
) {
  return api<{ user: AdminUser }>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteAdminUser(id: string) {
  return api(`/api/users/${id}`, { method: 'DELETE' });
}

export function useGeneratorCredit() {
  return api<{ points: number; isOwner: boolean }>('/api/generator/use', { method: 'POST' });
}

export type LinkedDevice = {
  id: string;
  name: string;
  kind: 'phone' | 'tablet' | 'desktop' | 'browser';
  platform: string;
  lastActiveAt?: string;
  current?: boolean;
};

export async function registerThisDevice() {
  const device = await getDevicePayload();
  return api<{ token?: string; sessionId: string; device: LinkedDevice }>('/api/devices', {
    method: 'POST',
    body: JSON.stringify(device),
  });
}

export function listLinkedDevices() {
  return api<{ devices: LinkedDevice[]; currentId: string | null }>('/api/devices');
}

export function logoutLinkedDevice(id: string) {
  return api(`/api/devices/${id}`, { method: 'DELETE' });
}
