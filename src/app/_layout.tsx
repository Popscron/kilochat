import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import Stack from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const baseTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...baseTheme,
        colors: { ...baseTheme.colors, primary: theme.accent, background: theme.background },
      }}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          // iOS: native push with parallax + interactive swipe back (what WhatsApp uses).
          animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
          fullScreenGestureEnabled: true,
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
      </Stack>
    </ThemeProvider>
  );
}
