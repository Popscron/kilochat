import Constants from 'expo-constants';
import { Platform } from 'react-native';

function lanHost() {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:4000`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL || lanHost();

export const DEMO_PHONE = '+233535899507';
export const DEMO_PASSWORD = 'demo1234';
