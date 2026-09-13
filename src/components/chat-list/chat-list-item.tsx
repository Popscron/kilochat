import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { MessagePreview } from '@/components/chat-list/message-preview';
import { HighlightedText } from '@/components/highlighted-text';
import { Icon } from '@/components/icon';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import type { ChatPreview } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import { formatChatListDate } from '@/utils/format';

type ChatListItemProps = {
  preview: ChatPreview;
  onPress: (chatId: string) => void;
  /** When set, the title highlights the matching text (search results). */
  highlight?: string;
};

export const ChatListItem = memo(function ChatListItem({
  preview,
  onPress,
  highlight,
}: ChatListItemProps) {
  const theme = useTheme();
  const { chat, title, avatar, lastMessage } = preview;
  const hasUnread = chat.unreadCount > 0;

  return (
    <Pressable
      onPress={() => onPress(chat.id)}
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${title}`}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.backgroundElement },
      ]}>
      <Avatar
        uri={avatar}
        size={Layout.chatAvatarSize}
        isGroup={chat.type === 'group'}
        showTimerBadge={chat.disappearingMessages}
      />

      <View style={[styles.content, { borderBottomColor: theme.separator }]}>
        <View style={styles.titleRow}>
          <HighlightedText
            text={title}
            query={highlight ?? ''}
            highlightStyle={{ color: theme.accent }}
            style={[styles.title, { color: theme.text }]}
            numberOfLines={1}
          />
          {lastMessage && (
            <Text
              style={[
                styles.time,
                { color: hasUnread ? theme.accent : theme.textSecondary },
              ]}>
              {formatChatListDate(lastMessage.createdAt)}
            </Text>
          )}
        </View>

        <View style={styles.previewRow}>
          <MessagePreview preview={preview} />
          <View style={styles.indicators}>
            {chat.muted && <Icon name="muted" size={15} color={theme.textTertiary} />}
            {hasUnread ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: chat.muted ? theme.textTertiary : theme.accentBright },
                ]}>
                <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>{chat.unreadCount}</Text>
              </View>
            ) : (
              chat.pinned && <Icon name="pin" size={15} color={theme.textTertiary} />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.four,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.three,
    paddingVertical: Layout.chatRowVerticalPadding,
    paddingRight: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: Layout.chatAvatarSize + Layout.chatRowVerticalPadding * 2 + 4,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  time: {
    fontSize: FontSize.subhead - 1,
  },
  previewRow: {
    flexDirection: 'row',
    marginTop: Spacing.half,
    gap: Spacing.two,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    minHeight: 22,
    alignSelf: 'flex-start',
    paddingTop: 2,
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
    fontSize: FontSize.footnote,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
