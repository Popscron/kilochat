import type { Contact } from './types';
import { at, minutesAgo } from './time';

const avatar = (seed: number) => `https://i.pravatar.cc/200?img=${seed}`;

export const contacts: Contact[] = [
  {
    id: 'c1',
    name: 'Daniel Mensah',
    phone: '+233 24 555 0101',
    avatar: avatar(12),
    about: 'Busy building things',
    isOnline: true,
  },
  {
    id: 'c2',
    name: 'Mom ❤️',
    phone: '+233 20 555 0102',
    avatar: avatar(47),
    about: 'Family first',
    lastSeen: minutesAgo(25),
  },
  {
    id: 'c3',
    name: 'Alex Rivera',
    phone: '+1 415 555 0103',
    avatar: avatar(33),
    about: 'Mobile developer',
    lastSeen: minutesAgo(2),
  },
  {
    id: 'c4',
    name: 'Priya Sharma',
    phone: '+91 98 5550 0104',
    avatar: avatar(45),
    about: 'Available',
    isOnline: true,
  },
  {
    id: 'c5',
    name: 'Thomas Wright 🇬🇧',
    phone: '+44 7700 900105',
    avatar: avatar(59),
    about: 'Hey there! I am using Chatbox.',
    lastSeen: at(1, 22, 40),
  },
  {
    id: 'c6',
    name: 'Kwame Asante',
    phone: '+233 27 555 0106',
    avatar: avatar(68),
    lastSeen: at(0, 8, 10),
  },
  {
    id: 'c7',
    name: 'Sarah Johnson',
    phone: '+1 212 555 0107',
    avatar: avatar(44),
    about: 'At the gym 🏋️',
    lastSeen: at(2, 18, 5),
  },
  {
    id: 'c8',
    name: 'David Chen',
    phone: '+86 139 5550 0108',
    avatar: avatar(52),
    lastSeen: at(3, 11, 30),
  },
  {
    id: 'c9',
    name: 'Aisha Bello',
    phone: '+234 803 555 0109',
    avatar: avatar(49),
    about: 'Designer ✏️',
    isOnline: true,
  },
  {
    id: 'c10',
    name: 'Emmanuel Owusu',
    phone: '+233 26 555 0110',
    avatar: avatar(15),
    lastSeen: at(5, 9, 12),
  },
  {
    id: 'c11',
    name: 'Lina Park',
    phone: '+82 10 5550 0111',
    avatar: avatar(32),
    lastSeen: at(9, 20, 45),
  },
  {
    id: 'c12',
    name: 'Nana Adjei',
    phone: '+233 55 555 0112',
    lastSeen: at(12, 7, 0),
  },
];

export const recentSearchContactIds = ['c1', 'c2', 'c3', 'c4', 'c9'];
