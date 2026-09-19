import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Icon } from '@/components/icon';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { getFilterCount, useChatData, type ChatFilter } from '@/data';
import { useTheme } from '@/hooks/use-theme';

const FILTERS: { key: ChatFilter; label: string; showCount?: boolean }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread', showCount: true },
  { key: 'favourites', label: 'Favourites' },
  { key: 'groups', label: 'Groups', showCount: true },
  { key: 'communities', label: 'Communities', showCount: true },
];

type FilterChipsProps = {
  value: ChatFilter;
  onChange: (filter: ChatFilter) => void;
};

export function FilterChips({ value, onChange }: FilterChipsProps) {
  const theme = useTheme();
  useChatData();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {FILTERS.map(({ key, label, showCount }) => {
        const selected = key === value;
        const count = showCount ? getFilterCount(key) : 0;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.chip,
              {
                borderColor: selected ? theme.chipActiveBorder : theme.chipBorder,
                backgroundColor: selected ? theme.chipActiveBackground : 'transparent',
              },
              pressed && styles.pressed,
            ]}>
            <Text
              style={[
                styles.label,
                { color: selected ? theme.chipActiveText : theme.chipText },
              ]}>
              {label}
              {count > 0 && <Text style={styles.count}> {count}</Text>}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New filter"
        style={({ pressed }) => [
          styles.add,
          { borderColor: theme.chipBorder },
          pressed && styles.pressed,
        ]}>
        <Icon name="plus" size={14} color={theme.text} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three + 2,
    height: 28,
    justifyContent: 'center',
  },
  add: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.subhead,
    fontWeight: '600',
  },
  count: {
    fontSize: FontSize.footnote,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
