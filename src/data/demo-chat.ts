/**
 * One dummy 1-to-1 chat for checking the chat list and chat screen design.
 * Ids start with `gen-` so a server sync keeps it. Delete this file and the
 * `seedDemoChat` calls in store.ts to remove it.
 */
import { CURRENT_USER_ID, type Chat, type Contact, type Message } from './types';

export const DEMO_CONTACT_ID = 'gen-c-demo';
export const DEMO_CHAT_ID = 'gen-chat-demo';

const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

export function buildDemoChat(now = Date.now()): {
  contact: Contact;
  chat: Chat;
  messages: Message[];
} {
  const at = (msAgo: number) => new Date(now - msAgo).toISOString();
  const them = DEMO_CONTACT_ID;
  const me = CURRENT_USER_ID;
  let n = 0;
  const base = (senderId: string, msAgo: number, status?: Message['status']) => ({
    id: `gen-m-demo-${n++}`,
    chatId: DEMO_CHAT_ID,
    senderId,
    createdAt: at(msAgo),
    status,
  });

  const messages: Message[] = [
    // Yesterday
    { ...base(them, DAY + 120 * MIN), type: 'text', text: 'Hey! Are we still on for tomorrow? 😊' },
    { ...base(me, DAY + 118 * MIN, 'read'), type: 'text', text: 'Yes, of course!' },
    { ...base(me, DAY + 118 * MIN, 'read'), type: 'text', text: 'What time works for you?' },
    { ...base(them, DAY + 110 * MIN), type: 'text', text: 'How about 4pm at the usual café?' },
    { ...base(me, DAY + 100 * MIN, 'read'), type: 'call', callKind: 'voice' },
    { ...base(them, DAY + 60 * MIN), type: 'call', callKind: 'video', missed: true },
    {
      ...base(me, DAY + 55 * MIN, 'read'),
      type: 'text',
      text: 'Sorry, missed your call. Was in a meeting. 4pm is perfect 👍',
    },
    // Today
    {
      ...base(them, 50 * MIN),
      type: 'image',
      imageUri: 'https://picsum.photos/id/1060/800/1000',
      caption: 'Saved us a table ☕',
    },
    { ...base(me, 45 * MIN, 'read'), type: 'voice', durationSec: 14 },
    {
      ...base(me, 40 * MIN, 'read'),
      type: 'text',
      text: 'This is a longer message to check how the bubble wraps across several lines. It should keep the time and ticks neatly in the bottom corner.',
    },
    { ...base(them, 20 * MIN), type: 'text', text: 'Haha, looks great 😂' },
    { ...base(me, 10 * MIN, 'delivered'), type: 'text', text: 'On my way now' },
    { ...base(me, 2 * MIN, 'sent'), type: 'text', text: 'Be there in 5 🚗' },
    { ...base(them, 1 * MIN), type: 'text', text: 'Okay, see you soon!' },
  ];

  return {
    contact: {
      id: them,
      name: 'Sarah Ahmed',
      phone: '+44 7700 900123',
      about: 'Coffee first ☕',
      isOnline: true,
      lastSeen: at(1 * MIN),
      statusRing: 'unviewed',
    },
    chat: {
      id: DEMO_CHAT_ID,
      type: 'direct',
      participantIds: [them],
      unreadCount: 2,
      favourite: true,
    },
    messages,
  };
}
