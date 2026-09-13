import type { Message } from './types';
import { CURRENT_USER_ID as ME } from './types';
import { at, minutesAgo } from './time';

export const messages: Message[] = [
  // chat-1 · Daniel Mensah
  { id: 'm1-1', chatId: 'chat-1', senderId: 'c1', type: 'text', text: 'Are we still on for Saturday?', createdAt: at(3, 10, 2) },
  { id: 'm1-2', chatId: 'chat-1', senderId: ME, type: 'text', text: 'Yes, see you at 4', createdAt: at(3, 10, 5), status: 'read' },
  { id: 'm1-3', chatId: 'chat-1', senderId: ME, type: 'system', text: 'You use a default timer for disappearing messages in new chats. New messages will disappear from this chat 24 hours after they’re sent.', createdAt: at(2, 9, 0) },

  // chat-2 · Project Advance Features
  { id: 'm2-1', chatId: 'chat-2', senderId: 'c3', type: 'text', text: 'Pushed the new onboarding flow to staging 🚀', createdAt: at(0, 7, 40) },
  { id: 'm2-2', chatId: 'chat-2', senderId: 'c9', type: 'text', text: 'Looks great. Can we tweak the spacing on step 2?', createdAt: at(0, 7, 48) },
  { id: 'm2-3', chatId: 'chat-2', senderId: 'c4', type: 'text', text: 'I will handle it after standup', createdAt: at(0, 7, 55) },
  { id: 'm2-4', chatId: 'chat-2', senderId: ME, type: 'text', text: 'Okay', createdAt: minutesAgo(76), status: 'delivered' },

  // chat-3 · Design Review (You)
  { id: 'm3-1', chatId: 'chat-3', senderId: ME, type: 'text', text: 'Reference screens for the new chat UI', createdAt: at(1, 16, 10), status: 'read' },
  { id: 'm3-2', chatId: 'chat-3', senderId: ME, type: 'image', imageUri: 'https://picsum.photos/id/180/600/800', createdAt: at(1, 16, 12), status: 'read' },

  // chat-4 · Alex Rivera
  { id: 'm4-1', chatId: 'chat-4', senderId: 'c3', type: 'text', text: 'Ok bro', createdAt: at(1, 14, 9) },
  { id: 'm4-2', chatId: 'chat-4', senderId: 'c3', type: 'text', text: 'When to start?', createdAt: at(1, 14, 11) },
  { id: 'm4-3', chatId: 'chat-4', senderId: ME, type: 'text', text: 'Are you sure you can do it exactly the same?', createdAt: at(1, 14, 20), status: 'read' },
  { id: 'm4-4', chatId: 'chat-4', senderId: ME, type: 'text', text: 'And the UI will be exactly like WhatsApp', createdAt: at(1, 14, 21), status: 'read' },
  { id: 'm4-5', chatId: 'chat-4', senderId: 'c3', type: 'text', text: 'Yes bro', createdAt: at(1, 14, 40) },
  { id: 'm4-6', chatId: 'chat-4', senderId: ME, type: 'text', text: 'Okay', createdAt: minutesAgo(90), status: 'read' },
  { id: 'm4-7', chatId: 'chat-4', senderId: ME, type: 'text', text: 'And when do you think it will be done?', createdAt: minutesAgo(89), status: 'read' },
  { id: 'm4-8', chatId: 'chat-4', senderId: 'c3', type: 'text', text: 'When do you need this?', createdAt: minutesAgo(30) },
  { id: 'm4-9', chatId: 'chat-4', senderId: ME, type: 'text', text: 'Maybe three days time', createdAt: minutesAgo(8), status: 'read' },
  { id: 'm4-10', chatId: 'chat-4', senderId: 'c3', type: 'text', text: 'Ok bro', createdAt: minutesAgo(3) },
  { id: 'm4-11', chatId: 'chat-4', senderId: 'c3', type: 'text', text: 'Send me the code', createdAt: minutesAgo(3) },
  { id: 'm4-12', chatId: 'chat-4', senderId: 'c3', type: 'text', text: 'The design is detailed so I will need a bit more effort to get this right', createdAt: minutesAgo(2) },

  // chat-5 · Weekend Football
  { id: 'm5-1', chatId: 'chat-5', senderId: 'c6', type: 'text', text: 'Who is bringing the ball this week?', createdAt: minutesAgo(120) },
  { id: 'm5-2', chatId: 'chat-5', senderId: 'c10', type: 'voice', durationSec: 21, createdAt: minutesAgo(95) },
  { id: 'm5-3', chatId: 'chat-5', senderId: 'c1', type: 'text', text: 'Pitch is booked for 7am 💯', createdAt: minutesAgo(40) },
  { id: 'm5-4', chatId: 'chat-5', senderId: 'c6', type: 'call', callKind: 'video', createdAt: minutesAgo(11) },

  // chat-6 · Mom
  { id: 'm6-1', chatId: 'chat-6', senderId: ME, type: 'text', text: 'I will call you in the evening', createdAt: at(1, 12, 0), status: 'read' },
  { id: 'm6-2', chatId: 'chat-6', senderId: 'c2', type: 'text', text: 'Did you eat?', createdAt: minutesAgo(50) },
  { id: 'm6-3', chatId: 'chat-6', senderId: 'c2', type: 'text', text: 'Call me when you are free ❤️', createdAt: minutesAgo(49) },

  // chat-7 · Thomas Wright
  { id: 'm7-1', chatId: 'chat-7', senderId: 'c5', type: 'text', text: 'Can you send the invoice?', createdAt: at(1, 18, 20) },
  { id: 'm7-2', chatId: 'chat-7', senderId: ME, type: 'voice', durationSec: 13, createdAt: minutesAgo(70), status: 'sent' },

  // chat-8 · Priya Sharma
  { id: 'm8-1', chatId: 'chat-8', senderId: ME, type: 'call', callKind: 'voice', createdAt: at(1, 20, 5) },
  { id: 'm8-2', chatId: 'chat-8', senderId: 'c4', type: 'text', text: 'Sorry, missed your call', createdAt: minutesAgo(64) },
  { id: 'm8-3', chatId: 'chat-8', senderId: 'c4', type: 'text', text: 'Free now?', createdAt: minutesAgo(63) },
  { id: 'm8-4', chatId: 'chat-8', senderId: 'c4', type: 'image', imageUri: 'https://picsum.photos/id/1011/600/800', caption: 'Where we are 😄', createdAt: minutesAgo(62) },

  // chat-9 · Family
  { id: 'm9-1', chatId: 'chat-9', senderId: 'c10', type: 'text', text: 'Happy birthday Nana! 🎉🎂', createdAt: at(1, 7, 30) },
  { id: 'm9-2', chatId: 'chat-9', senderId: 'c2', type: 'image', imageUri: 'https://picsum.photos/id/1080/600/600', createdAt: at(1, 21, 3) },

  // chat-10 · Sarah Johnson
  { id: 'm10-1', chatId: 'chat-10', senderId: 'c7', type: 'call', callKind: 'voice', missed: true, createdAt: at(2, 18, 2) },
  { id: 'm10-2', chatId: 'chat-10', senderId: ME, type: 'text', text: 'Thanks for the recommendation!', createdAt: at(2, 18, 30), status: 'read' },

  // chat-11 · David Chen
  { id: 'm11-1', chatId: 'chat-11', senderId: 'c8', type: 'text', text: 'Meeting moved to Thursday', createdAt: at(3, 11, 25) },

  // chat-12 · Aisha Bello
  { id: 'm12-1', chatId: 'chat-12', senderId: 'c9', type: 'text', text: 'Here are the updated icons', createdAt: at(4, 15, 0) },
  { id: 'm12-2', chatId: 'chat-12', senderId: ME, type: 'text', text: 'Perfect, thank you 🙏', createdAt: at(4, 15, 12), status: 'read' },

  // chat-13 · Lina Park
  { id: 'm13-1', chatId: 'chat-13', senderId: 'c11', type: 'text', text: 'Let me know when you land ✈️', createdAt: at(9, 20, 40) },

  // chat-14 · Nana Adjei (archived)
  { id: 'm14-1', chatId: 'chat-14', senderId: 'c12', type: 'text', text: 'Good morning', createdAt: at(12, 7, 0) },

  // chat-15 · Kwame Asante (archived)
  { id: 'm15-1', chatId: 'chat-15', senderId: ME, type: 'text', text: 'Noted', createdAt: at(14, 13, 0), status: 'delivered' },
];
