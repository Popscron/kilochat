import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { MessageStatus } from '@/components/message-status';
import { FontSize, Spacing } from '@/constants/theme';
import { isFromMe, type ChatPreview, type Message } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration } from '@/utils/format';

function describe(message: Message): { icon?: IconName; text: string } {
  switch (message.type) {
    case 'text':
    case 'system':
      return { text: message.text };
    case 'image':
      return { icon: 'cameraFill', text: message.caption ?? 'Photo' };
    case 'voice':
      return { icon: 'micFill', text: `Voice message (${formatDuration(message.durationSec)})` };
    case 'call':
      return {
        icon: message.callKind === 'video' ? 'videoFill' : 'phoneFill',
        text: `${message.missed ? 'Missed ' : ''}${message.callKind === 'video' ? 'Video' : 'Voice'} call`,
      };
  }
}

type MessagePreviewProps = {
  preview: ChatPreview;
  numberOfLines?: number;
};

export function MessagePreview({ preview, numberOfLines = 2 }: MessagePreviewProps) {
  const theme = useTheme();
  const { lastMessage, lastMessageSender, chat } = preview;
  if (!lastMessage) return <View style={styles.flex} />;

  const fromMe = isFromMe(lastMessage);
  const { icon, text } = describe(lastMessage);
  const showStatus = fromMe && lastMessage.type !== 'system';
  const senderPrefix =
    chat.type === 'group' && lastMessage.type !== 'system'
      ? `${fromMe ? 'You' : (lastMessageSender?.name.split(' ')[0] ?? '')}: `
      : '';
  const iconColor =
    lastMessage.type === 'call' && lastMessage.missed ? '#FF3B30' : theme.textSecondary;

  return (
    <View style={[styles.flex, styles.row]}>
      {(showStatus || icon) && (
        <View style={styles.leading}>
          {showStatus && <MessageStatus status={lastMessage.status} size={15} />}
          {/* With an icon the prefix must sit before it, so it leaves the wrapping text. */}
          {icon && !!senderPrefix && (
            <Text style={[styles.prefix, { color: theme.textSecondary }]}>{senderPrefix}</Text>
          )}
          {icon && <Icon name={icon} size={14} color={iconColor} />}
        </View>
      )}
      <Text
        style={[styles.text, { color: theme.textSecondary }]}
        numberOfLines={icon ? 1 : numberOfLines}>
        {!icon && senderPrefix}
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginRight: Spacing.one,
    height: 20,
  },
  prefix: {
    fontSize: FontSize.subhead,
  },
  text: {
    flex: 1,
    fontSize: FontSize.subhead,
    lineHeight: 20,
  },
});
