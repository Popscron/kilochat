import * as Device from 'expo-device';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export type DevicePayload = {
  deviceKey: string;
  name: string;
  kind: 'phone' | 'tablet' | 'desktop' | 'browser';
  platform: string;
};

function keyFile() {
  return new File(Paths.document, 'device-key.txt');
}

async function deviceKey() {
  try {
    const file = keyFile();
    if (file.exists) {
      const value = (await file.text()).trim();
      if (value) return value;
    }
    const next = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    if (!file.exists) file.create();
    file.write(next);
    return next;
  } catch {
    return `dev-${Date.now().toString(36)}`;
  }
}

function webBrowserName() {
  if (typeof navigator === 'undefined') return 'Browser';
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Microsoft Edge';
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return 'Google Chrome';
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  return 'Browser';
}

function webOsName() {
  if (typeof navigator === 'undefined') return 'Web';
  const ua = navigator.userAgent;
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Android/.test(ua)) return 'Android';
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  return 'Web';
}

export async function getDevicePayload(): Promise<DevicePayload> {
  const key = await deviceKey();
  if (Platform.OS === 'web') {
    const platform = webOsName();
    return {
      deviceKey: key,
      name: `${webBrowserName()} (${platform})`,
      kind: 'browser',
      platform,
    };
  }

  const tablet = Device.deviceType === Device.DeviceType.TABLET;
  const platform = Device.osName || (Platform.OS === 'ios' ? 'iOS' : 'Android');
  const name = Device.modelName || Device.deviceName || (Platform.OS === 'ios' ? 'iPhone' : 'Android');
  return {
    deviceKey: key,
    name,
    kind: tablet ? 'tablet' : 'phone',
    platform,
  };
}
