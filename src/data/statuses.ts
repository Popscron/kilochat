/**
 * Who has posted a status ("Updates"). There is no status API yet, so the ring
 * is derived from the contact id: stable across reloads and independent of
 * whether the chats come from the dummy arrays or the server. Swap
 * `getStatusRing` for a real lookup once statuses are stored.
 */

export type StatusRing = 'unviewed' | 'viewed';

/** Contacts are spread over this many buckets; the first two get a ring. */
const BUCKETS = 4;

function hash(id: string): number {
  let value = 0;
  for (let index = 0; index < id.length; index += 1) {
    value = (value * 31 + id.charCodeAt(index)) >>> 0;
  }
  return value;
}

/** The ring to draw around a contact's avatar, or undefined when there is none. */
export function getStatusRing(contactId?: string): StatusRing | undefined {
  if (!contactId) return undefined;
  const bucket = hash(contactId) % BUCKETS;
  if (bucket === 0) return 'unviewed';
  if (bucket === 1) return 'viewed';
  return undefined;
}
