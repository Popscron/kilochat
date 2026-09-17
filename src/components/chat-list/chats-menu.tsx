import { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingSurface } from '@/components/glass-surface';
import { Icon, type IconName } from '@/components/icon';
import { FontSize, Layout, Motion, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ChatsMenuItem = {
  key: string;
  label: string;
  icon: IconName;
  onPress: () => void;
};

type ChatsMenuProps = {
  visible: boolean;
  items: ChatsMenuItem[];
  onClose: () => void;
};

/** Sizes measured from WhatsApp iOS. */
const MENU_WIDTH = 248;
const MENU_RADIUS = 28;
const timing = { duration: Motion.fast + 40, easing: Easing.out(Easing.cubic) };

/**
 * Glass popover that grows out of the top-left "…" button, like WhatsApp's
 * chat list menu on iOS 26.
 */
export function ChatsMenu({ visible, items, onClose }: ChatsMenuProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withTiming(visible ? 1 : 0, timing));
  }, [visible, progress]);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  const menuStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: 0.35 + progress.get() * 0.65 }],
  }));

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}>
      {visible && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close menu"
        />
      )}

      <Animated.View
        style={[
          styles.menu,
          {
            top: insets.top + (Layout.topBarHeight - Layout.headerIconButtonSize) / 2,
          },
          menuStyle,
        ]}>
        <FloatingSurface style={styles.surface}>
            {items.map(({ key, label, icon, onPress }) => (
              <Pressable
                key={key}
                onPress={() => {
                  onClose();
                  onPress();
                }}
                accessibilityRole="menuitem"
                style={({ pressed }) => [
                  styles.item,
                  pressed && { backgroundColor: theme.groupedCardPressed },
                ]}>
                <Icon name={icon} size={22} color={theme.icon} />
                <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
                  {label}
                </Text>
              </Pressable>
            ))}
        </FloatingSurface>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    left: Spacing.three,
    width: MENU_WIDTH,
    transformOrigin: 'top left',
  },
  surface: {
    borderRadius: MENU_RADIUS,
    paddingVertical: Spacing.two + 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three + 2,
    paddingHorizontal: Spacing.six + 4,
    height: 42,
  },
  label: {
    fontSize: FontSize.body,
  },
});
