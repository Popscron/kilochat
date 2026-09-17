import { useIsPreview, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHAT_HEADER_HEIGHT, ChatHeader } from '@/components/chat/chat-header';
import { Composer } from '@/components/chat/composer';
import { DateSeparator } from '@/components/chat/date-separator';
import { MessageBubble } from '@/components/chat/message-bubble';
import { PinnedBanner } from '@/components/chat/pinned-banner';
import { sendMessage } from '@/api/client';
import { FontSize, Spacing } from '@/constants/theme';
import {
  getChat,
  getChatAvatar,
  getChatStatusRing,
  getChatTitle,
  getContact,
  getCurrentUserId,
  getMessagesForChat,
  getTotalUnreadCount,
  isFromMe,
  useChatData,
  type Chat,
  type Message,
} from '@/data';
import { addMessage, markChatRead, replaceMessage } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { formatDaySeparator, formatLastSeen, isSameDay } from '@/utils/format';

const PINNED_BANNER_SPACE = 48;
const PREVIEW_HEADER_HEIGHT = 44;
/** A hold-to-preview has no status bar or home indicator to avoid. */
const NO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };

type ChatRow =
  | { kind: 'date'; key: string; label: string }
  | { kind: 'message'; key: string; message: Message; isFirstInGroup: boolean };

/** Chronological messages → rows with day separators, newest first for the inverted list. */
function buildRows(history: Message[]): ChatRow[] {
  const rows: ChatRow[] = [];
  history.forEach((message, index) => {
    const previous = history[index - 1];
    const newDay = !previous || !isSameDay(previous.createdAt, message.createdAt);
    if (newDay) {
      rows.push({ kind: 'date', key: `date-${message.id}`, label: formatDaySeparator(message.createdAt) });
    }
    rows.push({
      kind: 'message',
      key: message.id,
      message,
      isFirstInGroup:
        newDay || previous.senderId !== message.senderId || previous.type === 'system',
    });
  });
  return rows.reverse();
}

function getSubtitle(chat: Chat): string {
  if (chat.type === 'group') {
    const names = chat.participantIds.map((id) => getContact(id)?.name.split(' ')[0]).filter(Boolean);
    return [...names, 'You'].join(', ');
  }
  const contact = getContact(chat.participantIds[0]);
  if (contact?.isOnline) return 'online';
  return contact?.lastSeen ? formatLastSeen(contact.lastSeen) : '';
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isPreview = useIsPreview();
  const safeInsets = useSafeAreaInsets();
  const insets = isPreview ? NO_INSETS : safeInsets;
  const data = useChatData();

  const chat = getChat(id);
  const rows = useMemo(() => buildRows(getMessagesForChat(id)), [id, data.version]);

  // Peeking at a chat doesn't read it, like WhatsApp.
  useEffect(() => {
    if (id && !isPreview) markChatRead(id);
  }, [id, isPreview]);

  if (!chat) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: theme.wallpaper }]}>
        <Text style={{ color: theme.textSecondary }}>Chat not found</Text>
      </View>
    );
  }

  const senderColor = (senderId: string) => {
    const index = chat.participantIds.indexOf(senderId);
    return theme.groupSenderColors[Math.max(index, 0) % theme.groupSenderColors.length];
  };

  const handleSend = (text: string) => {
    const local: Message = {
      id: `local-${Date.now()}`,
      chatId: chat.id,
      senderId: getCurrentUserId(),
      type: 'text',
      text,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    addMessage(local);
    sendMessage(chat.id, text)
      .then((result) => replaceMessage(local.id, result.message))
      .catch(() => replaceMessage(local.id, { ...local, status: 'sent' }));
  };

  const topSpace = isPreview
    ? PREVIEW_HEADER_HEIGHT + Spacing.two
    : insets.top + CHAT_HEADER_HEIGHT + (chat.pinnedMessage ? PINNED_BANNER_SPACE : 0) + Spacing.two;

  const content = (
    <View style={[styles.flex, { backgroundColor: theme.wallpaper }]}>
      {isPreview ? (
        <View
          style={[
            styles.previewHeader,
            { backgroundColor: theme.floatingSurface, borderBottomColor: theme.separator },
          ]}>
          <Text style={[styles.previewTitle, { color: theme.text }]} numberOfLines={1}>
            {getChatTitle(chat)}
          </Text>
        </View>
      ) : (
        <ChatHeader
          title={getChatTitle(chat)}
          subtitle={getSubtitle(chat)}
          avatar={getChatAvatar(chat)}
          isGroup={chat.type === 'group'}
          showTimerBadge={chat.disappearingMessages}
          statusRing={getChatStatusRing(chat)}
          backBadge={getTotalUnreadCount(chat.id)}
          onBack={() => router.back()}>
          {chat.pinnedMessage && <PinnedBanner text={chat.pinnedMessage} />}
        </ChatHeader>
      )}

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <FlatList
          data={rows}
          inverted
          keyExtractor={(row) => row.key}
          renderItem={({ item }) =>
            item.kind === 'date' ? (
              <DateSeparator label={item.label} />
            ) : (
              <MessageBubble
                message={item.message}
                fromMe={isFromMe(item.message)}
                isFirstInGroup={item.isFirstInGroup}
                senderName={
                  chat.type === 'group' && !isFromMe(item.message) && item.isFirstInGroup
                    ? getContact(item.message.senderId)?.name
                    : undefined
                }
                senderColor={senderColor(item.message.senderId)}
              />
            )
          }
          // Inverted: the footer renders at the top, under the floating header.
          ListFooterComponent={<View style={{ height: topSpace }} />}
          ListHeaderComponent={<View style={{ height: Spacing.two }} />}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustKeyboardInsets={false}
          style={Platform.OS === 'web' ? styles.flex : undefined}
        />
        <Composer onSend={handleSend} />
      </KeyboardAvoidingView>
    </View>
  );

  return isPreview ? (
    <SafeAreaInsetsContext.Provider value={NO_INSETS}>{content}</SafeAreaInsetsContext.Provider>
  ) : (
    content
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PREVIEW_HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 1,
  },
  previewTitle: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
});
