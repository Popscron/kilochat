import { useEffect, useState } from 'react';
import { Image, PixelRatio, type ImageSourcePropType } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import { avatarImageSource, DEFAULT_AVATAR, isDefaultAvatar } from '@/constants/avatars';

/** Native tab icons are ~25–27pt. Full-size photos fill the iOS 26 selected pill. */
const ICON_PT = 28;
const ICON_PX = 84;

const prepared = new Map<string, ImageSourcePropType>();

function sizedUri(uri: string, pt = ICON_PT): ImageSourcePropType {
  return { uri, width: pt, height: pt, scale: PixelRatio.get() };
}

function sizedAsset(asset: number, pt = ICON_PT): ImageSourcePropType {
  const resolved = Image.resolveAssetSource(asset);
  if (!resolved?.uri) return asset;
  return {
    uri: resolved.uri,
    width: pt,
    height: pt,
    scale: resolved.scale > 1 ? resolved.scale : 3,
  };
}

const DEFAULT_TAB_ICON = sizedAsset(DEFAULT_AVATAR);

function fileUri(avatar?: string) {
  const source = avatarImageSource(avatar);
  if (typeof source === 'number') return Image.resolveAssetSource(source)?.uri;
  return source.uri;
}

function probeSize(uri: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

export async function prepareProfileTabIcon(avatar: string): Promise<ImageSourcePropType> {
  const cached = prepared.get(avatar);
  if (cached) return cached;

  const uri = fileUri(avatar);
  if (!uri) return DEFAULT_TAB_ICON;

  let actions: Parameters<typeof manipulateAsync>[1] = [{ resize: { width: ICON_PX, height: ICON_PX } }];
  try {
    const { width, height } = await probeSize(uri);
    const side = Math.min(width, height);
    if (side > 0) {
      actions = [
        {
          crop: {
            originX: Math.round((width - side) / 2),
            originY: Math.round((height - side) / 2),
            width: side,
            height: side,
          },
        },
        { resize: { width: ICON_PX, height: ICON_PX } },
      ];
    }
  } catch {
    // Resize-only still yields a tiny square icon instead of a full-bleed photo.
  }

  const result = await manipulateAsync(uri, actions, { compress: 1, format: SaveFormat.PNG });
  const source = sizedUri(result.uri);
  prepared.set(avatar, source);
  return source;
}

/** Small tab preview of the signed-in user's profile photo. */
export function useProfileTabIcon(avatar?: string) {
  const [source, setSource] = useState<ImageSourcePropType>(() => {
    if (!avatar || isDefaultAvatar(avatar)) return DEFAULT_TAB_ICON;
    return prepared.get(avatar) ?? DEFAULT_TAB_ICON;
  });

  useEffect(() => {
    if (!avatar || isDefaultAvatar(avatar)) {
      setSource(DEFAULT_TAB_ICON);
      return;
    }

    const hit = prepared.get(avatar);
    if (hit) {
      setSource(hit);
      return;
    }

    let cancelled = false;
    prepareProfileTabIcon(avatar)
      .then((next) => {
        if (!cancelled) setSource(next);
      })
      .catch(() => {
        if (!cancelled) setSource(DEFAULT_TAB_ICON);
      });
    return () => {
      cancelled = true;
    };
  }, [avatar]);

  return source;
}
