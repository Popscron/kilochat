import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
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
import { getArchivedCount, getChatPreviews, useChatData, type ChatFilter, type ChatPreview } from '@/data';
import { getSnapshot, markAllRead } from '@/data/store';
import { markChatReadOnServer } from '@/api/client';
import { useTheme } from '@/hooks/use-theme';

const TITLE = 'Chats';
const META_AI_FAB = require('../../../assets/images/meta-ai-orbit.png');
const FAB_SIZE = 40;
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;

export default function ChatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [filter, setFilter] = useState<ChatFilter>('all');
  const data = useChatData();
  const previews = useMemo(() => getChatPreviews(filter), [filter, data.version]);

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

  const handleMarkAllRead = useCallback(() => {
    const unreadIds = getSnapshot()
      .chats.filter((chat) => chat.unreadCount > 0)
      .map((chat) => chat.id);
    markAllRead();
    unreadIds.forEach((id) => {
      markChatReadOnServer(id).catch(() => {});
    });
  }, []);

  return (
    <View
      ref={search.containerRef}
      collapsable={false}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        pointerEvents={search.isOpen ? 'none' : 'auto'}
        style={[styles.container, { paddingTop: insets.top }, contentStyle]}>
        <ChatsTopBar
          title={TITLE}
          scrollY={scrollY}
          onGenerate={() => router.push('/generator')}
          onMarkAllRead={handleMarkAllRead}
        />

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
          contentContainerStyle={{ paddingBottom: Spacing.eight + FAB_SIZE }}
        />
      </Animated.View>

      {!search.isOpen && (
        <Pressable
          accessibilityLabel="Meta AI"
          style={[
            styles.fab,
            { bottom: insets.bottom + TAB_BAR_HEIGHT - Spacing.five * 2, right: Spacing.four },
          ]}>
          <Image source={META_AI_FAB} style={styles.fabImage} contentFit="contain" />
        </Pressable>
      )}

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
  fab: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    zIndex: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabImage: {
    width: FAB_SIZE,
    height: FAB_SIZE,
  },
});
