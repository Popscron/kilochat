import { markChatReadOnServer } from '@/api/client';
import { getSnapshot, markChatsRead } from '@/data/store';

/** Marks chats read locally, then tells the server about the ones that had unread messages. */
export function markChatsReadAndSync(ids: readonly string[]) {
  const targets = new Set(ids);
  const unreadIds = getSnapshot()
    .chats.filter((chat) => targets.has(chat.id) && chat.unreadCount > 0)
    .map((chat) => chat.id);
  markChatsRead(ids);
  unreadIds.forEach((id) => {
    markChatReadOnServer(id).catch(() => {});
  });
}
