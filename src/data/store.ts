import { useSyncExternalStore } from 'react';

import { writeInboxCache, type InboxPayload } from './inbox-cache';
import { currentUser as dummyUser } from './profile';
import type { Chat, Contact, Message, Profile } from './types';
import { DEFAULT_AVATAR_KEY, generatedAvatarUri } from '@/constants/avatars';

export type StoreMessage = Message;

type Snapshot = {
  version: number;
  currentUser: Profile;
  contacts: Contact[];
  chats: Chat[];
  messages: Message[];
  recentSearchContactIds: string[];
  usingServer: boolean;
};

let snapshot: Snapshot = {
  version: 0,
  currentUser: dummyUser,
  contacts: [],
  chats: [],
  messages: [],
  recentSearchContactIds: [],
  usingServer: false,
};

const listeners = new Set<() => void>();

function emit(partial: Partial<Omit<Snapshot, 'version'>>) {
  snapshot = { ...snapshot, ...partial, version: snapshot.version + 1 };
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return snapshot;
}

export function useChatData() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function isLocalPhoto(uri?: string) {
  if (!uri) return false;
  return (
    uri.startsWith('file:') ||
    uri.startsWith('ph:') ||
    uri.startsWith('content:') ||
    uri.startsWith('assets-library:') ||
    uri.startsWith('/')
  );
}

function isKeptAvatar(uri?: string) {
  if (!uri) return false;
  if (uri === DEFAULT_AVATAR_KEY || uri === 'asset:default') return false;
  return isLocalPhoto(uri) || /^asset:\d+$/.test(uri);
}

function localAvatarFor(id: string, uri?: string) {
  if (isKeptAvatar(uri)) return uri;
  return generatedAvatarUri(id);
}

/** Keep a locally picked photo; never invent a random contact-style avatar for me. */
function resolveMeAvatar(incoming?: string) {
  if (isLocalPhoto(incoming)) return incoming;
  if (isLocalPhoto(snapshot.currentUser.avatar)) return snapshot.currentUser.avatar;
  return DEFAULT_AVATAR_KEY;
}

function persistInbox() {
  const next = getSnapshot();
  void writeInboxCache({
    me: next.currentUser,
    contacts: next.contacts,
    chats: next.chats,
    messages: next.messages,
  } satisfies InboxPayload);
}

export function hydrateFromServer(payload: {
  me: Profile;
  contacts: Contact[];
  chats: Chat[];
  messages: Message[];
}) {
  emit({
    currentUser: {
      ...payload.me,
      avatar: resolveMeAvatar(payload.me.avatar),
    },
    contacts: payload.contacts.map((contact) => ({
      ...contact,
      avatar: localAvatarFor(contact.id, contact.avatar),
    })),
    chats: payload.chats.map((chat) => ({
      ...chat,
      avatar: chat.avatar ? localAvatarFor(chat.id, chat.avatar) : chat.avatar,
    })),
    messages: payload.messages,
    recentSearchContactIds: payload.contacts.slice(0, 5).map((contact) => contact.id),
    usingServer: true,
  });
  persistInbox();
}

export function resetInbox() {
  emit({
    currentUser: dummyUser,
    contacts: [],
    chats: [],
    messages: [],
    recentSearchContactIds: [],
    usingServer: false,
  });
}

export function addMessage(message: Message) {
  if (snapshot.messages.some((item) => item.id === message.id)) return;
  const chats = snapshot.chats.map((chat) => {
    if (chat.id !== message.chatId) return chat;
    if (message.senderId === snapshot.currentUser.id) return chat;
    return { ...chat, unreadCount: chat.unreadCount + 1 };
  });
  emit({ messages: [...snapshot.messages, message], chats });
}

export function replaceMessage(localId: string, message: Message) {
  emit({
    messages: snapshot.messages.map((item) => (item.id === localId ? message : item)),
  });
}

export function markChatRead(chatId: string) {
  emit({
    chats: snapshot.chats.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat)),
  });
}

export function markAllRead() {
  emit({
    chats: snapshot.chats.map((chat) => (chat.unreadCount ? { ...chat, unreadCount: 0 } : chat)),
  });
}

export function updateCurrentUser(patch: Partial<Profile>) {
  emit({ currentUser: { ...snapshot.currentUser, ...patch } });
  persistInbox();
}

export type GeneratedInboxChat = {
  name: string;
  avatar?: string;
  phone: string;
  text: string;
  imageUri?: string;
  durationSec?: number;
  category?: string;
  createdAt: string;
  unread: boolean;
};

/** Local demo chats only. Does not touch the server. */
export function applyGeneratedChats(items: GeneratedInboxChat[]) {
  if (!items.length) return;

  const contacts = [...snapshot.contacts];
  const chats = [...snapshot.chats];
  const messages = [...snapshot.messages];
  const stamp = Date.now().toString(36);

  items.forEach((item, index) => {
    const contactId = `gen-c-${stamp}-${index}`;
    const chatId = `gen-chat-${stamp}-${index}`;
    contacts.unshift({
      id: contactId,
      name: item.name,
      phone: item.phone,
      avatar: item.avatar,
      about: 'Available',
      lastSeen: item.createdAt,
    });
    chats.unshift({
      id: chatId,
      type: 'direct',
      participantIds: [contactId],
      unreadCount: item.unread ? 1 : 0,
    });
    const base = {
      id: `gen-m-${stamp}-${index}`,
      chatId,
      senderId: contactId,
      createdAt: item.createdAt,
      status: 'delivered' as const,
    };
    if (item.category === 'photo' && item.imageUri) {
      messages.push({ ...base, type: 'image', imageUri: item.imageUri, caption: item.text || undefined });
    } else if (item.category === 'voice') {
      messages.push({ ...base, type: 'voice', durationSec: item.durationSec || 12 });
    } else if (item.category === 'status') {
      messages.push({ ...base, type: 'statusReply', text: item.text });
    } else {
      messages.push({ ...base, type: 'text', text: item.text });
    }
  });

  emit({ contacts, chats, messages });
}
