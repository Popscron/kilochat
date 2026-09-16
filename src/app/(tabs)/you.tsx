import { useCallback, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppShortcutsSection, type AppShortcut } from '@/components/profile/app-shortcuts-section';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTopBar } from '@/components/profile/profile-top-bar';
import { SettingsSection, type SettingsItem } from '@/components/profile/settings-section';
import { Layout, Spacing } from '@/constants/theme';
import { useChatData } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import { resolvedColorScheme, setThemePreference } from '@/theme/preference';

/** Same groups and order as WhatsApp's "You" tab. */
const SECTIONS: SettingsItem[][] = [
  [
    { key: 'subscriptions', label: 'Subscriptions', icon: 'subscriptions', dot: true, external: true },
    { key: 'lists', label: 'Lists', icon: 'lists' },
    { key: 'broadcast', label: 'Broadcast messages', icon: 'broadcast' },
    { key: 'starred', label: 'Starred', icon: 'star' },
    { key: 'linked-devices', label: 'Linked devices', icon: 'linkedDevices' },
  ],
  [
    { key: 'account', label: 'Account', icon: 'account' },
    { key: 'privacy', label: 'Privacy', icon: 'privacy' },
    { key: 'chats', label: 'Chats', icon: 'chatBubble', badge: 1 },
    { key: 'appearance', label: 'Appearance', icon: 'appearance' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications' },
    { key: 'storage', label: 'Storage and data', icon: 'storage' },
    { key: 'parental-controls', label: 'Parental controls', icon: 'parentalControls' },
  ],
  [
    { key: 'help', label: 'Help and feedback', icon: 'help' },
    { key: 'invite', label: 'Invite a friend', icon: 'invite' },
  ],
  [
    {
      key: 'accounts-centre',
      label: 'Accounts Centre',
      icon: 'accountsCentre',
      subtitle: 'Control your experience across Chatbox and your other connected apps.',
    },
  ],
];

const ALSO_FROM_META: AppShortcut[] = [
  { key: 'instagram', label: 'Instagram', icon: 'instagram' },
  { key: 'facebook', label: 'Facebook', icon: 'facebook' },
  { key: 'threads', label: 'Threads', icon: 'threads' },
  { key: 'meta-ai', label: 'Meta AI App', icon: 'metaAi' },
];

export default function YouScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const data = useChatData();
  const profile = data.currentUser;
  const [avatarEpoch, setAvatarEpoch] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setAvatarEpoch((value) => value + 1);
    }, [])
  );

  const openEditor = useCallback(() => router.push('/profile/edit'), [router]);

  const onSettingPress = useCallback((key: string) => {
    if (key === 'appearance') {
      setThemePreference(resolvedColorScheme() === 'light' ? 'dark' : 'light');
    }
  }, []);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  // The header starts right below the bar-height padding, so the name's bottom edge
  // inside the header is exactly the scroll offset at which it slides under the bar.
  const titleOffset = useSharedValue(0);
  const onNameLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { y, height } = event.nativeEvent.layout;
      titleOffset.set(y + height);
    },
    [titleOffset]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.groupedBackground, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <ProfileTopBar
          title={profile.name}
          scrollY={scrollY}
          titleOffset={titleOffset}
          onEditPress={openEditor}
        />

        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}>
          <ProfileHeader
            key={`${profile.avatar ?? 'default'}-${avatarEpoch}`}
            profile={profile}
            onNameLayout={onNameLayout}
            onAvatarPress={openEditor}
          />
          {SECTIONS.map((items) => (
            <SettingsSection key={items[0].key} items={items} onItemPress={onSettingPress} />
          ))}
          <AppShortcutsSection title="Also from Meta" apps={ALSO_FROM_META} />
        </Animated.ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
  scrollContent: {
    paddingTop: Layout.topBarHeight,
    paddingBottom: Spacing.eight,
  },
});
