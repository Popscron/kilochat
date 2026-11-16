import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { chatHeaderSpace } from '@/components/chat/chat-header';
import { Composer } from '@/components/chat/composer';
import { DateSeparator } from '@/components/chat/date-separator';
import { CommunityChatHeader } from '@/components/community/community-chat-header';
import { CommunityIntro } from '@/components/community/community-intro';
import { CommunityMessage } from '@/components/community/community-message';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import {
  COMMUNITY_ME,
  getCommunity,
  getCommunityGroup,
  isCommunityAdmin,
  getGroupMessages,
  getPinnedText,
  sendCommunityMessage,
  useCommunityData,
  type CommunityMessage as Message,
} from '@/data/communities';
import { getTotalUnreadCount } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import { formatDaySeparator, isSameDay } from '@/utils/format';

type Row =
  | { kind: 'date'; key: string; label: string }
  | { kind: 'intro'; key: string }
  | { kind: 'message'; key: string; message: Message; isFirstInGroup: boolean };

/** Chronological messages → rows with day chips, newest first for the inverted list. */
function buildRows(history: Message[], isAnnouncements: boolean): Row[] {
  const rows: Row[] = [];
  history.forEach((message, index) => {
    const previous = history[index - 1];
    const newDay = !previous || !isSameDay(previous.createdAt, message.createdAt);
    if (newDay) rows.push({ kind: 'date', key: `date-${message.id}`, label: formatDaySeparator(message.createdAt) });
    // Encryption notice and welcome card open every Announcements chat.
    if (index === 0 && isAnnouncements) rows.push({ kind: 'intro', key: 'intro' });
    rows.push({
      kind: 'message',
      key: message.id,
      message,
      // Announcements repeat the sender header on every post, like WhatsApp.
      isFirstInGroup:
        isAnnouncements || newDay || previous.senderId !== message.senderId || previous.type === 'system',
    });
  });
  return rows.reverse();
}

export default function CommunityChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  useCommunityData();
  const [joined, setJoined] = useState(false);

  const group = getCommunityGroup(id);
  const community = getCommunity(group?.communityId);
  const rows = group ? buildRows(getGroupMessages(group.id), !!group.isAnnouncements) : [];

  if (!group || !community) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: theme.wallpaper }]}>
        <Text style={{ color: theme.textSecondary }}>Group not found</Text>
      </View>
    );
  }

  const isMember = group.joined || joined;
  const isAdmin = isCommunityAdmin(community, COMMUNITY_ME);
  const canPost = isMember && (!group.isAnnouncements || isAdmin);
  const pinnedText = getPinnedText(group.id);
  const openCommunity = () => router.push({ pathname: '/community/[id]', params: { id: community.id } });

  const senderColor = (senderId: string) => {
    const index = Math.max(community.memberIds.indexOf(senderId), 0);
    return theme.groupSenderColors[index % theme.groupSenderColors.length];
  };

  const topSpace = chatHeaderSpace(insets.top, !!pinnedText) + Spacing.two;

  return (
    <View style={[styles.flex, { backgroundColor: theme.wallpaper }]}>
      <CommunityChatHeader
        community={community}
        // Announcements show the community name; other groups show their own.
        title={group.isAnnouncements ? community.name : group.name}
        subtitle={group.isAnnouncements ? 'Announcements' : community.name}
        backBadge={getTotalUnreadCount()}
        pinnedMessage={pinnedText}
        onBack={() => router.back()}
        onOpenCommunity={openCommunity}
      />

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <FlatList
          data={rows}
          inverted
          keyExtractor={(row) => row.key}
          renderItem={({ item }) =>
            item.kind === 'date' ? (
              <DateSeparator label={item.label} />
            ) : item.kind === 'intro' ? (
              <CommunityIntro community={community} showWelcome={isAdmin} />
            ) : (
              <CommunityMessage
                message={item.message}
                isFirstInGroup={item.isFirstInGroup}
                senderColor={senderColor(item.message.senderId)}
                senderIsAdmin={isCommunityAdmin(community, item.message.senderId)}
                fullWidth={group.isAnnouncements}
              />
            )
          }
          ListFooterComponent={<View style={{ height: topSpace }} />}
          ListHeaderComponent={<View style={{ height: Spacing.two }} />}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="never"
          style={Platform.OS === 'web' ? styles.flex : undefined}
        />

        {canPost ? (
          <Composer onSend={(text) => sendCommunityMessage(group.id, text)} />
        ) : (
          <View
            style={[
              styles.footer,
              { paddingBottom: insets.bottom + Spacing.two },
              isMember && [styles.memberFooter, { backgroundColor: theme.headerBand }],
            ]}>
            {isMember ? (
              // Members can't post in Announcements, so the composer becomes a frosted notice.
              <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
                You can reply to announcements, but only{' '}
                <Text style={{ color: theme.link }}>community admins</Text> can send them.
              </Text>
            ) : (
              <Pressable
                onPress={() => setJoined(true)}
                accessibilityRole="button"
                style={({ pressed }) => [styles.join, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
                <Text style={[styles.joinText, { color: theme.onAccent }]}>Join group</Text>
              </Pressable>
            )}
          </View>
        )}
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
  footer: {
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  memberFooter: {
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.eight,
  },
  noticeText: {
    fontSize: FontSize.footnote,
    lineHeight: 21,
    textAlign: 'center',
  },
  join: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
  },
  joinText: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
