import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';
import { FontSize, HitSlop, Layout, Radius, Spacing } from '@/constants/theme';
import type { Profile } from '@/data';
import { useTheme } from '@/hooks/use-theme';

type ProfileHeaderProps = {
  profile: Profile;
  onAvatarPress?: () => void;
  onNotePress?: () => void;
  onAddPress?: () => void;
  /** Reports the name's layout so the top bar knows when to show the small title. */
  onNameLayout?: (event: LayoutChangeEvent) => void;
};

export function ProfileHeader({
  profile,
  onAvatarPress,
  onNotePress,
  onAddPress,
  onNameLayout,
}: ProfileHeaderProps) {
  const theme = useTheme();
  const noteBackground = { backgroundColor: theme.groupedCard, shadowColor: theme.glassShadow };

  return (
    <View style={styles.container}>
      <View style={styles.avatarArea}>
        <Pressable onPress={onAvatarPress} accessibilityRole="imagebutton" accessibilityLabel="Profile photo">
          <Avatar uri={profile.avatar} size={Layout.profileAvatarSize} />
        </Pressable>

        {/* Thought-bubble tail: sits on the avatar's top edge, left of centre. */}
        <View pointerEvents="none" style={[styles.dot, styles.dotLarge, noteBackground]} />
        <View pointerEvents="none" style={[styles.dot, styles.dotSmall, noteBackground]} />

        <Pressable
          onPress={onNotePress}
          accessibilityRole="button"
          accessibilityLabel={profile.note ? `Note: ${profile.note}` : 'Add a note'}
          style={styles.note}>
          {({ pressed }) => (
            <View style={[styles.noteBubble, noteBackground, pressed && styles.pressed]}>
              <Text style={[styles.noteText, { color: theme.textSecondary }]} numberOfLines={1}>
                {profile.note ?? 'Add note'}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* The name alone is centred: an empty spacer on the left balances the add button. */}
      <View style={styles.nameRow} onLayout={onNameLayout}>
        <View style={styles.addButtonSlot} />
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1} accessibilityRole="header">
          {profile.name}
        </Text>
        <Pressable
          onPress={onAddPress}
          hitSlop={HitSlop}
          accessibilityRole="button"
          accessibilityLabel="Add"
          style={[styles.addButtonSlot, styles.addButton]}>
          {({ pressed }) => (
            <Icon name="addCircle" size={ADD_ICON_SIZE} color={theme.accent} style={pressed && styles.pressed} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const NOTE_HEIGHT = 44;
const ADD_ICON_SIZE = 17;
const ADD_ICON_GAP = 10;
const AVATAR_RADIUS = Layout.profileAvatarSize / 2;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: NOTE_HEIGHT + Spacing.two,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.six,
  },
  avatarArea: {
    alignItems: 'center',
  },
  note: {
    position: 'absolute',
    top: -NOTE_HEIGHT,
    left: -Layout.profileAvatarSize,
    right: -Layout.profileAvatarSize,
    alignItems: 'center',
  },
  noteBubble: {
    height: NOTE_HEIGHT,
    maxWidth: 156,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three + 2,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  noteText: {
    fontSize: FontSize.footnote,
  },
  dot: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  dotLarge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -6,
    left: AVATAR_RADIUS - 27 - 8,
  },
  dotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 13 - 4,
    left: AVATAR_RADIUS - 18 - 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ADD_ICON_GAP,
    marginTop: Spacing.five,
  },
  name: {
    flexShrink: 1,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  /** Same size on both sides of the name, so the name itself is what's centred. */
  addButtonSlot: {
    width: ADD_ICON_SIZE,
    height: ADD_ICON_SIZE,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    // Nudged down slightly so it centres on the capital letters, not the line box.
    marginTop: -6,
    right:4
  },
  pressed: {
    opacity: 0.6,
  },
});
