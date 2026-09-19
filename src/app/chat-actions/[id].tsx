import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { GlassIconButton } from '@/components/glass-surface';
import type { IconName } from '@/components/icon';
import { SettingsSection, type SettingsItem } from '@/components/profile/settings-section';
import { FontSize, Spacing } from '@/constants/theme';
import { getChat, getChatAvatar, getChatStatusRing, getChatTitle, useChatData } from '@/data';
import {
  clearChat,
  deleteChats,
  setChatStatusRing,
  toggleChatFavourite,
  toggleChatMuted,
} from '@/data/store';
import { useTheme } from '@/hooks/use-theme';

const AVATAR_SIZE = 42;

const action = (key: string, label: string, icon: IconName, destructive = false): SettingsItem => ({
  key,
  label,
  icon,
  destructive,
  hideAccessory: true,
});

/** The "More" sheet from a chat row's left swipe. */
export default function ChatActionsSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  useChatData();

  const chat = getChat(id);
  if (!chat) return null;

  const title = getChatTitle(chat);
  const isGroup = chat.type === 'group';

  const statusRing = getChatStatusRing(chat);

  const actions = [
    chat.muted ? action('mute', 'Unmute', 'unmute') : action('mute', 'Mute', 'mute'),
    action('info', isGroup ? 'Group info' : 'Contact info', 'info'),
    action('lock', 'Lock chat', 'lockChat'),
    chat.favourite
      ? action('favourite', 'Remove from Favourites', 'unfavourite')
      : action('favourite', 'Add to Favourites', 'invite'),
    action('list', 'Add to list', 'lists'),
    ...(!isGroup
      ? [
          action(
            'status-unviewed',
            statusRing === 'unviewed' ? 'Unviewed status ✓' : 'Unviewed status',
            'status'
          ),
          action(
            'status-viewed',
            statusRing === 'viewed' ? 'Viewed status ✓' : 'Viewed status',
            'updates'
          ),
          action('status-none', !statusRing ? 'No status ✓' : 'No status', 'close'),
        ]
      : []),
    action('clear', 'Clear chat', 'clearChat'),
  ];

  const destructiveActions = [
    isGroup
      ? action('exit', 'Exit group', 'exitGroup', true)
      : action('block', `Block ${title}`, 'block', true),
    action('delete', 'Delete chat', 'trash', true),
  ];

  const dismiss = () => router.back();

  const confirm = (message: string, action: string, onConfirm: () => void) =>
    Alert.alert(message, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: action, style: 'destructive', onPress: onConfirm },
    ]);

  const onActionPress = (key: string) => {
    switch (key) {
      case 'mute':
        toggleChatMuted(chat.id);
        return dismiss();
      case 'favourite':
        toggleChatFavourite(chat.id);
        return dismiss();
      case 'status-unviewed':
        setChatStatusRing(chat.id, 'unviewed');
        return dismiss();
      case 'status-viewed':
        setChatStatusRing(chat.id, 'viewed');
        return dismiss();
      case 'status-none':
        setChatStatusRing(chat.id, 'none');
        return dismiss();
      case 'clear':
        return confirm('Clear this chat?', 'Clear chat', () => {
          clearChat(chat.id);
          dismiss();
        });
      case 'block':
        return confirm(`Block ${title}?`, 'Block', dismiss);
      case 'exit':
        return confirm(`Exit "${title}"?`, 'Exit group', dismiss);
      case 'delete':
        return confirm(`Delete chat with "${title}"?`, 'Delete chat', () => {
          dismiss();
          deleteChats([chat.id]);
        });
      default:
        // Contact info, lock chat and lists have no screens yet.
        return dismiss();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.groupedBackground, paddingBottom: insets.bottom + Spacing.two },
      ]}>
      <View style={styles.header}>
        <Avatar
          uri={getChatAvatar(chat)}
          size={AVATAR_SIZE}
          isGroup={isGroup}
          statusRing={getChatStatusRing(chat)}
        />
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        <GlassIconButton icon="close" accessibilityLabel="Close" onPress={dismiss} />
      </View>

      <SettingsSection items={actions} onItemPress={onActionPress} style={styles.card} />
      <SettingsSection
        items={destructiveActions}
        onItemPress={onActionPress}
        style={styles.card}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.four,
  },
  title: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  card: {
    marginBottom: Spacing.three,
  },
});
