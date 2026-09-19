import { Platform } from 'react-native';

/**
 * WhatsApp-inspired palette. Every screen reads colors through `useTheme()`,
 * so light/dark mode is handled in one place.
 */
export const Colors = {
  light: {
    text: '#000000',
    textSecondary: '#6e7070',
    textTertiary: '#AEAEB2',
    background: '#FFFFFF',
    backgroundElement: '#F2F2F7',
    searchField: 'rgba(118, 118, 128, 0.12)',
    separator: '#E3E3E6',
    icon: '#000000',

    accent: '#1DAB61',
    accentBright: '#25D366',
    onAccent: '#FFFFFF',
    link: '#027EB5',
    readTick: '#53BDEB',

    chipBorder: '#DCDCDF',
    chipText: '#6E7070',
    chipActiveBackground: '#D9FDD3',
    chipActiveBorder: '#B7E9B0',
    chipActiveText: '#15603E',

    glassFallback: 'rgba(255, 255, 255, 0.92)',
    glassShadow: 'rgba(0, 0, 0, 0.08)',
    /** Menus and toolbars floating over the list; rows show through faintly. */
    floatingSurface: 'rgba(255, 255, 255, 0.92)',
    floatingShadow: 'rgba(0, 0, 0, 0.14)',

    groupedBackground: '#F4F4F4',
    groupedCard: '#FFFFFF',
    groupedCardPressed: '#E5E5EA',
    neutralBadge: '#6E6E73',

    destructive: '#E0164C',
    swipeRead: '#1F8A55',
    statusRing: '#25D366',
    statusRingViewed: '#C9C9CE',
    swipeNeutral: '#76767B',
    swipeArchive: '#2F7BF5',
    rowSelected: '#F0F0F4',
    checkboxBorder: '#C7C7CC',

    wallpaper: '#EFEAE2',
    bubbleIncoming: '#FFFFFF',
    bubbleOutgoing: '#D9FDD3',
    bubbleMeta: '#667781',
    systemBubble: '#FFF5C4',
    dateChip: 'rgba(255, 255, 255, 0.92)',

    avatarPlaceholder: '#DFE5E7',
    avatarPlaceholderIcon: '#FFFFFF',
    groupSenderColors: ['#1F7AEC', '#E26A00', '#A63CC8', '#008069', '#D3396D'],
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#8D8D93',
    textTertiary: '#636366',
    background: '#000000',
    backgroundElement: '#1C1C1E',
    searchField: 'rgba(118, 118, 128, 0.24)',
    separator: '#2C2C2E',
    icon: '#FFFFFF',

    accent: '#21C063',
    accentBright: '#25D366',
    onAccent: '#000000',
    link: '#53BDEB',
    readTick: '#53BDEB',

    chipBorder: '#3A3A3C',
    chipText: '#6E7070',
    chipActiveBackground: '#103529',
    chipActiveBorder: '#1B5E43',
    chipActiveText: '#D9FDD3',

    glassFallback: 'rgba(28, 28, 30, 0.92)',
    glassShadow: 'rgba(0, 0, 0, 0.4)',
    floatingSurface: 'rgba(44, 44, 46, 0.92)',
    floatingShadow: 'rgba(0, 0, 0, 0.6)',

    groupedBackground: '#000000',
    groupedCard: '#1C1C1E',
    groupedCardPressed: '#2C2C2E',
    neutralBadge: '#636366',

    destructive: '#FF4F6E',
    swipeRead: '#1F8A55',
    statusRing: '#25D366',
    statusRingViewed: '#3C4B52',
    swipeNeutral: '#636366',
    swipeArchive: '#2F7BF5',
    rowSelected: '#1C1C1E',
    checkboxBorder: '#48484A',

    wallpaper: '#0B141A',
    bubbleIncoming: '#1F2C33',
    bubbleOutgoing: '#144D37',
    bubbleMeta: '#8696A0',
    systemBubble: '#1D282F',
    dateChip: 'rgba(31, 44, 51, 0.95)',

    avatarPlaceholder: '#3A3A3C',
    avatarPlaceholderIcon: '#8D8D93',
    groupSenderColors: ['#53BDEB', '#FC9775', '#D88DEB', '#06CF9C', '#FF72A1'],
  },
} as const;

export type ThemeColors = (typeof Colors)[keyof typeof Colors];

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
} as const;

export const Radius = {
  small: 8,
  medium: 12,
  bubble: 18,
  card: 26,
  pill: 999,
} as const;

export const FontSize = {
  caption: 11,
  footnote: 13,
  subhead: 15,
  body: 17,
  title: 20,
  largeTitle: 34,
} as const;

export const Layout = {
  topBarHeight: 52,
  searchFieldHeight: 38,
  chatAvatarSize: 68,
  chatRowVerticalPadding: 5,
  headerIconButtonSize: 44,
  composerMinHeight: 40,
  bubbleMaxWidthRatio: 0.8,
  bubbleMaxWidth: 520,
  profileAvatarSize: 120,
  settingsRowHeight: 52,
  settingsIconColumn: 44,
  swipeActionWidth: 74,
  selectionColumn: 40,
  /** Content is centred and capped on tablets / wide web windows. */
  maxContentWidth: 760,
} as const;

export const Motion = {
  searchDuration: 320,
  fast: 180,
} as const;

export const HitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;

export const isIOS = Platform.OS === 'ios';
