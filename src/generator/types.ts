export const CATEGORIES = ['payment', 'price', 'appreciation', 'general', 'photo', 'voice', 'status'] as const;
export type Category = (typeof CATEGORIES)[number];

export const STYLES = ['casual', 'friendly', 'professional', 'ghana', 'mixed'] as const;
export type MessageStyle = (typeof STYLES)[number];

export const TIME_MODES = ['random', 'today', 'yesterday', 'range'] as const;
export type TimeMode = (typeof TIME_MODES)[number];

export const CATEGORY_META: Record<Category, { label: string; emoji: string }> = {
  payment: { label: 'Payment', emoji: '💰' },
  price: { label: 'Price Asking', emoji: '💵' },
  appreciation: { label: 'Appreciation', emoji: '🙏' },
  general: { label: 'General', emoji: '💬' },
  photo: { label: 'Photo', emoji: '📷' },
  voice: { label: 'Voice message', emoji: '🎤' },
  status: { label: 'Status reply', emoji: '🟢' },
};

export const STYLE_LABELS: Record<MessageStyle, string> = {
  casual: 'Casual',
  friendly: 'Friendly',
  professional: 'Professional',
  ghana: 'Ghana-style casual',
  mixed: 'Mixed',
};

export const TIME_MODE_LABELS: Record<TimeMode, string> = {
  random: 'Random',
  today: 'Today',
  yesterday: 'Yesterday',
  range: 'Date range',
};

export type CategoryCounts = Record<Category, number>;

export type GeneratorConfig = {
  counts: CategoryCounts;
  style: MessageStyle;
  timeMode: TimeMode;
  /** Inclusive. 0 = today. Used when timeMode is `range`. */
  rangeFromDays: number;
  rangeToDays: number;
};

export type DraftChat = {
  id: string;
  name: string;
  avatar: string;
  avatarSeed: number;
  phone: string;
  category: Category;
  text: string;
  imageUri?: string;
  durationSec?: number;
  createdAt: string;
  unread: boolean;
};

export const defaultCounts = (): CategoryCounts => ({
  payment: 5,
  price: 2,
  appreciation: 2,
  general: 1,
  photo: 0,
  voice: 0,
  status: 0,
});

export const defaultConfig = (): GeneratorConfig => ({
  counts: defaultCounts(),
  style: 'ghana',
  timeMode: 'random',
  rangeFromDays: 0,
  rangeToDays: 3,
});

export function totalChats(counts: CategoryCounts): number {
  return CATEGORIES.reduce((sum, key) => sum + (counts[key] ?? 0), 0);
}

export const MAX_PER_CATEGORY = 50;
export const MAX_TOTAL_CHATS = 50;
