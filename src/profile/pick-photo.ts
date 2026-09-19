import { File, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

import { showDefaultAvatarPicker } from '@/profile/default-avatar-picker';

async function persist(uri: string, prefix = 'avatar') {
  try {
    const ext = uri.split('?')[0]?.split('.').pop()?.toLowerCase();
    const suffix = ext && ext.length <= 4 ? ext : 'jpg';
    const dest = new File(Paths.document, `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${suffix}`);
    await new File(uri).copy(dest);
    return dest.uri;
  } catch {
    return uri;
  }
}

async function fromResult(result: ImagePicker.ImagePickerResult) {
  if (result.canceled || !result.assets[0]?.uri) return null;
  return persist(result.assets[0].uri);
}

export function isLocalPhotoUri(uri?: string) {
  if (!uri) return false;
  return (
    uri.startsWith('file:') ||
    uri.startsWith('ph:') ||
    uri.startsWith('content:') ||
    uri.startsWith('assets-library:') ||
    uri.startsWith('/')
  );
}

/** Compress a local photo so it can be stored on the server. */
export async function encodeAvatarForServer(uri?: string): Promise<string> {
  if (!uri) return '';
  if (uri.startsWith('data:image/')) return uri;
  if (/^https?:/i.test(uri) || /^asset:/.test(uri)) return uri;
  if (!isLocalPhotoUri(uri)) return uri;

  const result = await manipulateAsync(uri, [{ resize: { width: 512, height: 512 } }], {
    compress: 0.72,
    format: SaveFormat.JPEG,
    base64: true,
  });
  if (!result.base64) throw new Error('Could not encode photo');
  return `data:image/jpeg;base64,${result.base64}`;
}

export async function pickProfilePhoto(source: 'camera' | 'library'): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  };

  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Turn on camera access to take a profile photo.');
      return null;
    }
    return fromResult(await ImagePicker.launchCameraAsync(options));
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Photos access needed', 'Turn on photo access to choose a profile picture.');
    return null;
  }
  return fromResult(await ImagePicker.launchImageLibraryAsync(options));
}

/** Multi-select from the library. `limit` is how many more photos can be added. */
export async function pickProfilePhotos(limit: number): Promise<string[]> {
  const max = Math.max(1, Math.min(50, Math.round(limit)));
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Photos access needed', 'Turn on photo access to choose profile pictures.');
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: max,
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.length) return [];

  const uris: string[] = [];
  for (const asset of result.assets.slice(0, max)) {
    if (!asset.uri) continue;
    uris.push(await persist(asset.uri, 'gen-avatar'));
  }
  return uris;
}

type PhotoOption = { label: string; action: () => void; destructive?: boolean };

export function showPhotoOptions(handlers: {
  title?: string;
  onCamera?: () => void;
  onLibrary: () => void;
  onDefault?: () => void;
  onRemove?: () => void;
}) {
  const items: PhotoOption[] = [];
  if (handlers.onCamera) items.push({ label: 'Camera', action: handlers.onCamera });
  items.push({ label: 'Choose from photos', action: handlers.onLibrary });
  if (handlers.onDefault) items.push({ label: 'Use default picture', action: handlers.onDefault });
  if (handlers.onRemove) items.push({ label: 'Remove photo', action: handlers.onRemove, destructive: true });

  const labels = [...items.map((item) => item.label), 'Cancel'];
  const cancelButtonIndex = labels.length - 1;
  const destructiveButtonIndex = items.findIndex((item) => item.destructive);

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: handlers.title,
        options: labels,
        cancelButtonIndex,
        destructiveButtonIndex: destructiveButtonIndex >= 0 ? destructiveButtonIndex : undefined,
      },
      (index) => {
        if (index === cancelButtonIndex || index == null) return;
        items[index]?.action();
      }
    );
    return;
  }

  Alert.alert(handlers.title ?? 'Photo', undefined, [
    ...items.map((item) => ({
      text: item.label,
      onPress: item.action,
      style: item.destructive ? ('destructive' as const) : undefined,
    })),
    { text: 'Cancel', style: 'cancel' as const },
  ]);
}

/** Camera, library, or the default person icon for a chat/contact photo. */
export function chooseContactPhoto(onPick: (uri: string) => void, title = 'Contact photo') {
  showPhotoOptions({
    title,
    onCamera: () => {
      pickProfilePhoto('camera').then((uri) => uri && onPick(uri));
    },
    onLibrary: () => {
      pickProfilePhoto('library').then((uri) => uri && onPick(uri));
    },
    onDefault: () => showDefaultAvatarPicker(onPick),
  });
}
