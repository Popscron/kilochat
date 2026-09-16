import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHAT_HEADER_HEIGHT, ChatHeader } from '@/components/chat/chat-header';
import { Composer } from '@/components/chat/composer';
import { DateSeparator } from '@/components/chat/date-separator';
import { MessageBubble } from '@/components/chat/message-bubble';
import { PinnedBanner } from '@/components/chat/pinned-banner';
import { sendMessage } from '@/api/client';
import { Spacing } from '@/constants/theme';
import {
  getChat,
  getChatAvatar,
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
  const insets = useSafeAreaInsets();
  const data = useChatData();

  const chat = getChat(id);
  const rows = useMemo(() => buildRows(getMessagesForChat(id)), [id, data.version]);

  useEffect(() => {
    if (id) markChatRead(id);
  }, [id]);

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

  const topSpace =
    insets.top + CHAT_HEADER_HEIGHT + (chat.pinnedMessage ? PINNED_BANNER_SPACE : 0) + Spacing.two;

  return (
    <View style={[styles.flex, { backgroundColor: theme.wallpaper }]}>
      <ChatHeader
        title={getChatTitle(chat)}
        subtitle={getSubtitle(chat)}
        avatar={getChatAvatar(chat)}
        isGroup={chat.type === 'group'}
        showTimerBadge={chat.disappearingMessages}
        backBadge={getTotalUnreadCount(chat.id)}
        onBack={() => router.back()}>
        {chat.pinnedMessage && <PinnedBanner text={chat.pinnedMessage} />}
      </ChatHeader>

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
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
