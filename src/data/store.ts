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
  markChatsRead([chatId]);
}

export function markAllRead() {
  markChatsRead(snapshot.chats.map((chat) => chat.id));
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

/*
 * Chat list actions (swipe, selection mode and the "More" sheet). Pin, mute,
 * archive, delete and clear are local only for now; there is no API for them yet.
 */

/** WhatsApp only allows three pinned chats. */
export const MAX_PINNED_CHATS = 3;

export function isChatUnread(chat: Chat): boolean {
  return chat.unreadCount > 0 || !!chat.markedUnread;
}

/** Applies `update` to the given chats; returning `null` removes the chat. */
function updateChats(ids: readonly string[], update: (chat: Chat) => Chat | null) {
  const targets = new Set(ids);
  let changed = false;
  const chats: Chat[] = [];
  for (const chat of snapshot.chats) {
    if (!targets.has(chat.id)) {
      chats.push(chat);
      continue;
    }
    const updated = update(chat);
    if (updated !== chat) changed = true;
    if (updated) chats.push(updated);
  }
  if (changed) emit({ chats });
}

export function markChatsRead(ids: readonly string[]) {
  updateChats(ids, (chat) =>
    isChatUnread(chat) ? { ...chat, unreadCount: 0, markedUnread: false } : chat
  );
}

export function markChatUnread(id: string) {
  updateChats([id], (chat) => (isChatUnread(chat) ? chat : { ...chat, markedUnread: true }));
}

/** Returns `false` when the pin limit is reached. */
export function toggleChatPinned(id: string): boolean {
  const chat = snapshot.chats.find((c) => c.id === id);
  if (!chat) return false;
  if (!chat.pinned) {
    const pinnedCount = snapshot.chats.filter((c) => c.pinned && !c.archived).length;
    if (pinnedCount >= MAX_PINNED_CHATS) return false;
  }
  updateChats([id], (c) => ({ ...c, pinned: !c.pinned }));
  return true;
}

export function setChatsArchived(ids: readonly string[], archived: boolean) {
  // Archived chats lose their pin, like WhatsApp.
  updateChats(ids, (chat) =>
    chat.archived === archived ? chat : { ...chat, archived, pinned: archived ? false : chat.pinned }
  );
}

export function deleteChats(ids: readonly string[]) {
  updateChats(ids, () => null);
}

export function toggleChatMuted(id: string) {
  updateChats([id], (chat) => ({ ...chat, muted: !chat.muted }));
}

export function toggleChatFavourite(id: string) {
  updateChats([id], (chat) => ({ ...chat, favourite: !chat.favourite }));
}

export function clearChat(id: string) {
  updateChats([id], (chat) => ({
    ...chat,
    clearedAt: new Date().toISOString(),
    unreadCount: 0,
    markedUnread: false,
  }));
}
