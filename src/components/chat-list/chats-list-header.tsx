import type { Ref } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FilterChips } from '@/components/chat-list/filter-chips';
import { Icon } from '@/components/icon';
import { SearchFieldButton } from '@/components/search/search-field';
import { FontSize, Layout, Spacing } from '@/constants/theme';
import type { ChatFilter } from '@/data';
import { useTheme } from '@/hooks/use-theme';

type ChatsListHeaderProps = {
  title: string;
  filter: ChatFilter;
  onFilterChange: (filter: ChatFilter) => void;
  onSearchPress: () => void;
  searchAnchorRef: Ref<View>;
  archivedCount: number;
  onArchivedPress?: () => void;
};

export function ChatsListHeader({
  title,
  filter,
  onFilterChange,
  onSearchPress,
  searchAnchorRef,
  archivedCount,
  onArchivedPress,
}: ChatsListHeaderProps) {
  const theme = useTheme();

  return (
    <View>
      <Text style={[styles.largeTitle, { color: theme.text }]} accessibilityRole="header">
        {title}
      </Text>

      <SearchFieldButton ref={searchAnchorRef} onPress={onSearchPress} />

      <View style={styles.chips}>
        <FilterChips value={filter} onChange={onFilterChange} />
      </View>

      {archivedCount > 0 && filter === 'all' && (
        <Pressable
          onPress={onArchivedPress}
          style={({ pressed }) => [
            styles.archived,
            pressed && { backgroundColor: theme.backgroundElement },
          ]}>
          <View style={styles.archivedIcon}>
            <Icon name="archive" size={20} color={theme.textSecondary} />
          </View>
          <View style={[styles.archivedContent, { borderBottomColor: theme.separator }]}>
            <Text style={[styles.archivedLabel, { color: theme.text }]}>Archived</Text>
            <Text style={[styles.archivedCount, { color: theme.textSecondary }]}>
              {archivedCount}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  largeTitle: {
    fontSize: FontSize.largeTitle,
    fontWeight: '700',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  chips: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  archived: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.four,
  },
  archivedIcon: {
    width: Layout.chatAvatarSize,
    alignItems: 'center',
  },
  archivedContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: Spacing.three,
    paddingVertical: Spacing.four,
    paddingRight: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  archivedLabel: {
    fontSize: FontSize.body,
    fontWeight: '500',
  },
  archivedCount: {
    fontSize: FontSize.subhead - 1,
  },
});
