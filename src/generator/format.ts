import { daysFromToday, formatTime } from '@/utils/format';

export function formatPreviewWhen(iso: string): string {
  const date = new Date(iso);
  const days = daysFromToday(date);
  const time = formatTime(iso);
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Yesterday, ${time}`;
  if (days < 7) {
    const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
    return `${weekday}, ${time}`;
  }
  const day = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return `${day}, ${time}`;
}

export function splitDateTime(iso: string): { daysAgo: number; hour: number; minute: number } {
  const date = new Date(iso);
  return {
    daysAgo: daysFromToday(date),
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
}
