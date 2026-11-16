import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CommunityIcon } from '@/components/community/community-group-row';
import { Icon } from '@/components/icon';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import type { Community } from '@/data/communities';
import { useTheme } from '@/hooks/use-theme';

type CommunityIntroProps = {
  community: Community;
  /** The "Welcome to your community!" card is only for admins. */
  showWelcome?: boolean;
  onAddMembers?: () => void;
};

/** Start of an Announcements chat: encryption notice and the welcome card. */
export function CommunityIntro({ community, showWelcome, onAddMembers }: CommunityIntroProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.notice, { backgroundColor: theme.systemBubble }]}>
        <Text style={[styles.noticeText, { color: theme.text }]}>
          <Icon name="lockFill" size={12} color={theme.text} /> Messages and calls are end-to-end encrypted.
          Only people in this chat can read, listen to, or share them.{' '}
          <Text style={styles.bold}>Learn more</Text>
        </Text>
      </View>

      {showWelcome && (
        <View style={[styles.card, { backgroundColor: theme.bubbleIncoming }]}>
          <CommunityIcon community={community} size={56} />
          <Text style={[styles.title, { color: theme.text }]}>Welcome to your community!</Text>
          <Text style={[styles.body, { color: theme.textSecondary }]}>
            Send important admin announcements to all your members at once.
          </Text>
          <Pressable
            onPress={onAddMembers}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <Icon name="plus" size={18} color={theme.text} />
            <Text style={[styles.buttonText, { color: theme.text }]}>Add members</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  notice: {
    marginHorizontal: Spacing.eight + Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.small,
  },
  noticeText: {
    fontSize: FontSize.footnote,
    lineHeight: 19,
    textAlign: 'center',
  },
  bold: {
    fontWeight: '700',
  },
  card: {
    alignSelf: 'stretch',
    marginHorizontal: Spacing.five,
    borderRadius: Radius.card,
    padding: Spacing.five,
    alignItems: 'center',
  },
  title: {
    marginTop: Spacing.five,
    fontSize: FontSize.body + 1,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    marginTop: Spacing.two,
    fontSize: FontSize.subhead,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: Spacing.four,
    height: 44,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  buttonText: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
