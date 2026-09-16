import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/context';
import { GlassIconButton } from '@/components/glass-surface';
import { Icon } from '@/components/icon';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Row = {
  key: string;
  label: string;
  destructive?: boolean;
  chevron?: boolean;
};

const LOGIN: Row[] = [
  { key: 'passkeys', label: 'Passkeys', chevron: true },
  { key: 'password', label: 'Password', chevron: true },
  { key: 'email', label: 'Email address', chevron: true },
  { key: 'two-step', label: 'Two-step verification', chevron: true },
  { key: 'security-notifications', label: 'Security notifications', chevron: true },
];

const YOUR_ACCOUNT: Row[] = [
  { key: 'username', label: 'Username', chevron: true },
  { key: 'change-phone', label: 'Change phone number', chevron: true },
  { key: 'ad-preferences', label: 'Ad preferences for Status & Channels', chevron: true },
  { key: 'log-out', label: 'Log out', destructive: true },
];

export default function AccountScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();

  const onRow = (key: string) => {
    if (key !== 'log-out') return;
    Alert.alert('Log out?', 'You will need your phone number to log back in.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.groupedBackground }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.one }]}>
        <GlassIconButton icon="back" accessibilityLabel="Back" onPress={() => router.back()} />
        <Text style={[styles.title, { color: theme.text }]}>Account</Text>
        <GlassIconButton icon="more" accessibilityLabel="More options" />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: Spacing.five,
          paddingBottom: insets.bottom + Spacing.eight,
        }}>
        <Card>
          <AccountRow
            label="Add account"
            chevron
            isLast
            onPress={() => onRow('add-account')}
            color={theme.text}
            chevronColor={theme.textSecondary}
            pressedColor={theme.groupedCardPressed}
            separatorColor={theme.separator}
          />
        </Card>

        <Text style={[styles.section, { color: theme.textSecondary }]}>Login and security</Text>
        <Card>
          {LOGIN.map((row, index) => (
            <AccountRow
              key={row.key}
              label={row.label}
              chevron={row.chevron}
              isLast={index === LOGIN.length - 1}
              onPress={() => onRow(row.key)}
              color={theme.text}
              chevronColor={theme.textSecondary}
              pressedColor={theme.groupedCardPressed}
              separatorColor={theme.separator}
            />
          ))}
        </Card>

        <Text style={[styles.section, { color: theme.textSecondary }]}>Your account</Text>
        <Card>
          {YOUR_ACCOUNT.map((row, index) => (
            <AccountRow
              key={row.key}
              label={row.label}
              chevron={row.chevron}
              destructive={row.destructive}
              isLast={index === YOUR_ACCOUNT.length - 1}
              onPress={() => onRow(row.key)}
              color={row.destructive ? '#FF3B30' : theme.text}
              chevronColor={theme.textSecondary}
              pressedColor={theme.groupedCardPressed}
              separatorColor={theme.separator}
            />
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

function Card({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.groupedCard }]}>{children}</View>;
}

function AccountRow({
  label,
  chevron,
  destructive,
  isLast,
  onPress,
  color,
  chevronColor,
  pressedColor,
  separatorColor,
}: {
  label: string;
  chevron?: boolean;
  destructive?: boolean;
  isLast: boolean;
  onPress: () => void;
  color: string;
  chevronColor: string;
  pressedColor: string;
  separatorColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: pressedColor }]}>
      <View
        style={[
          styles.rowInner,
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: separatorColor },
        ]}>
        <Text style={[styles.label, { color }, destructive && styles.destructive]} numberOfLines={1}>
          {label}
        </Text>
        {chevron ? <Icon name="chevronRight" size={15} color={chevronColor} /> : null}
      </View>
    </Pressable>
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
  card: {
    marginHorizontal: Spacing.four,
    borderRadius: Radius.card,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  section: {
    fontSize: FontSize.footnote,
    paddingHorizontal: Spacing.eight,
    marginTop: Spacing.six,
    marginBottom: Spacing.two,
  },
  row: {
    paddingLeft: Spacing.five,
  },
  rowInner: {
    minHeight: Layout.settingsRowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.four,
    paddingVertical: Spacing.three,
  },
  label: {
    flex: 1,
    fontSize: FontSize.body,
  },
  destructive: {
    fontWeight: '400',
  },
});
