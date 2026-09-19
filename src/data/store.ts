import { useSyncExternalStore } from 'react';

import { readInboxCacheSync, writeInboxCache, type InboxPayload } from './inbox-cache';
import { currentUser as dummyUser } from './profile';
import { type StoredStatusRing } from './statuses';
import type { Chat, Contact, Message, Profile } from './types';
import { DEFAULT_AVATAR_KEY, generatedAvatarUri, isPlaceholderAvatar } from '@/constants/avatars';

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
  if (uri === DEFAULT_AVATAR_KEY || uri === 'asset:default') return true;
  return (
    isLocalPhoto(uri) ||
    /^asset:\d+$/.test(uri) ||
    isPlaceholderAvatar(uri) ||
    uri.startsWith('data:image/') ||
    /^https?:/i.test(uri)
  );
}

function localAvatarFor(id: string, uri?: string) {
  if (isKeptAvatar(uri)) return uri;
  return generatedAvatarUri(id);
}

/** Keep a locally picked photo; never invent a random contact-style avatar for me. */
function resolveMeAvatar(incoming?: string) {
  const current = snapshot.currentUser.avatar;
  if (incoming?.startsWith('data:image/') || /^https?:/i.test(incoming || '')) return incoming!;
  if (isLocalPhoto(current) || current?.startsWith('data:image/')) return current;
  if (isKeptAvatar(incoming)) return incoming!;
  if (isKeptAvatar(current)) return current;
  return DEFAULT_AVATAR_KEY;
}

function applyCachedInbox() {
  const cached = readInboxCacheSync();
  if (!cached?.me) return;
  snapshot = {
    ...snapshot,
    currentUser: {
      ...cached.me,
      avatar: resolveMeAvatar(cached.me.avatar),
    },
    contacts: cached.contacts,
    chats: cached.chats,
    messages: cached.messages ?? [],
    recentSearchContactIds: (cached.contacts ?? []).slice(0, 5).map((contact) => contact.id),
    usingServer: true,
  };
}

applyCachedInbox();

function persistInbox() {
  const next = getSnapshot();
  void writeInboxCache({
    me: next.currentUser,
    contacts: next.contacts,
    chats: next.chats,
    messages: next.messages,
  } satisfies InboxPayload);
}

function isDummyChatId(id?: string) {
  return !!id && /^chat-\d+$/.test(id);
}

function isDummyContactId(id?: string) {
  return !!id && /^c\d+$/.test(id);
}

function mergeById<T extends { id: string }>(preferred: T[], extra: T[]) {
  const map = new Map<string, T>();
  for (const item of extra) map.set(item.id, item);
  for (const item of preferred) map.set(item.id, item);
  return [...map.values()];
}

export function hydrateFromServer(payload: {
  me: Profile;
  contacts: Contact[];
  chats: Chat[];
  messages: Message[];
}) {
  const generatedContacts = snapshot.contacts.filter((item) => item.id.startsWith('gen-'));
  const generatedChats = snapshot.chats.filter((item) => item.id.startsWith('gen-'));
  const generatedChatIds = new Set(generatedChats.map((item) => item.id));
  const generatedMessages = snapshot.messages.filter(
    (item) => item.id.startsWith('gen-') || generatedChatIds.has(item.chatId)
  );

  const contacts = mergeById(
    generatedContacts,
    payload.contacts
      .filter((contact) => !isDummyContactId(contact.id))
      .map((contact) => ({
        ...contact,
        avatar: localAvatarFor(contact.id, contact.avatar),
      }))
  );
  const chats = mergeById(
    generatedChats,
    payload.chats
      .filter((chat) => !isDummyChatId(chat.id))
      .map((chat) => ({
        ...chat,
        avatar: chat.avatar ? localAvatarFor(chat.id, chat.avatar) : chat.avatar,
      }))
  );
  const messages = mergeById(
    generatedMessages,
    payload.messages.filter((message) => !isDummyChatId(message.chatId))
  );

  emit({
    currentUser: {
      ...payload.me,
      avatar: resolveMeAvatar(payload.me.avatar),
    },
    contacts,
    chats,
    messages,
    recentSearchContactIds: contacts.slice(0, 5).map((contact) => contact.id),
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
  hasStatusRing?: boolean;
  statusRing?: StoredStatusRing;
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
      statusRing: item.statusRing ?? (item.hasStatusRing ? 'unviewed' : 'none'),
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
  persistInbox();
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

/** Sets the avatar ring: green unviewed, grey viewed, or none. */
export function setChatStatusRing(chatId: string, ring: StoredStatusRing) {
  const chat = snapshot.chats.find((item) => item.id === chatId);
  if (!chat || chat.type === 'group') return;
  const contactId = chat.participantIds[0];
  const contact = snapshot.contacts.find((item) => item.id === contactId);
  if (!contact) return;
  emit({
    contacts: snapshot.contacts.map((item) =>
      item.id === contactId ? { ...item, statusRing: ring } : item
    ),
  });
  persistInbox();
}

/** Direct chats store the photo on the contact; groups store it on the chat. */
export function updateChatAvatar(chatId: string, avatar: string) {
  const chat = snapshot.chats.find((item) => item.id === chatId);
  if (!chat) return;
  if (chat.type === 'group') {
    updateChats([chatId], (item) => (item.avatar === avatar ? item : { ...item, avatar }));
    persistInbox();
    return;
  }
  const contactId = chat.participantIds[0];
  if (!contactId) return;
  emit({
    contacts: snapshot.contacts.map((item) =>
      item.id === contactId ? { ...item, avatar } : item
    ),
  });
  persistInbox();
}

export function clearChat(id: string) {
  updateChats([id], (chat) => ({
    ...chat,
    clearedAt: new Date().toISOString(),
    unreadCount: 0,
    markedUnread: false,
  }));
}
