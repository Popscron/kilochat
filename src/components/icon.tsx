import type { AndroidSymbol } from 'expo-symbols';
import { SymbolView } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * One name → SF Symbol on iOS, Material Symbol on Android/web.
 * Add new icons here instead of passing raw symbol names around.
 */
const ICONS = {
  more: { ios: 'ellipsis', android: 'more_horiz' },
  camera: { ios: 'camera', android: 'photo_camera' },
  cameraFill: { ios: 'camera.fill', android: 'photo_camera' },
  plus: { ios: 'plus', android: 'add' },
  search: { ios: 'magnifyingglass', android: 'search' },
  archive: { ios: 'archivebox', android: 'archive' },
  pin: { ios: 'pin.fill', android: 'keep' },
  muted: { ios: 'speaker.slash.fill', android: 'volume_off' },
  check: { ios: 'checkmark', android: 'check' },
  mic: { ios: 'mic', android: 'mic' },
  micFill: { ios: 'mic.fill', android: 'mic' },
  phone: { ios: 'phone', android: 'call' },
  phoneFill: { ios: 'phone.fill', android: 'call' },
  video: { ios: 'video', android: 'videocam' },
  videoFill: { ios: 'video.fill', android: 'videocam' },
  back: { ios: 'chevron.left', android: 'arrow_back' },
  sticker: { ios: 'note.text', android: 'sticky_note_2' },
  send: { ios: 'paperplane.fill', android: 'send' },
  group: { ios: 'person.2.fill', android: 'group' },
  person: { ios: 'person.fill', android: 'account_circle' },
  timer: { ios: 'timer', android: 'timer' },
  gif: { ios: 'photo.on.rectangle', android: 'gif_box' },
  link: { ios: 'safari', android: 'explore' },
  document: { ios: 'doc', android: 'description' },
  audio: { ios: 'music.note', android: 'music_note' },
  northWest: { ios: 'arrow.up.left.circle', android: 'north_west' },
  close: { ios: 'xmark', android: 'close' },
  updates: { ios: 'circle.dashed.inset.filled', android: 'data_usage' },
  calls: { ios: 'phone', android: 'call' },
  communities: { ios: 'person.3', android: 'groups' },
  chats: { ios: 'bubble.left.and.bubble.right', android: 'chat' },
  you: { ios: 'person.crop.circle', android: 'account_circle' },
  qrCode: { ios: 'qrcode', android: 'qr_code' },
  edit: { ios: 'pencil', android: 'edit' },
  addCircle: { ios: 'plus.circle', android: 'add_circle' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right' },
  external: { ios: 'arrow.up.right', android: 'arrow_outward' },
  subscriptions: { ios: 'star.square', android: 'workspace_premium' },
  lists: { ios: 'person.crop.rectangle.stack', android: 'contact_page' },
  broadcast: { ios: 'megaphone', android: 'campaign' },
  star: { ios: 'star', android: 'star' },
  linkedDevices: { ios: 'laptopcomputer', android: 'laptop' },
  account: { ios: 'key', android: 'key' },
  privacy: { ios: 'lock', android: 'lock' },
  chatBubble: { ios: 'bubble.left', android: 'chat_bubble' },
  appearance: { ios: 'paintpalette', android: 'palette' },
  notifications: { ios: 'app.badge', android: 'notifications' },
  storage: { ios: 'arrow.up.arrow.down', android: 'swap_vert' },
  parentalControls: { ios: 'figure.and.child.holdinghands', android: 'family_restroom' },
  help: { ios: 'questionmark.circle', android: 'help' },
  invite: { ios: 'heart', android: 'favorite' },
  accountsCentre: { ios: 'infinity', android: 'all_inclusive' },
  // No brand logos in the symbol sets, so these are close generic stand-ins.
  instagram: { ios: 'camera.circle', android: 'photo_camera' },
  facebook: { ios: 'f.circle', android: 'thumb_up' },
  threads: { ios: 'at', android: 'alternate_email' },
  metaAi: { ios: 'sparkles', android: 'auto_awesome' },
} as const satisfies Record<string, { ios: SFSymbol; android: AndroidSymbol }>;

export type IconName = keyof typeof ICONS;

export function iconSymbols(name: IconName) {
  return ICONS[name];
}

type IconProps = {
  name: IconName;
  size?: number;
  color: ColorValue;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 22, color, style }: IconProps) {
  const { ios, android } = ICONS[name];
  return (
    <SymbolView
      name={{ ios, android, web: android }}
      size={size}
      tintColor={color}
      style={[{ width: size, height: size }, style]}
    />
  );
}
