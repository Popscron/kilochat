import Stack from 'expo-router/stack';
import { Platform } from 'react-native';

export default function GeneratorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
        fullScreenGestureEnabled: true,
      }}
    />
  );
}
