import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { GlassIconButton, GlassSurface } from '@/components/glass-surface';
import { Icon } from '@/components/icon';
import { FontSize, HitSlop, Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProfileTopBarProps = {
  title: string;
  scrollY: SharedValue<number>;
  /** Scroll offset at which the large name has moved under the bar. */
  titleOffset: SharedValue<number>;
  onSearchPress?: () => void;
  onQrPress?: () => void;
  onEditPress?: () => void;
};

/** Floating glass buttons over the grouped list; the name fades in once it scrolls away. */
export function ProfileTopBar({
  title,
  scrollY,
  titleOffset,
  onSearchPress,
  onQrPress,
  onEditPress,
}: ProfileTopBarProps) {
  const theme = useTheme();

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [0, 16], [0, 1], 'clamp'),
  }));

  const titleStyle = useAnimatedStyle(() => {
    const offset = titleOffset.get();
    return {
      opacity: offset > 0 ? interpolate(scrollY.get(), [offset - 12, offset + 4], [0, 1], 'clamp') : 0,
    };
  });

  return (
    <View style={styles.bar} pointerEvents="box-none">
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fade,
          {
            experimental_backgroundImage: `linear-gradient(to bottom, ${theme.groupedBackground} 60%, transparent)`,
          },
          backgroundStyle,
        ]}
      />

      <GlassIconButton icon="search" accessibilityLabel="Search settings" onPress={onSearchPress} />

      <Animated.Text
        style={[styles.title, { color: theme.text }, titleStyle]}
        numberOfLines={1}
        pointerEvents="none">
        {title}
      </Animated.Text>

      <GlassSurface style={styles.actionsPill}>
        <Pressable onPress={onQrPress} hitSlop={HitSlop} accessibilityRole="button" accessibilityLabel="QR code">
          {({ pressed }) => <Icon name="qrCode" size={22} color={theme.icon} style={pressed && styles.pressed} />}
        </Pressable>
        <Pressable onPress={onEditPress} hitSlop={HitSlop} accessibilityRole="button" accessibilityLabel="Edit profile">
          {({ pressed }) => <Icon name="edit" size={21} color={theme.icon} style={pressed && styles.pressed} />}
        </Pressable>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    zIndex: 1,
  },
  fade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Layout.topBarHeight + Spacing.four,
  },
  title: {
    position: 'absolute',
    left: Layout.headerIconButtonSize + Spacing.eight,
    right: Layout.headerIconButtonSize * 2 + Spacing.eight,
    textAlign: 'center',
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  actionsPill: {
    height: Layout.headerIconButtonSize,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.six,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.6,
  },
});
