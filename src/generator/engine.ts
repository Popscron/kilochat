import { avatarUri, messagesFor, NAMES } from './pools';
import { localAvatarKey } from '@/constants/avatars';
import {
  CATEGORIES,
  type Category,
  type DraftChat,
  type GeneratorConfig,
  type MessageStyle,
} from './types';

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function pick<T>(list: T[], used: Set<string>, key: (item: T) => string): T {
  const fresh = list.filter((item) => !used.has(key(item)));
  const pool = fresh.length ? fresh : list;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

function atDaysAgo(daysAgo: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  const now = Date.now();
  if (date.getTime() > now) date.setTime(now - 60_000);
  return date.toISOString();
}

function randomTimeOnDay(daysAgo: number): string {
  const now = new Date();
  let hour = 8 + Math.floor(Math.random() * 14);
  let minute = Math.floor(Math.random() * 4) * 15;
  if (daysAgo === 0) {
    const cap = now.getHours();
    hour = Math.min(hour, Math.max(8, cap));
    if (hour === cap) minute = Math.min(minute, now.getMinutes());
  }
  return atDaysAgo(daysAgo, hour, minute);
}

export function timestampForIndex(index: number, total: number, config: GeneratorConfig): string {
  const { timeMode, rangeFromDays, rangeToDays } = config;
  if (timeMode === 'today') return randomTimeOnDay(0);
  if (timeMode === 'yesterday') return randomTimeOnDay(1);
  if (timeMode === 'range') {
    const from = Math.min(rangeFromDays, rangeToDays);
    const to = Math.max(rangeFromDays, rangeToDays);
    const span = Math.max(1, to - from);
    const t = total <= 1 ? 0 : index / (total - 1);
    const days = Math.round(from + t * span);
    return randomTimeOnDay(days);
  }
  const days = Math.floor(Math.random() * 4);
  return randomTimeOnDay(days);
}

function expandCategories(config: GeneratorConfig): Category[] {
  const list: Category[] = [];
  for (const category of CATEGORIES) {
    for (let i = 0; i < config.counts[category]; i += 1) list.push(category);
  }
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j]!, list[i]!];
  }
  return list;
}

export function pickMessage(category: Category, style: MessageStyle, avoid = new Set<string>()): string {
  return pick(messagesFor(category, style), avoid, (item) => item);
}

const MESSAGE_EMOJIS = ['😂', '😄', '😅', '😊', '🙏', '🔥', '❤️', '👍', '😭', '🙌', '😎', '💯', '😉', '👌', '💪', '🥰', '😆', '👏', '🥺', '🙂'];
const NAME_EMOJIS = ['❤️', '🔥', '😂', '🙏', '✨', '💙', '😊', '😎'];

function hasEmoji(text: string) {
  return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text);
}

function sprinkleEmojis(text: string, style: MessageStyle) {
  if (!text.trim()) return text;
  if (style === 'professional' && Math.random() > 0.2) return text;
  if (Math.random() > 0.5) return text;
  const count = Math.random() < 0.65 ? 1 : Math.random() < 0.85 ? 2 : 3;
  const extra = Array.from({ length: count }, () => MESSAGE_EMOJIS[Math.floor(Math.random() * MESSAGE_EMOJIS.length)]).join('');
  if (hasEmoji(text) && Math.random() > 0.4) return text;
  return `${text} ${extra}`;
}

function maybeNameEmoji(name: string) {
  if (Math.random() > 0.25) return name;
  return `${name} ${NAME_EMOJIS[Math.floor(Math.random() * NAME_EMOJIS.length)]}`;
}

function randomVoiceDuration() {
  return 8 + Math.floor(Math.random() * 72);
}

export function fieldsForCategory(
  category: Category,
  style: MessageStyle,
  seed: number,
  avoidTexts = new Set<string>(),
): Pick<DraftChat, 'text' | 'imageUri' | 'durationSec'> {
  if (category === 'voice') {
    return { text: '', imageUri: undefined, durationSec: randomVoiceDuration() };
  }
  const text = sprinkleEmojis(pickMessage(category, style, avoidTexts), style);
  if (category === 'photo') {
    return { text, imageUri: localAvatarKey(seed + 5), durationSec: undefined };
  }
  return { text, imageUri: undefined, durationSec: undefined };
}

export function generateDrafts(
  config: GeneratorConfig,
  profileImages: string[] = [],
  avoidTexts = new Set<string>(),
): DraftChat[] {
  const categories = expandCategories(config);
  const usedNames = new Set<string>();
  const usedTexts = new Set(avoidTexts);
  const usedSeeds = new Set<number>();

  return categories
    .map((category, index) => {
      const name = maybeNameEmoji(pick(NAMES, usedNames, (item) => item));
      usedNames.add(name);
      let seed = Math.floor(Math.random() * 70);
      while (usedSeeds.has(seed)) seed = (seed + 1) % 70;
      usedSeeds.add(seed);
      const fields = fieldsForCategory(category, config.style, seed, usedTexts);
      if (fields.text) usedTexts.add(fields.text);
      const createdAt = timestampForIndex(index, categories.length, config);
      const uploaded = profileImages[index];
      return {
        id: id('draft'),
        name,
        avatar: uploaded || avatarUri(`${name}-${seed}`),
        avatarSeed: seed,
        phone: `+233 24 555 ${String(1000 + index).slice(-4)}`,
        category,
        createdAt,
        unread: true,
        ...fields,
      };
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function regenerateDraft(draft: DraftChat, style: MessageStyle, others: DraftChat[]): DraftChat {
  const avoid = new Set(others.filter((item) => item.id !== draft.id).map((item) => item.text).filter(Boolean));
  avoid.add(draft.text);
  return { ...draft, ...fieldsForCategory(draft.category, style, draft.avatarSeed + 1, avoid) };
}

export function cycleAvatar(draft: DraftChat): DraftChat {
  const seed = draft.avatarSeed + 1;
  return { ...draft, avatarSeed: seed, avatar: avatarUri(`${draft.name}-${seed}`) };
}

export function setDraftTime(draft: DraftChat, daysAgo: number, hour: number, minute: number): DraftChat {
  return { ...draft, createdAt: atDaysAgo(daysAgo, hour, minute) };
}
