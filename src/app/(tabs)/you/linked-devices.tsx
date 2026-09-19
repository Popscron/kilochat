import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  listLinkedDevices,
  logoutLinkedDevice,
  type LinkedDevice,
} from '@/api/client';
import { syncThisDevice } from '@/api/session';
import { useAuth } from '@/auth/context';
import { GlassIconButton } from '@/components/glass-surface';
import { Icon, type IconName } from '@/components/icon';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function formatLastActive(value?: string) {
  if (!value) return 'Last active recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Last active recently';
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = start(new Date());
  const day = start(date);
  const diff = Math.round((today - day) / 86400000);
  if (diff === 0) return `Last active today at ${time}`;
  if (diff === 1) return `Last active yesterday at ${time}`;
  if (diff < 7) {
    const weekday = date.toLocaleDateString(undefined, { weekday: 'short' });
    return `Last active ${weekday} at ${time}`;
  }
  const stamp = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `Last active ${stamp} at ${time}`;
}

function deviceIcon(device: LinkedDevice): IconName {
  if (device.kind === 'browser' || device.kind === 'desktop') return 'laptop';
  if (device.kind === 'tablet') return 'desktop';
  return 'iphone';
}

export default function LinkedDevicesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const [devices, setDevices] = useState<LinkedDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      await syncThisDevice();
      const result = await listLinkedDevices();
      const rows = result.devices ?? [];
      setDevices([...rows].sort((a, b) => Number(b.current) - Number(a.current)));
    } catch (err) {
      Alert.alert('Could not load devices', err instanceof Error ? err.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  const onDevice = (device: LinkedDevice) => {
    const leaveHere = device.current;
    Alert.alert(
      leaveHere ? 'Log out this device?' : `Log out ${device.name}?`,
      leaveHere
        ? 'You will need your phone number to log back in.'
        : 'This device will be logged out of Chatbox.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await logoutLinkedDevice(device.id);
                if (leaveHere) await signOut();
                else await load();
              } catch (err) {
                Alert.alert('Could not log out', err instanceof Error ? err.message : 'Try again.');
              }
            })();
          },
        },
      ]
    );
  };

  const learnMore = () => {
    Alert.alert(
      'Linked devices',
      'Log in on another phone, tablet, or computer with this same number. Those sessions appear here. Tap a device to log it out.'
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.groupedBackground }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.one }]}>
        <GlassIconButton icon="back" accessibilityLabel="Back" onPress={() => router.back()} />
        <Text style={[styles.title, { color: theme.text }]}>Linked devices</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: Spacing.five,
          paddingBottom: insets.bottom + Spacing.eight,
        }}>
        <View style={[styles.heroCard, { backgroundColor: theme.groupedCard }]}>
          <LinkedDevicesArt />
          <Text style={[styles.heroCopy, { color: theme.textSecondary }]}>
            You can link other devices to this account.{' '}
            <Text style={{ color: theme.accent, fontWeight: '600' }} onPress={learnMore}>
              Learn more
            </Text>
          </Text>
          <Pressable
            onPress={() => router.push('/you/link-device')}
            style={({ pressed }) => [styles.linkBtn, { backgroundColor: theme.accent, opacity: pressed ? 0.88 : 1 }]}>
            <Text style={styles.linkBtnLabel}>+ Link a device</Text>
          </Pressable>
        </View>

        <Text style={[styles.section, { color: theme.textSecondary }]}>Linked devices</Text>
        <View style={[styles.listCard, { backgroundColor: theme.groupedCard }]}>
          {loading ? (
            <ActivityIndicator style={styles.loader} color={theme.accent} />
          ) : devices.length === 0 ? (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>No other devices yet.</Text>
          ) : (
            devices.map((device, index) => (
              <Pressable
                key={device.id}
                onPress={() => onDevice(device)}
                style={({ pressed }) => [
                  styles.deviceRow,
                  pressed && { backgroundColor: theme.groupedCardPressed },
                ]}>
                <View style={[styles.deviceIcon, { backgroundColor: theme.backgroundElement }]}>
                  {/Chrome/i.test(device.name) ? (
                    <ChromeMark />
                  ) : (
                    <Icon name={deviceIcon(device)} size={22} color={theme.textSecondary} />
                  )}
                </View>
                <View
                  style={[
                    styles.deviceText,
                    index < devices.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.separator,
                    },
                  ]}>
                  <View style={styles.deviceCopy}>
                    <Text style={[styles.deviceName, { color: theme.text }]} numberOfLines={1}>
                      {device.name}
                    </Text>
                    <Text style={[styles.deviceMeta, { color: theme.textSecondary }]} numberOfLines={1}>
                      {device.current ? 'This device' : formatLastActive(device.lastActiveAt)}
                    </Text>
                  </View>
                  <Icon name="chevronRight" size={15} color={theme.textTertiary} />
                </View>
              </Pressable>
            ))
          )}
        </View>

        <Text style={[styles.hint, { color: theme.textSecondary }]}>Tap a device to log out.</Text>

        <View style={styles.encrypt}>
          <Icon name="lockFill" size={14} color={theme.textSecondary} />
          <Text style={[styles.encryptCopy, { color: theme.textSecondary }]}>
            Your personal messages are{' '}
            <Text style={{ color: theme.accent }}>end-to-end encrypted</Text> on all of your devices.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ChromeMark() {
  return (
    <View style={styles.chrome}>
      <View style={styles.chromeDot} />
    </View>
  );
}

function LinkedDevicesArt() {
  return (
    <View style={styles.art} pointerEvents="none">
      <View style={styles.phone}>
        <View style={styles.phoneSpeaker} />
        <View style={styles.phoneScreen} />
      </View>
      <View style={styles.bubbleLeft}>
        <Icon name="invite" size={13} color="#1DAB61" />
      </View>
      <View style={styles.bubbleRight}>
        <Icon name="invite" size={15} color="#1DAB61" />
      </View>
      <View style={styles.laptop}>
        <View style={styles.laptopLid}>
          <View style={styles.laptopScreen} />
        </View>
        <View style={styles.laptopBase} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    minHeight: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  headerSpacer: {
    width: Layout.headerIconButtonSize,
  },
  heroCard: {
    marginHorizontal: Spacing.four,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.five,
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  heroCopy: {
    marginTop: Spacing.five,
    fontSize: FontSize.subhead,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
  },
  linkBtn: {
    marginTop: Spacing.five,
    alignSelf: 'stretch',
    height: 50,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkBtnLabel: {
    color: '#FFFFFF',
    fontSize: FontSize.body,
    fontWeight: '700',
  },
  section: {
    fontSize: FontSize.footnote,
    fontWeight: '400',
    paddingHorizontal: Spacing.eight,
    marginTop: Spacing.six,
    marginBottom: Spacing.two,
  },
  listCard: {
    marginHorizontal: Spacing.four,
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  loader: {
    marginVertical: Spacing.six,
  },
  empty: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
    fontSize: FontSize.subhead,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.four,
  },
  deviceIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceText: {
    flex: 1,
    minHeight: 64,
    marginLeft: Spacing.three,
    paddingRight: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  deviceCopy: {
    flex: 1,
    paddingVertical: Spacing.three,
  },
  deviceName: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  deviceMeta: {
    marginTop: 2,
    fontSize: FontSize.footnote,
  },
  hint: {
    fontSize: FontSize.footnote,
    paddingHorizontal: Spacing.eight,
    marginTop: Spacing.three,
  },
  encrypt: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingHorizontal: Spacing.eight,
    marginTop: Spacing.six,
  },
  encryptCopy: {
    flex: 1,
    fontSize: FontSize.footnote,
    lineHeight: 18,
  },
  chrome: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DE4B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chromeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
  },
  art: {
    width: 230,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    position: 'absolute',
    left: 18,
    bottom: 8,
    width: 64,
    height: 112,
    borderRadius: 14,
    backgroundColor: '#D4F7DE',
    paddingTop: 10,
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  phoneSpeaker: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    left: 22,
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#B7E6C6',
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#F3FFF6',
    marginTop: 8,
  },
  laptop: {
    position: 'absolute',
    right: 6,
    bottom: 10,
    width: 132,
    alignItems: 'center',
  },
  laptopLid: {
    width: 118,
    height: 74,
    borderRadius: 10,
    backgroundColor: '#1DAB61',
    padding: 6,
  },
  laptopScreen: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: '#E7FBE9',
  },
  laptopBase: {
    width: 132,
    height: 8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: '#148A4C',
  },
  bubbleLeft: {
    position: 'absolute',
    left: 72,
    top: 18,
    width: 36,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  bubbleRight: {
    position: 'absolute',
    left: 98,
    top: 28,
    width: 42,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});
