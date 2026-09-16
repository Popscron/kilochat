import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { ChatListItem } from '@/components/chat-list/chat-list-item';
import { HighlightedText } from '@/components/highlighted-text';
import { MessageStatus } from '@/components/message-status';
import { FontSize, Spacing } from '@/constants/theme';
import { isFromMe, searchChats, useChatData, type MessageSearchResult } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import { formatChatListDate } from '@/utils/format';

type SearchResultsProps = {
  query: string;
  onChatPress: (chatId: string) => void;
};

export function SearchResults({ query, onChatPress }: SearchResultsProps) {
  const theme = useTheme();
  const data = useChatData();
  const results = useMemo(() => searchChats(query), [query, data.version]);

  if (results.chats.length === 0 && results.messages.length === 0) {
    return (
      <Text style={[styles.empty, { color: theme.textSecondary }]}>
        No results found for “{query.trim()}”
      </Text>
    );
  }

  return (
    <View>
      {results.chats.length > 0 && (
        <>
          <SectionTitle title="Chats" />
          {results.chats.map((preview) => (
            <ChatListItem
              key={preview.chat.id}
              preview={preview}
              onPress={onChatPress}
              highlight={query}
            />
          ))}
        </>
      )}

      {results.messages.length > 0 && (
        <>
          <SectionTitle title="Messages" />
          {results.messages.map((result) => (
            <MessageResultItem
              key={result.message.id}
              result={result}
              query={query}
              onPress={onChatPress}
            />
          ))}
        </>
      )}
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  const theme = useTheme();
  return <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>;
}

type MessageResultItemProps = {
  result: MessageSearchResult;
  query: string;
  onPress: (chatId: string) => void;
};

function MessageResultItem({ result, query, onPress }: MessageResultItemProps) {
  const theme = useTheme();
  const { message, preview } = result;

  return (
    <Pressable
      onPress={() => onPress(preview.chat.id)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.backgroundElement }]}>
      <Avatar uri={preview.avatar} size={44} isGroup={preview.chat.type === 'group'} />
      <View style={[styles.content, { borderBottomColor: theme.separator }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {preview.title}
          </Text>
          <Text style={[styles.time, { color: theme.textSecondary }]}>
            {formatChatListDate(message.createdAt)}
          </Text>
        </View>
        <View style={styles.messageRow}>
          {isFromMe(message) && <MessageStatus status={message.status} size={15} />}
          <HighlightedText
            text={message.text}
            query={query}
            numberOfLines={2}
            style={[styles.message, { color: theme.textSecondary }]}
            highlightStyle={{ color: theme.text, fontWeight: '600' }}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    fontSize: FontSize.subhead,
    marginTop: Spacing.eight,
    paddingHorizontal: Spacing.six,
  },
  sectionTitle: {
    fontSize: FontSize.title,
    fontWeight: '600',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.four,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.three,
    paddingVertical: Spacing.three,
    paddingRight: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontSize: FontSize.body - 1,
    fontWeight: '600',
  },
  time: {
    fontSize: FontSize.footnote,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.half,
  },
  message: {
    flex: 1,
    fontSize: FontSize.subhead,
  },
});
