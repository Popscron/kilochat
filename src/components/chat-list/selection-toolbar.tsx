import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingSurface } from '@/components/glass-surface';
import { FontSize, Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const SELECTION_TOOLBAR_HEIGHT = 48;

type ToolbarAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

type SelectionToolbarProps = {
  visible: boolean;
  archive: ToolbarAction;
  read: ToolbarAction;
  remove: ToolbarAction;
};

const timing = { duration: Motion.fast + 40, easing: Easing.out(Easing.cubic) };

/**
 * Floating Archive / Read / Delete pills that replace the tab bar while selecting.
 * Stays mounted and fades in and out.
 */
export function SelectionToolbar({ visible, archive, read, remove }: SelectionToolbarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, Spacing.four);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withTiming(visible ? 1 : 0, timing));
  }, [visible, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: interpolate(progress.get(), [0, 1], [Spacing.six, 0]) }],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      style={[styles.container, animatedStyle]}>
      {/* Softens the list behind the pills, like under the tab bar. */}
      <View
        pointerEvents="none"
        style={[
          styles.fade,
          {
            height: bottom + SELECTION_TOOLBAR_HEIGHT,
            experimental_backgroundImage: `linear-gradient(to top, ${theme.background}, transparent)`,
          },
        ]}
      />

      <View pointerEvents="box-none" style={[styles.toolbar, { bottom }]}>
        <ToolbarButton {...archive} />
        <View style={styles.center} pointerEvents="box-none">
          <ToolbarButton {...read} />
        </View>
        <ToolbarButton {...remove} destructive />
      </View>
    </Animated.View>
  );
}

function ToolbarButton({ label, onPress, disabled, destructive }: ToolbarAction) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => pressed && styles.pressed}>
      <FloatingSurface style={styles.button}>
        <Text
          style={[
            styles.label,
            { color: destructive ? theme.destructive : theme.text },
            disabled && styles.disabled,
          ]}>
          {label}
        </Text>
      </FloatingSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  toolbar: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    height: SELECTION_TOOLBAR_HEIGHT,
    minWidth: 82,
    paddingHorizontal: Spacing.five,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.body,
  },
  disabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.6,
  },
});
