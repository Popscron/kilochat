import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SettingsItem = {
  key: string;
  label: string;
  icon: IconName;
  subtitle?: string;
  /** Grey count badge before the chevron (e.g. unread settings tips). */
  badge?: number;
  /** Green "new" dot before the trailing arrow. */
  dot?: boolean;
  /** Opens outside the app, so it shows ↗ instead of a chevron. */
  external?: boolean;
};

type SettingsSectionProps = {
  items: SettingsItem[];
  onItemPress?: (key: string) => void;
};

/** Rounded inset card of rows, like WhatsApp's "You" tab on iOS. */
export function SettingsSection({ items, onItemPress }: SettingsSectionProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.groupedCard }]}>
      {items.map((item, index) => (
        <SettingsRow
          key={item.key}
          item={item}
          isLast={index === items.length - 1}
          onPress={onItemPress}
        />
      ))}
    </View>
  );
}

type SettingsRowProps = {
  item: SettingsItem;
  isLast: boolean;
  onPress?: (key: string) => void;
};

const SettingsRow = memo(function SettingsRow({ item, isLast, onPress }: SettingsRowProps) {
  const theme = useTheme();
  const { key, label, icon, subtitle, badge, dot, external } = item;

  return (
    <Pressable
      onPress={() => onPress?.(key)}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge} new` : label}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.groupedCardPressed }]}>
      <View style={styles.iconColumn}>
        <Icon name={icon} size={24} color={theme.icon} />
      </View>

      <View
        style={[
          styles.content,
          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.separator },
        ]}>
        <View style={styles.labels}>
          <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
            {label}
          </Text>
          {!!subtitle && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
          )}
        </View>

        <View style={styles.trailing}>
          {dot && <View style={[styles.dot, { backgroundColor: theme.accentBright }]} />}
          {!!badge && (
            <View style={[styles.badge, { backgroundColor: theme.neutralBadge }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          <Icon
            name={external ? 'external' : 'chevronRight'}
            size={external ? 16 : 15}
            color={theme.textSecondary}
          />
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.eight,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.four,
  },
  iconColumn: {
    width: Layout.settingsIconColumn,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Layout.settingsRowHeight,
    paddingVertical: Spacing.three,
    paddingRight: Spacing.four,
    gap: Spacing.three,
  },
  labels: {
    flex: 1,
    gap: Spacing.half,
  },
  label: {
    fontSize: FontSize.body,
  },
  subtitle: {
    fontSize: FontSize.subhead,
    lineHeight: 22,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: FontSize.footnote,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
