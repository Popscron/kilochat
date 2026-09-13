import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { FontSize, Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PlaceholderScreenProps = {
  title: string;
  icon: IconName;
  message?: string;
};

/** Temporary screen for tabs that are not implemented yet. */
export function PlaceholderScreen({ title, icon, message }: PlaceholderScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Layout.topBarHeight, paddingBottom: insets.bottom },
      ]}>
      <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.empty}>
        <View style={[styles.iconCircle, { backgroundColor: theme.chipActiveBackground }]}>
          <Icon name={icon} size={36} color={theme.accent} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Coming soon</Text>
        <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
          {message ?? `${title} will be available in a future update.`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  title: {
    fontSize: FontSize.largeTitle,
    fontWeight: '700',
    paddingHorizontal: Spacing.four,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.eight,
    paddingBottom: Spacing.eight * 2,
    gap: Spacing.two,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: FontSize.title,
    fontWeight: '600',
  },
  emptyMessage: {
    fontSize: FontSize.subhead,
    textAlign: 'center',
  },
});
