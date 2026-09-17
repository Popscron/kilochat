import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { GlassIconButton } from '@/components/glass-surface';
import { FontSize, Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Scroll distance after which the large title has moved under the bar. */
export const LARGE_TITLE_COLLAPSE_OFFSET = 44;

type ChatsTopBarProps = {
  title: string;
  scrollY: SharedValue<number>;
  /** Selection mode: the "…" button becomes a done checkmark and the actions hide. */
  selecting?: boolean;
  onDonePress?: () => void;
  /** Opens the chats menu (rendered by the screen so it can cover the list). */
  onMorePress?: () => void;
  onCameraPress?: () => void;
  onNewChatPress?: () => void;
};

export function ChatsTopBar({
  title,
  scrollY,
  selecting = false,
  onDonePress,
  onMorePress,
  onCameraPress,
  onNewChatPress,
}: ChatsTopBarProps) {
  const theme = useTheme();

  const smallTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.get(),
      [LARGE_TITLE_COLLAPSE_OFFSET - 10, LARGE_TITLE_COLLAPSE_OFFSET + 6],
      [0, 1],
      'clamp'
    ),
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [0, 12], [0, 1], 'clamp'),
  }));

  return (
    <View style={styles.bar}>
      {selecting ? (
        <GlassIconButton icon="check" accessibilityLabel="Done" onPress={onDonePress} />
      ) : (
        <GlassIconButton icon="more" accessibilityLabel="More options" onPress={onMorePress} />
      )}

      <Animated.Text
        style={[styles.smallTitle, { color: theme.text }, smallTitleStyle]}
        numberOfLines={1}>
        {title}
      </Animated.Text>

      {!selecting && (
        <View style={styles.actions}>
          <GlassIconButton icon="camera" accessibilityLabel="Camera" onPress={onCameraPress} />
          <GlassIconButton
            icon="plus"
            accessibilityLabel="New chat"
            prominent
            onPress={onNewChatPress}
          />
        </View>
      )}

      <Animated.View
        style={[styles.divider, { backgroundColor: theme.separator }, dividerStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  smallTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: FontSize.body,
    fontWeight: '600',
    zIndex: -1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
});
