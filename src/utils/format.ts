const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Whole calendar days between `date` and today (0 = today, 1 = yesterday). */
export function daysFromToday(date: Date): number {
  return Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY_MS);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Chat list: "9:14 AM", "Yesterday", "Saturday", "12/08/2026". */
export function formatChatListDate(iso: string): string {
  const date = new Date(iso);
  const days = daysFromToday(date);
  if (days === 0) return formatTime(iso);
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Date chip between message groups: "Today", "Yesterday", "Monday", "Mon, 12 Aug". */
export function formatDaySeparator(iso: string): string {
  const date = new Date(iso);
  const days = daysFromToday(date);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatLastSeen(iso: string): string {
  const date = new Date(iso);
  const days = daysFromToday(date);
  if (days === 0) return `last seen today at ${formatTime(iso)}`;
  if (days === 1) return `last seen yesterday at ${formatTime(iso)}`;
  return `last seen ${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function isSameDay(a: string, b: string): boolean {
  return startOfDay(new Date(a)) === startOfDay(new Date(b));
}
