import { Link } from 'expo-router';
import { memo } from 'react';
import { Alert, useWindowDimensions } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { markChatsReadAndSync } from '@/api/read-sync';
import { ChatListItem } from '@/components/chat-list/chat-list-item';
import { SwipeableRow, type SwipeAction } from '@/components/chat-list/swipeable-row';
import { getChatTitle, isChatUnread, type ChatPreview } from '@/data';
import {
  clearChat,
  deleteChats,
  markChatUnread,
  MAX_PINNED_CHATS,
  setChatsArchived,
  toggleChatFavourite,
  toggleChatMuted,
  toggleChatPinned,
} from '@/data/store';
import { useTheme } from '@/hooks/use-theme';

type SwipeableChatListItemProps = {
  preview: ChatPreview;
  onPress: (chatId: string) => void;
  onMorePress: (chatId: string) => void;
  selectionProgress: SharedValue<number>;
  selecting: boolean;
  selected: boolean;
};

/** Share of the screen height the hold-to-preview chat takes, as in WhatsApp. */
const PREVIEW_HEIGHT_RATIO = 0.6;

const confirm = (message: string, action: string, onConfirm: () => void) =>
  Alert.alert(message, undefined, [
    { text: 'Cancel', style: 'cancel' },
    { text: action, style: 'destructive', onPress: onConfirm },
  ]);

/**
 * Chat row with WhatsApp's swipe actions:
 * swipe right → Read/Unread and Pin, swipe left → More and Archive.
 * On iOS, holding the row previews the chat with a context menu.
 */
export const SwipeableChatListItem = memo(function SwipeableChatListItem({
  preview,
  onPress,
  onMorePress,
  selectionProgress,
  selecting,
  selected,
}: SwipeableChatListItemProps) {
  const theme = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const { chat } = preview;
  const unread = isChatUnread(chat);
  const title = getChatTitle(chat);
  const isGroup = chat.type === 'group';

  const toggleRead = () => (unread ? markChatsReadAndSync([chat.id]) : markChatUnread(chat.id));

  const leftActions: SwipeAction[] = [
    {
      key: 'read',
      label: unread ? 'Read' : 'Unread',
      icon: unread ? 'markRead' : 'markUnread',
      color: theme.swipeRead,
      onPress: toggleRead,
    },
    {
      key: 'pin',
      label: chat.pinned ? 'Unpin' : 'Pin',
      icon: chat.pinned ? 'unpin' : 'pin',
      color: theme.swipeNeutral,
      onPress: () => {
        if (!toggleChatPinned(chat.id)) {
          Alert.alert(`You can only pin up to ${MAX_PINNED_CHATS} chats`);
        }
      },
    },
  ];

  const rightActions: SwipeAction[] = [
    {
      key: 'more',
      label: 'More',
      icon: 'moreFill',
      color: theme.swipeNeutral,
      onPress: () => onMorePress(chat.id),
    },
    {
      key: 'archive',
      label: 'Archive',
      icon: 'archiveFill',
      color: theme.swipeRead,
      removesRow: true,
      onPress: () => setChatsArchived([chat.id], true),
    },
  ];

  const row = (
    <ChatListItem
      preview={preview}
      onPress={onPress}
      selectionProgress={selectionProgress}
      selecting={selecting}
      selected={selected}
    />
  );

  return (
    <SwipeableRow leftActions={leftActions} rightActions={rightActions} enabled={!selecting}>
      {selecting ? (
        row
      ) : (
        <Link href={{ pathname: '/chat/[id]', params: { id: chat.id } }} asChild>
          <Link.Trigger>
            <ChatRowTrigger
              preview={preview}
              onOpen={onPress}
              selectionProgress={selectionProgress}
            />
          </Link.Trigger>
          <Link.Preview style={{ height: screenHeight * PREVIEW_HEIGHT_RATIO }} />
          <Link.Menu>
            <Link.MenuAction icon={unread ? 'message' : 'message.badge'} onPress={toggleRead}>
              {unread ? 'Mark as read' : 'Mark as unread'}
            </Link.MenuAction>
            <Link.MenuAction icon="archivebox" onPress={() => setChatsArchived([chat.id], true)}>
              Archive
            </Link.MenuAction>
            <Link.MenuAction
              icon={chat.muted ? 'bell' : 'bell.slash'}
              onPress={() => toggleChatMuted(chat.id)}>
              {chat.muted ? 'Unmute' : 'Mute'}
            </Link.MenuAction>
            <Link.MenuAction icon="lock">Lock chat</Link.MenuAction>
            <Link.MenuAction
              icon={chat.favourite ? 'heart.slash' : 'heart'}
              onPress={() => toggleChatFavourite(chat.id)}>
              {chat.favourite ? 'Remove from Favourites' : 'Add to Favourites'}
            </Link.MenuAction>
            <Link.MenuAction icon="person.crop.rectangle.stack">Add to list</Link.MenuAction>
            {isGroup ? (
              <Link.MenuAction
                icon="rectangle.portrait.and.arrow.right"
                onPress={() => confirm(`Exit "${title}"?`, 'Exit group', () => {})}>
                Exit group
              </Link.MenuAction>
            ) : (
              <Link.MenuAction
                icon="nosign"
                onPress={() => confirm(`Block ${title}?`, 'Block', () => {})}>
                {`Block ${title}`}
              </Link.MenuAction>
            )}
            <Link.MenuAction
              icon="xmark.circle"
              onPress={() => confirm('Clear this chat?', 'Clear chat', () => clearChat(chat.id))}>
              Clear chat
            </Link.MenuAction>
            <Link.MenuAction
              icon="trash"
              destructive
              onPress={() =>
                confirm(`Delete chat with "${title}"?`, 'Delete chat', () => deleteChats([chat.id]))
              }>
              Delete chat
            </Link.MenuAction>
          </Link.Menu>
        </Link>
      )}
    </SwipeableRow>
  );
});

type ChatRowTriggerProps = {
  preview: ChatPreview;
  onOpen: (chatId: string) => void;
  selectionProgress: SharedValue<number>;
};

/**
 * `Link` injects its own `onPress`, `href` and `style` here; they're dropped so a
 * tap keeps using the screen's handler, and the link only drives the preview.
 */
function ChatRowTrigger({ preview, onOpen, selectionProgress }: ChatRowTriggerProps) {
  return <ChatListItem preview={preview} onPress={onOpen} selectionProgress={selectionProgress} />;
}
