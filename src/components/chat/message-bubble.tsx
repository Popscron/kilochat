import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Icon } from '@/components/icon';
import { MessageStatus } from '@/components/message-status';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { avatarImageSource } from '@/constants/avatars';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration, formatTime } from '@/utils/format';

const WAVEFORM = [6, 12, 18, 10, 22, 14, 8, 16, 24, 12, 6, 14, 20, 10, 16, 8, 12, 18, 6, 10];

type MessageBubbleProps = {
  message: Message;
  fromMe: boolean;
  /** First message of a run from the same sender (gets extra top spacing). */
  isFirstInGroup: boolean;
  /** Shown above the text in group chats. */
  senderName?: string;
  senderColor?: string;
};

export const MessageBubble = memo(function MessageBubble({
  message,
  fromMe,
  isFirstInGroup,
  senderName,
  senderColor,
}: MessageBubbleProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const maxWidth = Math.min(width * Layout.bubbleMaxWidthRatio, Layout.bubbleMaxWidth);

  if (message.type === 'system') {
    return (
      <View style={[styles.systemRow, { marginTop: Spacing.three }]}>
        <View style={[styles.systemBubble, { backgroundColor: theme.systemBubble, maxWidth: width - Spacing.eight * 2 }]}>
          <Icon name="timer" size={14} color={theme.bubbleMeta} />
          <Text style={[styles.systemText, { color: theme.bubbleMeta }]}>{message.text}</Text>
        </View>
      </View>
    );
  }

  const time = formatTime(message.createdAt);
  const meta = (
    <View style={styles.metaRow}>
      <Text style={[styles.metaText, { color: theme.bubbleMeta }]}>{time}</Text>
      {fromMe && <MessageStatus status={message.status} size={13} color={theme.bubbleMeta} />}
    </View>
  );
  // Invisible text that reserves room so the timestamp can sit on the last line.
  const metaSpacer = (
    <Text style={styles.metaSpacer}>
      {'   '}
      {time}
      {fromMe ? '      ' : ''}
    </Text>
  );

  return (
    <View
      style={[
        styles.row,
        fromMe ? styles.rowEnd : styles.rowStart,
        { marginTop: isFirstInGroup ? Spacing.two : Spacing.half },
      ]}>
      <View
        style={[
          styles.bubble,
          {
            maxWidth,
            backgroundColor: fromMe ? theme.bubbleOutgoing : theme.bubbleIncoming,
          },
          message.type === 'image' && styles.mediaBubble,
        ]}>
        {!!senderName && (
          <Text
            style={[
              styles.sender,
              { color: senderColor },
              message.type === 'image' && styles.mediaSender,
            ]}
            numberOfLines={1}>
            {senderName}
          </Text>
        )}

        {message.type === 'text' && (
          <>
            <Text style={[styles.text, { color: theme.text }]}>
              {message.text}
              {metaSpacer}
            </Text>
            <View style={styles.metaOverlay}>{meta}</View>
          </>
        )}

        {message.type === 'image' && (
          <>
            <Image
              source={
                message.imageUri.startsWith('asset:')
                  ? avatarImageSource(message.imageUri)
                  : { uri: message.imageUri }
              }
              style={[styles.image, { width: Math.min(maxWidth - 6, 260) }]}
              contentFit="cover"
              transition={200}
            />
            {message.caption ? (
              <View style={styles.caption}>
                <Text style={[styles.text, { color: theme.text }]}>
                  {message.caption}
                  {metaSpacer}
                </Text>
                <View style={styles.metaOverlay}>{meta}</View>
              </View>
            ) : (
              <View style={[styles.metaOverlay, styles.imageMeta]}>
                <Text style={[styles.metaText, styles.imageMetaText]}>{time}</Text>
                {fromMe && <MessageStatus status={message.status} size={13} color="#FFFFFF" />}
              </View>
            )}
          </>
        )}

        {message.type === 'voice' && (
          <View style={styles.voice}>
            <Icon name="micFill" size={20} color={fromMe ? theme.accent : theme.readTick} />
            <View style={styles.waveform}>
              {WAVEFORM.map((height, index) => (
                <View
                  key={index}
                  style={[styles.waveBar, { height, backgroundColor: theme.bubbleMeta }]}
                />
              ))}
            </View>
            <View style={styles.voiceFooter}>
              <Text style={[styles.metaText, { color: theme.bubbleMeta }]}>
                {formatDuration(message.durationSec)}
              </Text>
              {meta}
            </View>
          </View>
        )}

        {message.type === 'statusReply' && (
          <>
            <View style={[styles.statusQuote, { backgroundColor: fromMe ? theme.chipActiveBackground : theme.backgroundElement }]}>
              <Icon name="status" size={16} color={theme.accent} />
              <Text style={[styles.statusQuoteText, { color: theme.textSecondary }]}>Status</Text>
            </View>
            <Text style={[styles.text, { color: theme.text }]}>
              {message.text}
              {metaSpacer}
            </Text>
            <View style={styles.metaOverlay}>{meta}</View>
          </>
        )}

        {message.type === 'call' && (
          <View style={styles.call}>
            <View style={[styles.callIcon, { backgroundColor: theme.backgroundElement }]}>
              <Icon
                name={message.callKind === 'video' ? 'videoFill' : 'phoneFill'}
                size={18}
                color={message.missed ? '#FF3B30' : theme.text}
              />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.callTitle, { color: theme.text }]}>
                {message.missed ? 'Missed ' : ''}
                {message.callKind === 'video' ? 'video' : 'voice'} call
              </Text>
              <Text style={[styles.callSubtitle, { color: theme.bubbleMeta }]}>
                {message.missed ? 'Tap to call back' : 'Ended'}
              </Text>
            </View>
            <View style={styles.callMeta}>{meta}</View>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
  },
  rowStart: {
    justifyContent: 'flex-start',
  },
  rowEnd: {
    justifyContent: 'flex-end',
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
  mediaBubble: {
    padding: 3,
  },
  sender: {
    fontSize: FontSize.footnote,
    fontWeight: '600',
    marginBottom: Spacing.half,
  },
  mediaSender: {
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.one,
  },
  text: {
    fontSize: FontSize.body,
    lineHeight: 22,
  },
  metaSpacer: {
    fontSize: FontSize.caption,
    color: 'transparent',
  },
  metaOverlay: {
    position: 'absolute',
    right: Spacing.three - 2,
    bottom: Spacing.one + 1,
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
  image: {
    aspectRatio: 3 / 4,
    borderRadius: Radius.bubble - 3,
  },
  caption: {
    paddingHorizontal: Spacing.two + 1,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.one + 2,
  },
  imageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    right: Spacing.three,
    bottom: Spacing.two,
  },
  imageMetaText: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 3,
  },
  voice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.four,
    minWidth: 220,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceFooter: {
    position: 'absolute',
    left: 28,
    right: -Spacing.one,
    bottom: -2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  call: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
    minWidth: 220,
  },
  statusQuote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
    marginBottom: Spacing.one,
  },
  statusQuoteText: {
    fontSize: FontSize.footnote,
    fontWeight: '600',
  },
  callIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callTitle: {
    fontSize: FontSize.subhead,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  callSubtitle: {
    fontSize: FontSize.footnote,
  },
  callMeta: {
    alignSelf: 'flex-end',
  },
  systemRow: {
    alignItems: 'center',
    paddingHorizontal: Spacing.eight,
  },
  systemBubble: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
  },
  systemText: {
    flexShrink: 1,
    fontSize: FontSize.footnote,
    textAlign: 'center',
  },
});
