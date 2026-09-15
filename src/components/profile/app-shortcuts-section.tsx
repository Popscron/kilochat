import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AppShortcut = {
  key: string;
  label: string;
  icon: IconName;
};

type AppShortcutsSectionProps = {
  title: string;
  apps: AppShortcut[];
  onAppPress?: (key: string) => void;
};

/** Card with a row of round app icons ("Also from Meta"). */
export function AppShortcutsSection({ title, apps, onAppPress }: AppShortcutsSectionProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.groupedCard }]}>
      <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
        {title}
      </Text>

      <View style={styles.apps}>
        {apps.map(({ key, label, icon }) => (
          <Pressable
            key={key}
            onPress={() => onAppPress?.(key)}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [styles.app, pressed && styles.pressed]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.backgroundElement }]}>
              <Icon name={icon} size={28} color={theme.icon} />
            </View>
            <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const ICON_CIRCLE_SIZE = 46;

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.eight,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    paddingHorizontal: Spacing.four,
    borderCurve: 'continuous',
  },
  title: {
    fontSize: FontSize.body,
    marginBottom: Spacing.four,
  },
  apps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  app: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.subhead,
  },
  pressed: {
    opacity: 0.6,
  },
});
