/**
 * Read-only selectors over the dummy arrays. Screens only talk to these
 * functions, so replacing the arrays with API calls later is a local change.
 */
import { chats } from './chats';
import { contacts, recentSearchContactIds } from './contacts';
import { messages } from './messages';
import { currentUser } from './profile';
import { CURRENT_USER_ID, type Chat, type Contact, type Message, type Profile } from './types';

export * from './types';
export { chats, contacts, messages };

export function getCurrentUser(): Profile {
  return currentUser;
}

export type ChatFilter = 'all' | 'unread' | 'favourites' | 'groups';

export type ChatPreview = {
  chat: Chat;
  title: string;
  avatar?: string;
  lastMessage?: Message;
  lastMessageSender?: Contact;
};

export type MessageSearchResult = {
  message: Message & { type: 'text' };
  preview: ChatPreview;
};

const contactsById = new Map(contacts.map((contact) => [contact.id, contact]));

export function getContact(id: string): Contact | undefined {
  return contactsById.get(id);
}

export function getChat(id: string): Chat | undefined {
  return chats.find((chat) => chat.id === id);
}

export function getChatTitle(chat: Chat): string {
  if (chat.type === 'group') return chat.name ?? 'Group';
  return getContact(chat.participantIds[0])?.name ?? 'Unknown';
}

export function getChatAvatar(chat: Chat): string | undefined {
  if (chat.type === 'group') return chat.avatar;
  return getContact(chat.participantIds[0])?.avatar;
}

export function getMessagesForChat(chatId: string): Message[] {
  return messages
    .filter((message) => message.chatId === chatId)
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export function getChatPreview(chat: Chat): ChatPreview {
  const history = getMessagesForChat(chat.id);
  const lastMessage = history[history.length - 1];
  return {
    chat,
    title: getChatTitle(chat),
    avatar: getChatAvatar(chat),
    lastMessage,
    lastMessageSender: lastMessage ? getContact(lastMessage.senderId) : undefined,
  };
}

const lastActivity = (preview: ChatPreview) =>
  preview.lastMessage ? Date.parse(preview.lastMessage.createdAt) : 0;

/** Non-archived chats, pinned first, then most recent activity. */
export function getChatPreviews(filter: ChatFilter = 'all'): ChatPreview[] {
  return chats
    .filter((chat) => !chat.archived && matchesFilter(chat, filter))
    .map(getChatPreview)
    .sort((a, b) => {
      if (!!a.chat.pinned !== !!b.chat.pinned) return a.chat.pinned ? -1 : 1;
      return lastActivity(b) - lastActivity(a);
    });
}

function matchesFilter(chat: Chat, filter: ChatFilter): boolean {
  switch (filter) {
    case 'unread':
      return chat.unreadCount > 0;
    case 'favourites':
      return !!chat.favourite;
    case 'groups':
      return chat.type === 'group';
    default:
      return true;
  }
}

export function getFilterCount(filter: ChatFilter): number {
  return chats.filter((chat) => !chat.archived && matchesFilter(chat, filter)).length;
}

export function getArchivedCount(): number {
  return chats.filter((chat) => chat.archived).length;
}

export function getTotalUnreadCount(excludeChatId?: string): number {
  return chats
    .filter((chat) => !chat.archived && chat.id !== excludeChatId)
    .reduce((sum, chat) => sum + chat.unreadCount, 0);
}

export function getRecentSearchContacts(): Contact[] {
  return recentSearchContactIds.map(getContact).filter((c): c is Contact => !!c);
}

export function getDirectChatForContact(contactId: string): Chat | undefined {
  return chats.find((chat) => chat.type === 'direct' && chat.participantIds[0] === contactId);
}

export function isFromMe(message: Message): boolean {
  return message.senderId === CURRENT_USER_ID;
}

/** Case-insensitive search across chat titles and text messages. */
export function searchChats(query: string): {
  chats: ChatPreview[];
  messages: MessageSearchResult[];
} {
  const needle = query.trim().toLowerCase();
  if (!needle) return { chats: [], messages: [] };

  const previews = chats.map(getChatPreview);
  const previewsById = new Map(previews.map((preview) => [preview.chat.id, preview]));

  return {
    chats: previews
      .filter((preview) => preview.title.toLowerCase().includes(needle))
      .sort((a, b) => lastActivity(b) - lastActivity(a)),
    messages: messages
      .filter(
        (message): message is Message & { type: 'text' } =>
          message.type === 'text' && message.text.toLowerCase().includes(needle)
      )
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .map((message) => ({ message, preview: previewsById.get(message.chatId)! })),
  };
}
