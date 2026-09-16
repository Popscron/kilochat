import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { FontSize, Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LoginHelpScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={[styles.top, { paddingTop: insets.top + Spacing.one, borderBottomColor: theme.separator }]}>
        <Pressable accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Icon name="back" size={22} color={theme.icon} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Help</Text>
        <View style={styles.back} />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.six,
          paddingTop: Spacing.six,
          paddingBottom: insets.bottom + Spacing.eight,
        }}>
        <Text style={[styles.heading, { color: theme.text }]}>Verifying your number</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Choose your country, then enter your phone number. Don’t include the country code — that’s
          already shown next to the field.
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          For Ghana, you can type 0535899507 or 535899507. Next confirms the full international
          number before signing you in.
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Carrier charges may apply if a verification SMS is sent. Make sure the country and number
          are correct so you don’t have to start over.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  top: {
    minHeight: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {
    width: Layout.headerIconButtonSize,
    height: Layout.headerIconButtonSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  heading: {
    fontSize: FontSize.title,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  body: {
    fontSize: FontSize.subhead,
    lineHeight: 22,
    marginBottom: Spacing.four,
  },
});
