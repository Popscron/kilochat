import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { SearchFieldInput } from '@/components/search/search-field';
import { SearchResults } from '@/components/search/search-results';
import { SearchSuggestions } from '@/components/search/search-suggestions';
import type { SearchTransition } from '@/components/search/use-search-transition';
import { HitSlop, Layout, Spacing } from '@/constants/theme';
import { getDirectChatForContact } from '@/data';
import { useTheme } from '@/hooks/use-theme';

const BACK_BUTTON_WIDTH = 40;

type SearchOverlayProps = {
  search: SearchTransition;
  onChatPress: (chatId: string) => void;
};

export function SearchOverlay({ search, onChatPress }: SearchOverlayProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { progress, startY, targetY, query, setQuery, close } = search;

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.6], [0, 1], 'clamp'),
  }));

  // The pill travels from its spot in the list header up to the top.
  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [startY.get(), targetY]) }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0.3, 1], [0, 1], 'clamp'),
    transform: [{ translateX: interpolate(progress.get(), [0, 1], [-BACK_BUTTON_WIDTH, 0]) }],
  }));

  const fieldStyle = useAnimatedStyle(() => ({
    marginLeft: interpolate(progress.get(), [0, 1], [Spacing.four, BACK_BUTTON_WIDTH + Spacing.two]),
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0.35, 1], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [Spacing.eight, 0]) }],
  }));

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: theme.background }, backgroundStyle]}
      />

      <Animated.View
        style={[
          styles.body,
          { top: targetY + Layout.searchFieldHeight + Spacing.two },
          bodyStyle,
        ]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.six }}>
          {query.trim() ? (
            <SearchResults query={query} onChatPress={onChatPress} />
          ) : (
            <SearchSuggestions
              onContactPress={(contact) => {
                const chat = getDirectChatForContact(contact.id);
                if (chat) onChatPress(chat.id);
              }}
            />
          )}
        </ScrollView>
      </Animated.View>

      <Animated.View style={[styles.row, rowStyle]}>
        <Animated.View style={[styles.back, backStyle]}>
          <Pressable
            onPress={close}
            hitSlop={HitSlop}
            accessibilityRole="button"
            accessibilityLabel="Close search">
            <Icon name="back" size={22} color={theme.icon} />
          </Pressable>
        </Animated.View>
        <Animated.View style={[styles.field, fieldStyle]}>
          <SearchFieldInput value={query} onChangeText={setQuery} />
        </Animated.View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Layout.searchFieldHeight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    position: 'absolute',
    left: Spacing.four,
    width: BACK_BUTTON_WIDTH,
    height: '100%',
    justifyContent: 'center',
  },
  field: {
    flex: 1,
    marginRight: Spacing.four,
  },
  body: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
