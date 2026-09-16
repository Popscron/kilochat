import { CURRENT_USER_ID, type Profile } from './types';
import { DEFAULT_AVATAR_KEY } from '@/constants/avatars';

export const currentUser: Profile = {
  id: CURRENT_USER_ID,
  name: 'John Wick',
  phone: '+92 300 555 0100',
  avatar: DEFAULT_AVATAR_KEY,
  about: 'Available',
  note: 'Ending the day with a cup of chai ☕',
};
