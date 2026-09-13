/**
 * Dummy timestamps are generated relative to "now" so the list always shows a
 * realistic mix of today / yesterday / weekday / date labels.
 */

export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

/** `daysAgo` days before today at the given local time (clamped to now). */
export function at(daysAgo: number, hours: number, minutes: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return new Date(Math.min(date.getTime(), Date.now())).toISOString();
}
