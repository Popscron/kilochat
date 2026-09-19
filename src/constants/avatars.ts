export const DEFAULT_AVATAR = require('../../assets/images/default-avatar.png');

export const DEFAULT_AVATAR_KEY = 'asset:default';

/** Colored person placeholders the user can pick instead of a photo. */
export const DEFAULT_PLACEHOLDERS = [
  require('../../assets/avatars/placeholder-0.png'),
  require('../../assets/avatars/placeholder-1.png'),
  require('../../assets/avatars/placeholder-2.png'),
] as const;

export function defaultPlaceholderKey(index: number) {
  const i = ((index % DEFAULT_PLACEHOLDERS.length) + DEFAULT_PLACEHOLDERS.length) % DEFAULT_PLACEHOLDERS.length;
  return `asset:placeholder:${i}`;
}

/** Original default plus the three colored placeholders. */
export const PICKABLE_DEFAULTS = [
  { key: DEFAULT_AVATAR_KEY, source: DEFAULT_AVATAR },
  ...DEFAULT_PLACEHOLDERS.map((source, index) => ({
    key: defaultPlaceholderKey(index),
    source,
  })),
] as const;

export function isPlaceholderAvatar(uri?: string) {
  return !!uri && /^asset:placeholder:\d+$/.test(uri);
}

/** Bundled real photos mixed like social profiles: default, animals, wallpapers, art, people, food. */
export const LOCAL_AVATARS = [
  require('../../assets/avatars/00.png'),
  require('../../assets/avatars/01.png'),
  require('../../assets/avatars/02.png'),
  require('../../assets/avatars/03.png'),
  require('../../assets/avatars/04.png'),
  require('../../assets/avatars/05.png'),
  require('../../assets/avatars/06.png'),
  require('../../assets/avatars/07.png'),
  require('../../assets/avatars/08.png'),
  require('../../assets/avatars/09.png'),
  require('../../assets/avatars/10.png'),
  require('../../assets/avatars/11.png'),
  require('../../assets/avatars/12.png'),
  require('../../assets/avatars/13.png'),
  require('../../assets/avatars/14.png'),
  require('../../assets/avatars/15.png'),
] as const;

export function localAvatarKey(index: number) {
  const i = ((index % LOCAL_AVATARS.length) + LOCAL_AVATARS.length) % LOCAL_AVATARS.length;
  return `asset:${i}`;
}

function hashSeed(seed: string | number) {
  const key = String(seed);
  let n = 0;
  for (let i = 0; i < key.length; i += 1) n = (n * 31 + key.charCodeAt(i)) >>> 0;
  return n;
}

export function generatedAvatarUri(seed: string | number): string {
  return localAvatarKey(hashSeed(seed));
}

export function isRemoteAvatar(uri?: string) {
  return !!uri && (/^https?:/i.test(uri) || uri.startsWith('data:image/'));
}

export function isDefaultAvatar(uri?: string) {
  return !uri || uri === DEFAULT_AVATAR_KEY || uri === 'asset:default' || isPlaceholderAvatar(uri);
}

export function avatarImageSource(uri?: string) {
  const placeholder = /^asset:placeholder:(\d+)$/.exec(uri ?? '');
  if (placeholder) {
    const index = Number(placeholder[1]);
    return DEFAULT_PLACEHOLDERS[index] ?? DEFAULT_AVATAR;
  }
  if (isDefaultAvatar(uri)) return DEFAULT_AVATAR;
  const match = /^asset:(\d+)$/.exec(uri ?? '');
  if (match) {
    const index = Number(match[1]);
    return LOCAL_AVATARS[index] ?? DEFAULT_AVATAR;
  }
  if (uri!.startsWith('/')) return { uri: `file://${uri}` };
  return { uri: uri! };
}
