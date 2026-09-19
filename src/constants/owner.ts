/** Ghana owner number. Local 0535899507 is stored as +233535899507. */
export const OWNER_PHONE = '+233535899507';

export function isOwnerPhone(phone?: string) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits === '233535899507' || digits === '0535899507' || digits === '535899507';
}

export function isOwnerAccount(profile?: { phone?: string; isOwner?: boolean } | null) {
  if (!profile) return false;
  return !!profile.isOwner || isOwnerPhone(profile.phone);
}
