import { memo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';
import { MessageStatus } from '@/components/message-status';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { getCurrentUser } from '@/data';
import { COMMUNITY_ME, getCommunityMember, type CommunityMessage as Message } from '@/data/communities';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration, formatTime } from '@/utils/format';

const WAVEFORM = [6, 10, 16, 8, 20, 12, 7, 18, 24, 14, 6, 12, 22, 9, 16, 7, 12, 19, 8, 14, 10, 6, 15, 11, 7];
const SENDER_AVATAR = 36;
const VOICE_AVATAR = 44;
const VOICE_AVATAR_FRAME = Math.round(VOICE_AVATAR / 0.84);
const PLAY_SIZE = 24;

type CommunityMessageProps = {
  message: Message;
  /** First message of a run from the same sender: shows the name header. */
  isFirstInGroup: boolean;
  senderColor: string;
  /** Shows "Community admin" under the sender's name. */
  senderIsAdmin?: boolean;
  /** Announcements stretch every bubble edge to edge, like WhatsApp. */
  fullWidth?: boolean;
};

export const CommunityMessage = memo(function CommunityMessage({
  message,
  isFirstInGroup,
  senderColor,
  senderIsAdmin,
  fullWidth,
}: CommunityMessageProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const maxWidth = Math.min(width * Layout.bubbleMaxWidthRatio, Layout.bubbleMaxWidth);
  const fromMe = message.senderId === COMMUNITY_ME;

  if (message.type === 'system') {
    return (
      <View style={styles.systemRow}>
        <View style={[styles.systemChip, { backgroundColor: theme.dateChip }]}>
          <Text style={[styles.systemText, { color: theme.bubbleMeta }]}>{message.text}</Text>
        </View>
      </View>
    );
  }

  const member = getCommunityMember(message.senderId);
  const avatar = fromMe ? getCurrentUser().avatar : member?.avatar;
  const time = formatTime(message.createdAt);
  // Announcements show admin names in link blue, like WhatsApp.
  const nameColor = fromMe ? theme.text : fullWidth ? theme.link : senderColor;
  const meta = (
    <View style={styles.metaRow}>
      {message.pinned && <Icon name="pin" size={11} color={theme.bubbleMeta} />}
      <Text style={[styles.metaText, { color: theme.bubbleMeta }]}>{time}</Text>
      {fromMe && <MessageStatus status={message.status} size={13} color={theme.bubbleMeta} />}
    </View>
  );

  const voiceAvatar = (
    <View>
      <Avatar uri={avatar} size={VOICE_AVATAR_FRAME} />
      <View style={[styles.micBadge, fromMe ? styles.micBadgeRight : styles.micBadgeLeft, { backgroundColor: fromMe ? theme.bubbleOutgoing : theme.bubbleIncoming }]}>
        <Icon name="micFill" size={14} color={fromMe ? theme.accent : theme.readTick} />
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.row,
        { alignItems: fromMe ? 'flex-end' : 'flex-start', marginTop: isFirstInGroup ? Spacing.two : Spacing.half },
      ]}>
      <View
        style={[
          styles.bubble,
          { maxWidth, backgroundColor: fromMe ? theme.bubbleOutgoing : theme.bubbleIncoming },
          message.type === 'voice' && styles.voiceBubble,
          fullWidth && styles.fullWidth,
        ]}>
        {isFirstInGroup && (message.type === 'text' || fullWidth) && (
          <View style={styles.sender}>
            <Avatar uri={avatar} size={SENDER_AVATAR / 0.84} />
            <View style={styles.senderText}>
              <Text style={[styles.senderName, { color: nameColor }]} numberOfLines={1}>
                {fromMe ? 'You' : member?.name}
              </Text>
              {senderIsAdmin && (
                <Text style={[styles.role, { color: theme.bubbleMeta }]}>Community admin</Text>
              )}
            </View>
          </View>
        )}

        {message.type === 'text' && (
          <View style={styles.textLine}>
            <Text style={[styles.text, { color: theme.text }]}>{message.text}</Text>
            <View style={styles.textMeta}>{meta}</View>
          </View>
        )}

        {message.type === 'voice' && (
          <>
            {isFirstInGroup && !fromMe && !fullWidth && (
              <Text style={[styles.senderName, styles.voiceSender, { color: senderColor }]} numberOfLines={1}>
                {member?.name}
              </Text>
            )}
            {/* Your voice notes show your photo on the left; others' on the right. */}
            <View style={styles.voice}>
              {fromMe && voiceAvatar}
              <Icon name="play" size={PLAY_SIZE} color={theme.bubbleMeta} />
              <View style={styles.waveform}>
                <View style={[styles.playhead, { backgroundColor: fromMe ? theme.accent : theme.readTick }]} />
                {WAVEFORM.map((height, index) => (
                  <View key={index} style={[styles.waveBar, { height, backgroundColor: theme.bubbleMeta }]} />
                ))}
              </View>
              {!fromMe && voiceAvatar}
            </View>
            <View style={[styles.voiceFooter, fromMe ? styles.voiceFooterMine : styles.voiceFooterTheirs]}>
              <Text style={[styles.metaText, { color: theme.bubbleMeta }]}>
                {formatDuration(message.durationSec)}
              </Text>
              {meta}
            </View>
          </>
        )}
      </View>

      {!!message.replyCount && (
        <View
          style={[
            styles.replies,
            fromMe ? styles.repliesMine : styles.repliesTheirs,
            { backgroundColor: theme.bubbleIncoming, shadowColor: theme.floatingShadow },
          ]}>
          <Icon name="reply" size={13} color={theme.bubbleMeta} />
          <Text style={[styles.repliesText, { color: theme.bubbleMeta }]}>
            {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.three,
  },
  bubble: {
    borderRadius: Radius.bubble,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  voiceBubble: {
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
    width: 290,
  },
  fullWidth: {
    width: '100%',
    maxWidth: '100%',
    borderRadius: Radius.bubble + 4,
    paddingTop: Spacing.three,
  },
  sender: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  senderText: {
    flexShrink: 1,
  },
  senderName: {
    fontSize: FontSize.subhead,
    fontWeight: '600',
  },
  voiceSender: {
    marginLeft: Spacing.one,
    marginBottom: Spacing.one,
  },
  role: {
    fontSize: FontSize.footnote,
  },
  // Text wraps; the time floats bottom-right and drops to its own line if needed.
  textLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    columnGap: Spacing.two,
  },
  text: {
    flexShrink: 1,
    fontSize: FontSize.body,
    lineHeight: 22,
  },
  textMeta: {
    marginLeft: 'auto',
    paddingBottom: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  metaText: {
    fontSize: FontSize.caption,
    fontVariant: ['tabular-nums'],
  },
  voice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  micBadge: {
    position: 'absolute',
    bottom: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  playhead: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginRight: 1,
  },
  waveBar: {
    width: 2.5,
    borderRadius: 2,
  },
  micBadgeRight: {
    right: 0,
  },
  micBadgeLeft: {
    left: 0,
  },
  voiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -2,
  },
  voiceFooterMine: {
    paddingLeft: VOICE_AVATAR_FRAME + Spacing.two * 2 + PLAY_SIZE,
    paddingRight: Spacing.one,
  },
  voiceFooterTheirs: {
    paddingLeft: PLAY_SIZE + Spacing.two,
    paddingRight: VOICE_AVATAR_FRAME + Spacing.two,
  },
  // Hangs off the bubble's bottom edge, like WhatsApp.
  replies: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: -Spacing.two,
    marginBottom: Spacing.one,
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  repliesTheirs: {
    marginLeft: Spacing.three,
  },
  repliesMine: {
    marginRight: Spacing.three,
  },
  repliesText: {
    fontSize: FontSize.caption + 1,
    fontWeight: '500',
  },
  systemRow: {
    alignItems: 'center',
    paddingHorizontal: Spacing.eight,
    marginVertical: Spacing.two,
  },
  systemChip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
  },
  systemText: {
    fontSize: FontSize.subhead,
    textAlign: 'center',
  },
});
