/**
 * Shapes shared by the dummy data and the UI. They are intentionally close to
 * what a messaging API would return so the static arrays can be swapped out.
 */

export const CURRENT_USER_ID = 'me';

export type Contact = {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  about?: string;
  isOnline?: boolean;
  lastSeen?: string; // ISO date
};

/** The signed-in user. `note` is the short status bubble shown above the avatar. */
export type Profile = Omit<Contact, 'isOnline' | 'lastSeen'> & {
  note?: string;
};

export type ChatType = 'direct' | 'group';

export type Chat = {
  id: string;
  type: ChatType;
  /** Participants excluding the current user. Direct chats have exactly one. */
  participantIds: string[];
  /** Only used by groups; direct chats take name/avatar from the contact. */
  name?: string;
  avatar?: string;
  pinned?: boolean;
  muted?: boolean;
  favourite?: boolean;
  archived?: boolean;
  unreadCount: number;
  /** "Mark as unread": shows a green dot without a count. */
  markedUnread?: boolean;
  /** Messages at or before this date are hidden ("Clear chat"). */
  clearedAt?: string; // ISO date
  disappearingMessages?: boolean;
  pinnedMessage?: string;
};

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

type MessageBase = {
  id: string;
  chatId: string;
  senderId: string;
  createdAt: string; // ISO date
  status?: MessageStatus;
};

export type Message =
  | (MessageBase & { type: 'text'; text: string })
  | (MessageBase & { type: 'image'; imageUri: string; caption?: string })
  | (MessageBase & { type: 'voice'; durationSec: number })
  | (MessageBase & { type: 'call'; callKind: 'voice' | 'video'; missed?: boolean })
  | (MessageBase & { type: 'statusReply'; text: string })
  | (MessageBase & { type: 'system'; text: string });

export type MessageType = Message['type'];
