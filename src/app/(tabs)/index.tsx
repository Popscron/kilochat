import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatListItem } from '@/components/chat-list/chat-list-item';
import { ChatsListHeader } from '@/components/chat-list/chats-list-header';
import { ChatsTopBar } from '@/components/chat-list/chats-top-bar';
import { SearchOverlay } from '@/components/search/search-overlay';
import { useSearchTransition } from '@/components/search/use-search-transition';
import { Layout, Spacing } from '@/constants/theme';
import { getArchivedCount, getChatPreviews, type ChatFilter, type ChatPreview } from '@/data';
import { useTheme } from '@/hooks/use-theme';

const TITLE = 'Chats';

export default function ChatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [filter, setFilter] = useState<ChatFilter>('all');
  const previews = useMemo(() => getChatPreviews(filter), [filter]);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  const search = useSearchTransition(insets.top + Spacing.two);
  const { progress, startY, targetY } = search;

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.7], [1, 0], 'clamp'),
    transform: [
      { translateY: interpolate(progress.get(), [0, 1], [0, targetY - startY.get()]) },
    ],
  }));

  const openChat = useCallback(
    (chatId: string) => router.push({ pathname: '/chat/[id]', params: { id: chatId } }),
    [router]
  );

  return (
    <View
      ref={search.containerRef}
      collapsable={false}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        pointerEvents={search.isOpen ? 'none' : 'auto'}
        style={[styles.container, { paddingTop: insets.top }, contentStyle]}>
        <ChatsTopBar title={TITLE} scrollY={scrollY} />

        <Animated.FlatList<ChatPreview>
          data={previews}
          keyExtractor={(item) => item.chat.id}
          renderItem={({ item }) => <ChatListItem preview={item} onPress={openChat} />}
          ListHeaderComponent={
            <ChatsListHeader
              title={TITLE}
              filter={filter}
              onFilterChange={setFilter}
              onSearchPress={search.open}
              searchAnchorRef={search.anchorRef}
              archivedCount={getArchivedCount()}
            />
          }
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          style={styles.list}
          contentContainerStyle={{ paddingBottom: Spacing.eight }}
        />
      </Animated.View>

      {search.isOpen && <SearchOverlay search={search} onChatPress={openChat} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
});
