import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassIconButton } from '@/components/glass-surface';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { getCurrentUser } from '@/data';
import { useTheme } from '@/hooks/use-theme';

export default function LinkDeviceScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const phone = getCurrentUser().phone;

  return (
    <View style={[styles.screen, { backgroundColor: theme.groupedBackground }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.one }]}>
        <GlassIconButton icon="back" accessibilityLabel="Back" onPress={() => router.back()} />
        <Text style={[styles.title, { color: theme.text }]}>Link a device</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <View style={[styles.card, { backgroundColor: theme.groupedCard }]}>
          <View style={[styles.qr, { borderColor: theme.separator }]}>
            {Array.from({ length: 8 }, (_, row) => (
              <View key={row} style={styles.qrRow}>
                {Array.from({ length: 8 }, (_, col) => (
                  <View
                    key={col}
                    style={[
                      styles.qrCell,
                      { backgroundColor: (row + col + (phone?.length || 0)) % 3 === 0 ? theme.text : 'transparent' },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
          <Text style={[styles.lead, { color: theme.text }]}>Use Chatbox on other devices</Text>
          <Text style={[styles.copy, { color: theme.textSecondary }]}>
            Open Chatbox on your computer or another phone and log in with {phone || 'this number'}. It will show up
            under Linked devices, and you can log it out from here anytime.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.done, { backgroundColor: theme.accent, opacity: pressed ? 0.88 : 1 }]}>
            <Text style={styles.doneLabel}>OK</Text>
          </Pressable>
        </View>
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
  body: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
  },
  card: {
    borderRadius: Radius.card,
    padding: Spacing.six,
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  qr: {
    width: 180,
    height: 180,
    borderWidth: 8,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  qrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  qrCell: {
    width: 12,
    height: 12,
    borderRadius: 1,
  },
  lead: {
    marginTop: Spacing.six,
    fontSize: FontSize.title,
    fontWeight: '700',
    textAlign: 'center',
  },
  copy: {
    marginTop: Spacing.three,
    fontSize: FontSize.subhead,
    lineHeight: 22,
    textAlign: 'center',
  },
  done: {
    marginTop: Spacing.six,
    alignSelf: 'stretch',
    height: 50,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneLabel: {
    color: '#FFFFFF',
    fontSize: FontSize.body,
    fontWeight: '700',
  },
});
