import { useEffect, useState } from 'react';
import { Dimensions, Image, PixelRatio, type ImageSourcePropType } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import { tabIconPointSize } from '@/components/tab-metrics';
import {
  avatarImageSource,
  DEFAULT_AVATAR,
  DEFAULT_AVATAR_KEY,
  isRemoteAvatar,
} from '@/constants/avatars';
import { makeCircularImage } from '@/profile/circle-png';

/**
 * Visible photo diameter inside the tab slot. Glyph tab PNGs have padding;
 * a full-bleed circle reads larger, especially on Pro Max.
 */
const PHOTO_INSET = 0.82;
const DEFAULT_VISIBLE_RATIO = 0.84;
const CURRENT_META = 'you-tab-current-v6.json';

const prepared = new Map<string, ImageSourcePropType>();
const inflight = new Map<string, Promise<ImageSourcePropType>>();

function iconPt(width = Dimensions.get('window').width) {
  return tabIconPointSize(width);
}

function iconScale() {
  return Math.max(2, Math.round(PixelRatio.get()));
}

function iconCanvasPx(width?: number) {
  return Math.round(iconPt(width) * iconScale());
}

function tabImageSource(uri: string, width?: number): ImageSourcePropType {
  const pt = iconPt(width);
  return { uri, width: pt, height: pt, scale: iconScale() };
}

function sizedAsset(asset: number, width?: number): ImageSourcePropType {
  const resolved = Image.resolveAssetSource(asset);
  if (!resolved?.uri) return asset;
  return tabImageSource(resolved.uri, width);
}

function placeholderTabIcon(width?: number): ImageSourcePropType {
  return sizedAsset(DEFAULT_AVATAR, width);
}

function isPlaceholderAvatar(uri?: string) {
  return !uri || uri === DEFAULT_AVATAR_KEY;
}

function cacheKeyFor(avatar?: string) {
  if (isPlaceholderAvatar(avatar)) return DEFAULT_AVATAR_KEY;
  if (avatar!.startsWith('data:image/')) return `data:${hashKey(avatar!)}`;
  return avatar!;
}

function preparedKey(avatarKey: string, width?: number) {
  return `${avatarKey}@${iconCanvasPx(width)}`;
}

function hashKey(key: string) {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function cachedTabFile(key: string, width?: number, stamp = '0') {
  return new File(Paths.document, `you-tab-${hashKey(key)}-${iconCanvasPx(width)}-v6-${stamp}.png`);
}

function metaFile() {
  return new File(Paths.document, CURRENT_META);
}

type TabIconMeta = { key: string; uri: string; px: number };

function readTabIconMeta(width?: number): TabIconMeta | undefined {
  try {
    const file = metaFile();
    if (!file.exists) return undefined;
    const parsed = JSON.parse(file.textSync()) as TabIconMeta;
    if (!parsed?.key || !parsed?.uri) return undefined;
    if (!parsed.px || parsed.px !== iconCanvasPx(width)) return undefined;
    if (parsed.uri.startsWith('data:image/png')) {
      if (parsed.uri.length < 128) return undefined;
      return parsed;
    }
    const png = new File(parsed.uri);
    if (!png.exists || png.size < 128) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function writeTabIconMeta(meta: TabIconMeta) {
  const file = metaFile();
  if (!file.exists) file.create();
  file.write(JSON.stringify(meta));
}

function diskTabIcon(key: string, width?: number) {
  return matchedTabIcon(key, width);
}

function immediateTabIcon(avatar?: string, width?: number): ImageSourcePropType {
  return matchedTabIcon(cacheKeyFor(avatar), width) ?? placeholderTabIcon(width);
}

function matchedTabIcon(key: string, width?: number): ImageSourcePropType | undefined {
  const slot = preparedKey(key, width);
  const memory = prepared.get(slot);
  if (memory) return memory;
  try {
    const meta = readTabIconMeta(width);
    if (meta?.key !== key) return undefined;
    const png = new File(meta.uri);
    if (!png.exists || png.size < 128) return undefined;
    const source = tabImageSource(meta.uri, width);
    prepared.set(slot, source);
    return source;
  } catch {
    return undefined;
  }
}

/** File / asset / http URI for the real photo. Does not swap remotes for the default PNG. */
function resolvePhotoUri(avatar?: string): string | undefined {
  if (isPlaceholderAvatar(avatar)) return undefined;
  if (avatar.startsWith('data:image/') || isRemoteAvatar(avatar)) return avatar;
  const source = avatarImageSource(avatar);
  if (typeof source === 'number') return Image.resolveAssetSource(source)?.uri;
  return source.uri;
}

function iconSourceUri(source: ImageSourcePropType) {
  if (typeof source === 'object' && source && 'uri' in source && source.uri) return String(source.uri);
  return '';
}

export type ProfileTabIcon = {
  source: ImageSourcePropType;
  uri: string;
  ready: boolean;
  cacheKey: string;
};

function probeSize(uri: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

function cropToSquare(
  width: number,
  height: number,
  visibleRatio = 1
): { originX: number; originY: number; width: number; height: number } | null {
  const side = Math.min(width, height);
  const visible = Math.max(1, Math.round(side * visibleRatio));
  if (visible <= 0) return null;
  return {
    originX: Math.round((width - visible) / 2),
    originY: Math.round((height - visible) / 2),
    width: visible,
    height: visible,
  };
}

function asBytes(raw: Uint8Array | ArrayBuffer) {
  return raw instanceof Uint8Array ? raw : new Uint8Array(raw);
}

function bytesFromBase64(value: string) {
  const clean = value.replace(/[\s]/g, '').replace(/-/g, '+').replace(/_/g, '/');
  try {
    const atobFn = globalThis.atob;
    if (typeof atobFn === 'function') {
      const binary = atobFn(clean);
      const out = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
      return out;
    }
  } catch {
    // Fall through to the manual decoder.
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const padded = clean + '='.repeat((4 - (clean.length % 4)) % 4);
  const out = new Uint8Array((padded.replace(/=/g, '').length * 3) >> 2);
  let o = 0;
  for (let i = 0; i < padded.length; i += 4) {
    const a = chars.indexOf(padded[i]);
    const b = chars.indexOf(padded[i + 1]);
    const c = chars.indexOf(padded[i + 2]);
    const d = chars.indexOf(padded[i + 3]);
    const n = (Math.max(0, a) << 18) | (Math.max(0, b) << 12) | (Math.max(0, c) << 6) | Math.max(0, d);
    if (o < out.length) out[o++] = (n >> 16) & 0xff;
    if (c >= 0 && o < out.length) out[o++] = (n >> 8) & 0xff;
    if (d >= 0 && o < out.length) out[o++] = n & 0xff;
  }
  return out.subarray(0, o);
}

function bytesToBase64(bytes: Uint8Array) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const n = (a << 16) | (b << 8) | c;
    out += chars[(n >> 18) & 63] + chars[(n >> 12) & 63];
    out += i + 1 < bytes.length ? chars[(n >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? chars[n & 63] : '=';
  }
  return out;
}

async function imageBytesFromResult(uri: string, base64?: string | null) {
  try {
    const raw = await new File(uri).bytes();
    if (raw?.byteLength) return asBytes(raw);
  } catch {
    // Expo Go can refuse some manipulator temp URIs; use the base64 payload.
  }
  if (base64) return bytesFromBase64(base64);
  throw new Error('Image bytes');
}

async function materializeUri(uri: string) {
  if (!uri.startsWith('data:image/')) return uri;
  const comma = uri.indexOf(',');
  if (comma < 0) return uri;
  const png = /image\/png/i.test(uri.slice(0, comma));
  const dest = new File(Paths.cache, `you-src-${Date.now()}.${png ? 'png' : 'jpg'}`);
  dest.create({ overwrite: true });
  const payload = uri.slice(comma + 1);
  try {
    dest.write(payload, { encoding: 'base64' });
  } catch {
    dest.write(bytesFromBase64(payload));
  }
  return dest.uri;
}

async function manipulatePhoto(uri: string, actions: Parameters<typeof manipulateAsync>[1]) {
  const result = await manipulateAsync(uri, actions, {
    compress: 0.92,
    format: SaveFormat.JPEG,
    base64: true,
  });
  return imageBytesFromResult(result.uri, result.base64);
}

function writeCircularTabPng(key: string, pngBytes: Uint8Array, width?: number) {
  const dataUri = `data:image/png;base64,${bytesToBase64(pngBytes)}`;
  try {
    const previous = readTabIconMeta(width);
    if (previous?.uri && !previous.uri.startsWith('data:')) {
      try {
        const old = new File(previous.uri);
        if (old.exists) old.delete();
      } catch {}
    }
    writeTabIconMeta({ key, uri: dataUri, px: iconCanvasPx(width) });
  } catch {
    // NativeTabs can still use the in-memory data URI.
  }
  return dataUri;
}

export function clearProfileTabIcon() {
  prepared.clear();
  inflight.clear();
  try {
    const meta = readTabIconMeta();
    if (meta?.uri && !meta.uri.startsWith('data:')) {
      const png = new File(meta.uri);
      if (png.exists) png.delete();
    }
    const file = metaFile();
    if (file.exists) file.delete();
  } catch {
    // Sign-out can still proceed.
  }
}

async function rasterizeProfileTabIcon(avatar: string | undefined, key: string, width?: number) {
  const uri =
    resolvePhotoUri(avatar) ??
    (isPlaceholderAvatar(avatar) ? Image.resolveAssetSource(DEFAULT_AVATAR)?.uri : undefined);
  if (!uri) return placeholderTabIcon(width);

  const sourceUri = await materializeUri(uri);
  const canvas = iconCanvasPx(width);
  let bytes: Uint8Array | undefined;
  if (avatar?.startsWith('data:image/')) {
    const comma = avatar.indexOf(',');
    if (comma >= 0) bytes = bytesFromBase64(avatar.slice(comma + 1));
  }
  if (!bytes) {
    let actions: Parameters<typeof manipulateAsync>[1] = [{ resize: { width: canvas, height: canvas } }];
    try {
      const size = await probeSize(sourceUri);
      const crop = cropToSquare(
        size.width,
        size.height,
        key === DEFAULT_AVATAR_KEY ? DEFAULT_VISIBLE_RATIO : 1
      );
      if (crop) {
        actions = [{ crop }, { resize: { width: canvas, height: canvas } }];
      }
    } catch {
      // Decode-and-scale still yields a tiny square.
    }
    try {
      bytes = await manipulatePhoto(sourceUri, actions);
    } catch {
      bytes = await imageBytesFromResult(sourceUri);
    }
  }
  if (!bytes?.byteLength) throw new Error('Photo bytes');
  const circled = makeCircularImage(new Uint8Array(bytes), PHOTO_INSET, canvas);
  const iconUri = writeCircularTabPng(key, circled, width);

  if (isPlaceholderAvatar(avatar)) {
    try {
      const file = metaFile();
      if (file.exists) file.delete();
    } catch {}
  }

  const source = tabImageSource(iconUri, width);
  prepared.set(preparedKey(key, width), source);
  return source;
}

export async function prepareProfileTabIcon(avatar?: string, width?: number): Promise<ImageSourcePropType> {
  const key = cacheKeyFor(avatar);
  const slot = preparedKey(key, width);
  const cached = matchedTabIcon(key, width);
  if (cached) {
    prepared.set(slot, cached);
    return cached;
  }

  const pending = inflight.get(slot);
  if (pending) return pending;

  const work = rasterizeProfileTabIcon(avatar, key, width)
    .catch(() => placeholderTabIcon(width))
    .finally(() => inflight.delete(slot));
  inflight.set(slot, work);
  return work;
}

/** Small tab preview of the signed-in user's profile photo. */
export function useProfileTabIcon(avatar?: string, width?: number): ProfileTabIcon {
  const cacheKey = cacheKeyFor(avatar);
  const placeholder = isPlaceholderAvatar(avatar);
  const [icon, setIcon] = useState<{ source: ImageSourcePropType; key: string } | undefined>(() => {
    const hit = matchedTabIcon(cacheKey, width);
    if (hit) return { source: hit, key: cacheKey };
    if (placeholder) return { source: placeholderTabIcon(width), key: cacheKey };
    return undefined;
  });

  useEffect(() => {
    const hit = matchedTabIcon(cacheKey, width);
    if (hit) {
      setIcon({ source: hit, key: cacheKey });
      return;
    }
    if (placeholder) {
      setIcon({ source: placeholderTabIcon(width), key: cacheKey });
    }

    let cancelled = false;
    prepareProfileTabIcon(avatar, width)
      .then((next) => {
        if (!cancelled) setIcon({ source: next, key: cacheKey });
      })
      .catch(() => {
        if (!cancelled) setIcon({ source: placeholderTabIcon(width), key: cacheKey });
      });
    return () => {
      cancelled = true;
    };
  }, [avatar, cacheKey, placeholder, width]);

  const ready = icon?.key === cacheKey;
  const resolved = ready && icon ? icon.source : placeholderTabIcon(width);
  return {
    source: resolved,
    uri: iconSourceUri(resolved),
    ready,
    cacheKey,
  };
}
