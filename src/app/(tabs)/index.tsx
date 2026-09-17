import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { markChatsReadAndSync } from '@/api/read-sync';
import { ChatsListHeader } from '@/components/chat-list/chats-list-header';
import { ChatsMenu, type ChatsMenuItem } from '@/components/chat-list/chats-menu';
import { ChatsTopBar } from '@/components/chat-list/chats-top-bar';
import {
  SELECTION_TOOLBAR_HEIGHT,
  SelectionToolbar,
} from '@/components/chat-list/selection-toolbar';
import { SwipeableChatListItem } from '@/components/chat-list/swipeable-chat-list-item';
import { closeOpenSwipeableRow } from '@/components/chat-list/swipeable-row';
import { SearchOverlay } from '@/components/search/search-overlay';
import { useSearchTransition } from '@/components/search/use-search-transition';
import { useTabBarVisibility } from '@/components/tab-bar-visibility';
import { Layout, Motion, Spacing } from '@/constants/theme';
import {
  getArchivedCount,
  getChatPreviews,
  isChatUnread,
  useChatData,
  type ChatFilter,
  type ChatPreview,
} from '@/data';
import { deleteChats, getSnapshot, setChatsArchived } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';

const TITLE = 'Chats';
const META_AI_FAB = require('../../../assets/images/meta-ai-orbit.png');
const FAB_SIZE = 40;
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;
const selectionTiming = { duration: Motion.fast + 60, easing: Easing.out(Easing.cubic) };
const noop = () => {};

export default function ChatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setHidden: setTabBarHidden } = useTabBarVisibility();

  const [filter, setFilter] = useState<ChatFilter>('all');
  const data = useChatData();
  const previews = useMemo(() => getChatPreviews(filter), [filter, data.version]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());
  const selectionProgress = useSharedValue(0);

  // Chats archived or deleted while selected drop out of the selection.
  const selected = previews.filter((preview) => selectedIds.has(preview.chat.id));
  const selectedChatIds = selected.map((preview) => preview.chat.id);
  const title = !selecting
    ? TITLE
    : selected.length > 0
      ? `${selected.length} selected`
      : 'Select chats';

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.set(event.contentOffset.y);
    },
    onBeginDrag: () => {
      scheduleOnRN(closeOpenSwipeableRow);
    },
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

  const openChatActions = useCallback(
    (chatId: string) => router.push({ pathname: '/chat-actions/[id]', params: { id: chatId } }),
    [router]
  );

  const handleMarkAllRead = useCallback(() => {
    markChatsReadAndSync(getSnapshot().chats.map((chat) => chat.id));
  }, []);

  const startSelecting = useCallback(() => {
    closeOpenSwipeableRow();
    setSelectedIds(new Set());
    setSelecting(true);
    setTabBarHidden(true);
    selectionProgress.set(withTiming(1, selectionTiming));
  }, [selectionProgress, setTabBarHidden]);

  const stopSelecting = useCallback(() => {
    setSelecting(false);
    setSelectedIds(new Set());
    setTabBarHidden(false);
    selectionProgress.set(withTiming(0, selectionTiming));
  }, [selectionProgress, setTabBarHidden]);

  const toggleSelected = useCallback((chatId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(chatId)) next.delete(chatId);
      else next.add(chatId);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!selecting) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      stopSelecting();
      return true;
    });
    return () => subscription.remove();
  }, [selecting, stopSelecting]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const menuItems: ChatsMenuItem[] = [
    { key: 'select', label: 'Select chats', icon: 'selectCircle', onPress: startSelecting },
    { key: 'read-all', label: 'Read all', icon: 'readAll', onPress: handleMarkAllRead },
    {
      key: 'generate',
      label: 'Generat',
      icon: 'metaAi',
      onPress: () => router.push('/generator'),
    },
  ];

  const archiveSelected = () => {
    setChatsArchived(selectedChatIds, true);
    stopSelecting();
  };

  const readSelected = () => {
    markChatsReadAndSync(selectedChatIds);
    stopSelecting();
  };

  const deleteSelected = () => {
    const count = selectedChatIds.length;
    Alert.alert(count === 1 ? 'Delete this chat?' : `Delete ${count} chats?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: count === 1 ? 'Delete chat' : 'Delete chats',
        style: 'destructive',
        onPress: () => {
          deleteChats(selectedChatIds);
          stopSelecting();
        },
      },
    ]);
  };

  return (
    <View
      ref={search.containerRef}
      collapsable={false}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        pointerEvents={search.isOpen ? 'none' : 'auto'}
        style={[styles.container, { paddingTop: insets.top }, contentStyle]}>
        <ChatsTopBar
          title={title}
          scrollY={scrollY}
          selecting={selecting}
          onDonePress={stopSelecting}
          onMorePress={() => setMenuOpen(true)}
        />

        <Animated.FlatList<ChatPreview>
          data={previews}
          extraData={selectedIds}
          keyExtractor={(item) => item.chat.id}
          renderItem={({ item }) => (
            <SwipeableChatListItem
              preview={item}
              onPress={selecting ? toggleSelected : openChat}
              onMorePress={openChatActions}
              selectionProgress={selectionProgress}
              selecting={selecting}
              selected={selectedIds.has(item.chat.id)}
            />
          )}
          ListHeaderComponent={
            <ChatsListHeader
              title={title}
              filter={filter}
              onFilterChange={setFilter}
              onSearchPress={selecting ? noop : search.open}
              searchAnchorRef={search.anchorRef}
              archivedCount={getArchivedCount()}
            />
          }
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          style={styles.list}
          contentContainerStyle={{
            paddingBottom: Spacing.eight + (selecting ? SELECTION_TOOLBAR_HEIGHT : FAB_SIZE),
          }}
        />
      </Animated.View>

      {/* The Delete button takes this corner while selecting. */}
      {!search.isOpen && !selecting && (
        <Pressable
          accessibilityLabel="Meta AI"
          style={[
            styles.fab,
            { bottom: insets.bottom + TAB_BAR_HEIGHT - Spacing.five * 2, right: Spacing.four },
          ]}>
          <Image source={META_AI_FAB} style={styles.fabImage} contentFit="contain" />
        </Pressable>
      )}

      <SelectionToolbar
        visible={selecting}
        archive={{ label: 'Archive', onPress: archiveSelected, disabled: selected.length === 0 }}
        read={{
          label: 'Read',
          onPress: readSelected,
          disabled: !selected.some((preview) => isChatUnread(preview.chat)),
        }}
        remove={{ label: 'Delete', onPress: deleteSelected, disabled: selected.length === 0 }}
      />

      <ChatsMenu visible={menuOpen} items={menuItems} onClose={closeMenu} />

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
