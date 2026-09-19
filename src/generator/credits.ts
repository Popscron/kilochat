import { useGeneratorCredit } from '@/api/client';
import { getSnapshot, updateCurrentUser } from '@/data/store';

/** Spend 1 point for a generate. Throws if none remain. */
export async function spendGeneratePoint() {
  const me = getSnapshot().currentUser;
  if ((me.points ?? 0) < 1) {
    throw new Error('No points remaining.');
  }

  const result = await useGeneratorCredit();
  updateCurrentUser({ points: result.points, isOwner: result.isOwner });
  return result.points;
}
