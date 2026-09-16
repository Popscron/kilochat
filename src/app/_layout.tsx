import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import Stack from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from '@/auth/context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

function RootNavigator() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const baseTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const { ready, signedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const inLogin = segments[0] === 'login';
  const onCorrectScreen = signedIn ? !inLogin : inLogin;
  const showSplash = !ready || !onCorrectScreen;

  useEffect(() => {
    if (!ready) return;
    if (!signedIn && !inLogin) router.replace('/login');
    else if (signedIn && inLogin) router.replace('/(tabs)');
  }, [ready, signedIn, inLogin, router]);

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
          animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
          fullScreenGestureEnabled: true,
        }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="generator" />
        <Stack.Screen name="profile/edit" />
      </Stack>
      {showSplash && <View pointerEvents="none" style={[styles.splash, { backgroundColor: theme.background }]} />}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
