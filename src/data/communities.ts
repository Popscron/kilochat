/**
 * Dummy WhatsApp Communities. Kept apart from the chat store until the API
 * supports communities; sent messages live in a small in-memory list.
 */
import { useSyncExternalStore } from 'react';

import type { MessageStatus } from './types';

export const COMMUNITY_ME = 'me';

export type CommunityMember = {
  id: string;
  name: string;
  avatar?: string;
};

export type CommunityGroup = {
  id: string;
  communityId: string;
  name: string;
  /** The Announcements group: only admins post, everyone reads. */
  isAnnouncements?: boolean;
  avatar?: string;
  pinned?: boolean;
  unreadCount?: number;
  joined: boolean;
  memberCount: number;
};

export type Community = {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  /** Tile colours used when there is no photo (pastel background, strong icon). */
  tint: { background: string; icon: string };
  groupIds: string[];
  memberIds: string[];
  /** Only admins post in Announcements; everyone else can just read and reply. */
  adminIds: string[];
};

type CommunityMessageBase = {
  id: string;
  groupId: string;
  senderId: string;
  createdAt: string;
  status?: MessageStatus;
  replyCount?: number;
  /** Pinned to the top of the chat (shows a pin next to the time). */
  pinned?: boolean;
};

export type CommunityMessage =
  | (CommunityMessageBase & { type: 'text'; text: string })
  | (CommunityMessageBase & { type: 'voice'; durationSec: number })
  | (CommunityMessageBase & {
      type: 'system';
      text: string;
      /** Not used as the chat-list preview (e.g. "You pinned a message"). */
      quiet?: boolean;
    });

/** ISO date `daysAgo` days back at `hour:minute` local time. */
function at(daysAgo: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const MEMBERS: CommunityMember[] = [
  { id: COMMUNITY_ME, name: 'You' },
  { id: 'cm-ayesha', name: 'Ayesha Khan', avatar: 'asset:4' },
  { id: 'cm-bilal', name: 'Bilal Ahmed', avatar: 'asset:7' },
  { id: 'cm-sara', name: 'Sara Malik', avatar: 'asset:9' },
  { id: 'cm-usman', name: 'Usman Tariq', avatar: 'asset:11' },
  { id: 'cm-hina', name: 'Hina Raza', avatar: 'asset:13' },
];

const COMMUNITIES: Community[] = [
  {
    id: 'spindict',
    name: 'Spindict Admins',
    description: 'Site updates and team news for Spindict admins.',
    tint: { background: '#FFE0D3', icon: '#D9541E' },
    groupIds: ['spindict-ann', 'spindict-dev', 'spindict-support'],
    memberIds: MEMBERS.map((member) => member.id),
    // You are a plain member here, to show the read-only Announcements view.
    adminIds: ['cm-ayesha'],
  },
  {
    id: 'testing',
    name: 'Testing community',
    description: 'A place to try out community features.',
    tint: { background: '#FFD9E0', icon: '#C8102E' },
    groupIds: ['testing-ann', 'testing-general'],
    memberIds: [COMMUNITY_ME, 'cm-bilal', 'cm-sara'],
    adminIds: [COMMUNITY_ME],
  },
];

const GROUPS: CommunityGroup[] = [
  { id: 'spindict-ann', communityId: 'spindict', name: 'Announcements', isAnnouncements: true, pinned: true, joined: true, memberCount: 248 },
  { id: 'spindict-dev', communityId: 'spindict', name: 'Developers', avatar: 'asset:8', unreadCount: 3, joined: true, memberCount: 18 },
  { id: 'spindict-support', communityId: 'spindict', name: 'Customer support', joined: false, memberCount: 42 },
  { id: 'testing-ann', communityId: 'testing', name: 'Announcements', isAnnouncements: true, pinned: true, joined: true, memberCount: 3 },
  { id: 'testing-general', communityId: 'testing', name: 'General', joined: false, memberCount: 3 },
];

const SEED_MESSAGES: CommunityMessage[] = [
  // Spindict announcements (Ayesha is the admin; you only read and reply)
  { id: 's1', groupId: 'spindict-ann', type: 'system', senderId: 'cm-ayesha', text: 'Ayesha Khan created community "Spindict Admins"', createdAt: at(30, 9, 0) },
  { id: 's2', groupId: 'spindict-ann', type: 'text', senderId: 'cm-ayesha', text: 'Welcome to the community! 👋', createdAt: at(30, 9, 2), pinned: true },
  { id: 's2p', groupId: 'spindict-ann', type: 'system', senderId: 'cm-ayesha', text: 'Ayesha Khan pinned a message', quiet: true, createdAt: at(30, 9, 3) },
  { id: 's3', groupId: 'spindict-ann', type: 'voice', senderId: 'cm-ayesha', durationSec: 38, createdAt: at(12, 17, 29), replyCount: 2 },
  { id: 's4', groupId: 'spindict-ann', type: 'voice', senderId: 'cm-ayesha', durationSec: 68, createdAt: at(11, 11, 3), replyCount: 5 },
  { id: 's5', groupId: 'spindict-ann', type: 'system', senderId: 'cm-hina', text: 'Hina Raza joined using a community link', createdAt: at(10, 11, 4) },
  { id: 's6', groupId: 'spindict-ann', type: 'text', senderId: 'cm-ayesha', text: 'Relax everyone, the update is coming.', createdAt: at(1, 20, 39), replyCount: 1 },
  { id: 's7', groupId: 'spindict-ann', type: 'text', senderId: 'cm-ayesha', text: 'New video for you soon. I just released the latest app.', createdAt: at(1, 20, 41), replyCount: 15 },
  { id: 's8', groupId: 'spindict-ann', type: 'voice', senderId: 'cm-ayesha', durationSec: 35, createdAt: at(1, 21, 1), replyCount: 2 },
  { id: 's9', groupId: 'spindict-ann', type: 'text', senderId: 'cm-ayesha', text: 'Maintenance tonight from 11 PM to 1 AM. The site will be down.', createdAt: at(0, 9, 41), replyCount: 4 },

  // Spindict developers
  { id: 'd1', groupId: 'spindict-dev', type: 'text', senderId: 'cm-bilal', text: 'Pushed the login fix to staging.', createdAt: at(0, 10, 15) },
  { id: 'd2', groupId: 'spindict-dev', type: 'text', senderId: 'cm-usman', text: 'Nice, checking now 👀', createdAt: at(0, 10, 18) },
  { id: 'd3', groupId: 'spindict-dev', type: 'voice', senderId: 'cm-sara', durationSec: 23, createdAt: at(0, 10, 30) },

  // Spindict support
  { id: 'c1', groupId: 'spindict-support', type: 'text', senderId: 'cm-hina', text: 'Three tickets left for today.', createdAt: at(2, 14, 0) },

  // Testing community
  { id: 't1', groupId: 'testing-ann', type: 'system', senderId: COMMUNITY_ME, text: 'You created community "Testing community"', createdAt: at(0, 23, 8) },
  { id: 't2', groupId: 'testing-ann', type: 'text', senderId: COMMUNITY_ME, text: 'Welcome to the community!', createdAt: at(0, 23, 10), status: 'read', pinned: true },
  { id: 't2p', groupId: 'testing-ann', type: 'system', senderId: COMMUNITY_ME, text: 'You pinned a message', quiet: true, createdAt: at(0, 23, 11) },
  { id: 't3', groupId: 'testing-general', type: 'text', senderId: 'cm-sara', text: 'Hi everyone!', createdAt: at(0, 23, 15) },
];

// --- Tiny store so sent messages show up everywhere ---

let messages = SEED_MESSAGES;
let version = 0;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCommunityData() {
  return useSyncExternalStore(subscribe, () => version);
}

export function sendCommunityMessage(groupId: string, text: string) {
  messages = [
    ...messages,
    {
      id: `local-${Date.now()}`,
      groupId,
      type: 'text',
      senderId: COMMUNITY_ME,
      text,
      createdAt: new Date().toISOString(),
      status: 'sent',
    },
  ];
  version += 1;
  listeners.forEach((listener) => listener());
}

// --- Selectors ---

export function getCommunities() {
  return COMMUNITIES;
}

export function getCommunity(id?: string) {
  return COMMUNITIES.find((community) => community.id === id);
}

export function getCommunityGroup(id?: string) {
  return GROUPS.find((group) => group.id === id);
}

export function getCommunityGroups(communityId: string) {
  return GROUPS.filter((group) => group.communityId === communityId);
}

export function isCommunityAdmin(community: Community, memberId: string) {
  return community.adminIds.includes(memberId);
}

export function getCommunityMember(id: string) {
  return MEMBERS.find((member) => member.id === id);
}

export function getGroupMessages(groupId: string) {
  return messages
    .filter((message) => message.groupId === groupId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Newest message for the list preview; quiet notices like "You pinned a message" are skipped. */
export function getLastGroupMessage(groupId: string) {
  return getGroupMessages(groupId).findLast((message) => !(message.type === 'system' && message.quiet));
}

/** Text of the newest pinned message, for the bar under the chat header. */
export function getPinnedText(groupId: string) {
  const pinned = getGroupMessages(groupId).findLast((message) => message.pinned);
  if (!pinned) return undefined;
  return pinned.type === 'voice' ? '🎤 Voice message' : pinned.text;
}

/** One-line preview, like the chat list: "Ayesha: New dashboard…" or "🎤 Voice message". */
export function previewText(message?: CommunityMessage) {
  if (!message) return '';
  const body = message.type === 'voice' ? '🎤 Voice message' : message.text;
  if (message.type === 'system' || message.senderId === COMMUNITY_ME) return body;
  const name = getCommunityMember(message.senderId)?.name.split(' ')[0];
  return name ? `${name}: ${body}` : body;
}
