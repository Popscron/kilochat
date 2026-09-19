import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { Avatar } from '@/components/avatar';
import { MessagePreview } from '@/components/chat-list/message-preview';
import { HighlightedText } from '@/components/highlighted-text';
import { Icon } from '@/components/icon';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { isChatUnread, type ChatPreview } from '@/data';
import { updateChatAvatar } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { chooseContactPhoto } from '@/profile/pick-photo';
import { formatChatListDate } from '@/utils/format';

type ChatListItemProps = {
  preview: ChatPreview;
  onPress: (chatId: string) => void;
  /** When set, the title highlights the matching text (search results). */
  highlight?: string;
  /** 0 → 1 as the list enters selection mode; slides the checkboxes in. */
  selectionProgress?: SharedValue<number>;
  selecting?: boolean;
  selected?: boolean;
};

export const ChatListItem = memo(function ChatListItem({
  preview,
  onPress,
  highlight,
  selectionProgress,
  selecting = false,
  selected = false,
}: ChatListItemProps) {
  const theme = useTheme();
  const { chat, title, avatar, lastMessage, statusRing } = preview;
  const hasUnread = isChatUnread(chat);

  const selectionStyle = useAnimatedStyle(() => {
    const progress = selectionProgress?.get() ?? 0;
    return { width: progress * Layout.selectionColumn, opacity: progress };
  });

  return (
    <Pressable
      onPress={() => onPress(chat.id)}
      accessibilityRole={selecting ? 'checkbox' : 'button'}
      accessibilityState={selecting ? { checked: selected } : undefined}
      accessibilityLabel={`Chat with ${title}`}
      style={({ pressed }) => [
        styles.row,
        selected
          ? { backgroundColor: theme.rowSelected }
          : pressed && { backgroundColor: theme.backgroundElement },
      ]}>
      {selectionProgress && (
        <Animated.View style={[styles.selectionSlot, selectionStyle]}>
          <View
            style={[
              styles.checkbox,
              selected
                ? { backgroundColor: theme.accent, borderColor: theme.accent }
                : { borderColor: theme.checkboxBorder },
            ]}>
            {selected && <Icon name="check" size={13} color="#FFFFFF" />}
          </View>
        </Animated.View>
      )}
      <Pressable
        onPress={() => {
          if (selecting) {
            onPress(chat.id);
            return;
          }
          chooseContactPhoto((next) => updateChatAvatar(chat.id, next), `Photo for ${title}`);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Change photo for ${title}`}>
        <Avatar
          uri={avatar}
          size={Layout.chatAvatarSize}
          isGroup={chat.type === 'group'}
          showTimerBadge={chat.disappearingMessages}
          statusRing={statusRing}
        />
      </Pressable>

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
            {chat.pinned && <Icon name="pin" size={17} color={theme.textSecondary} />}
            {hasUnread && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: chat.muted ? theme.textTertiary : theme.accentBright },
                ]}>
                {chat.unreadCount > 0 && (
                  <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>{chat.unreadCount}</Text>
                )}
              </View>
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
  selectionSlot: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
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
