import { File, Paths } from 'expo-file-system';

import type { Chat, Contact, Message, Profile } from './types';

const FILE_NAME = 'inbox-cache.json';

export type InboxPayload = {
  me: Profile;
  contacts: Contact[];
  chats: Chat[];
  messages: Message[];
};

function cacheFile() {
  return new File(Paths.document, FILE_NAME);
}

export async function readInboxCache(): Promise<InboxPayload | null> {
  try {
    const file = cacheFile();
    if (!file.exists) return null;
    const parsed = JSON.parse(await file.text()) as InboxPayload;
    if (!parsed?.me || !Array.isArray(parsed.chats) || !Array.isArray(parsed.contacts)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeInboxCache(payload: InboxPayload) {
  try {
    const file = cacheFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(payload));
  } catch {
    // Cache is only to keep profile photos stable across reloads.
  }
}

export async function clearInboxCache() {
  try {
    const file = cacheFile();
    if (file.exists) file.delete();
  } catch {
    // Ignore.
  }
}
