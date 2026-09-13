import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Icon, type IconName } from '@/components/icon';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { getRecentSearchContacts, type Contact } from '@/data';
import { useTheme } from '@/hooks/use-theme';

const MEDIA_SHORTCUTS: { label: string; icon: IconName }[] = [
  { label: 'Photos', icon: 'camera' },
  { label: 'GIFs', icon: 'gif' },
  { label: 'Links', icon: 'link' },
  { label: 'Videos', icon: 'video' },
  { label: 'Documents', icon: 'document' },
  { label: 'Audio', icon: 'audio' },
];

const RECENT_AVATAR_SIZE = 64;

type SearchSuggestionsProps = {
  onContactPress: (contact: Contact) => void;
  onMediaPress?: (label: string) => void;
};

/** Shown in search mode before the user types: recent searches + media shortcuts. */
export function SearchSuggestions({ onContactPress, onMediaPress }: SearchSuggestionsProps) {
  const theme = useTheme();
  const [recent, setRecent] = useState(getRecentSearchContacts);

  return (
    <View>
      {recent.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent searches</Text>
            <Pressable
              onPress={() => setRecent([])}
              style={({ pressed }) => [
                styles.clearAll,
                { backgroundColor: theme.backgroundElement },
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.clearAllText, { color: theme.text }]}>Clear all</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.recentList}>
            {recent.map((contact) => (
              <Pressable
                key={contact.id}
                onPress={() => onContactPress(contact)}
                style={({ pressed }) => [styles.recentItem, pressed && styles.pressed]}>
                <Avatar uri={contact.avatar} size={RECENT_AVATAR_SIZE} />
                <Text style={[styles.recentName, { color: theme.text }]} numberOfLines={2}>
                  {contact.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.mediaTitle, { color: theme.text }]}>Media</Text>
        {MEDIA_SHORTCUTS.map(({ label, icon }, index) => (
          <Pressable
            key={label}
            onPress={() => onMediaPress?.(label)}
            style={({ pressed }) => [
              styles.mediaRow,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}>
            <Icon name={icon} size={22} color={theme.accent} />
            <View
              style={[
                styles.mediaContent,
                index < MEDIA_SHORTCUTS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.separator,
                },
              ]}>
              <Text style={[styles.mediaLabel, { color: theme.text }]}>{label}</Text>
              <Icon name="northWest" size={18} color={theme.textSecondary} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: FontSize.title,
    fontWeight: '600',
  },
  mediaTitle: {
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
  },
  clearAll: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radius.pill,
  },
  clearAllText: {
    fontSize: FontSize.subhead,
    fontWeight: '500',
  },
  recentList: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  recentItem: {
    width: RECENT_AVATAR_SIZE + Spacing.eight,
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  recentName: {
    fontSize: FontSize.footnote,
    textAlign: 'center',
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.four,
    gap: Spacing.four,
  },
  mediaContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three + 2,
    paddingRight: Spacing.four,
  },
  mediaLabel: {
    fontSize: FontSize.body,
  },
  pressed: {
    opacity: 0.6,
  },
});
