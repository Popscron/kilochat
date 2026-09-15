import { CURRENT_USER_ID, type Profile } from './types';

export const currentUser: Profile = {
  id: CURRENT_USER_ID,
  name: 'John Wick',
  phone: '+92 300 555 0100',
  avatar: 'https://i.pravatar.cc/400?img=11',
  about: 'Available',
  note: 'Ending the day with a cup of chai ☕',
};
