import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon, type IconName } from '@/components/icon';
import { FontSize, Layout, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SwipeAction = {
  key: string;
  label: string;
  icon: IconName;
  color: string;
  onPress: () => void;
  /** On a full swipe the row slides off screen before the action runs (e.g. Archive). */
  removesRow?: boolean;
};

type Side = 'left' | 'right';

/** Past this share of the row width, releasing runs the edge action. */
const FULL_SWIPE_RATIO = 0.55;
const timing = { duration: 260, easing: Easing.out(Easing.cubic) };

/** Only one row stays open at a time, and scrolling the list closes it. */
let closeOpenRow: (() => void) | null = null;

export function closeOpenSwipeableRow() {
  closeOpenRow?.();
  closeOpenRow = null;
}

type SwipeableRowProps = {
  /** Revealed by swiping right; the first one is the full-swipe action. */
  leftActions?: SwipeAction[];
  /** Revealed by swiping left; the last one is the full-swipe action. */
  rightActions?: SwipeAction[];
  enabled?: boolean;
  children: ReactNode;
};

export function SwipeableRow({
  leftActions = [],
  rightActions = [],
  enabled = true,
  children,
}: SwipeableRowProps) {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const rowWidth = useSharedValue(0);
  /** 0 → 1 while the drag is past the full-swipe point. */
  const armed = useSharedValue(0);
  const isArmed = useSharedValue(false);
  const [isOpen, setIsOpen] = useState(false);

  const leftWidth = leftActions.length * Layout.swipeActionWidth;
  const rightWidth = rightActions.length * Layout.swipeActionWidth;
  const leftFullAction = leftActions[0];
  const rightFullAction = rightActions[rightActions.length - 1];
  const leftRemovesRow = !!leftFullAction?.removesRow;
  const rightRemovesRow = !!rightFullAction?.removesRow;

  const close = useCallback(() => {
    translateX.set(withTiming(0, timing));
    armed.set(0);
    setIsOpen(false);
  }, [translateX, armed]);

  const markOpen = useCallback(() => {
    if (closeOpenRow !== close) closeOpenRow?.();
    closeOpenRow = close;
    setIsOpen(true);
  }, [close]);

  const markClosed = useCallback(() => {
    if (closeOpenRow === close) closeOpenRow = null;
    setIsOpen(false);
  }, [close]);

  const closeOthers = useCallback(() => {
    if (closeOpenRow && closeOpenRow !== close) closeOpenSwipeableRow();
  }, [close]);

  const runFullSwipe = useCallback(
    (side: Side) => (side === 'left' ? leftFullAction : rightFullAction)?.onPress(),
    [leftFullAction, rightFullAction]
  );

  useEffect(() => {
    if (!enabled) close();
  }, [enabled, close]);

  useEffect(
    () => () => {
      if (closeOpenRow === close) closeOpenRow = null;
    },
    [close]
  );

  const pan = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .onStart(() => {
      dragStart.set(translateX.get());
      scheduleOnRN(closeOthers);
    })
    .onUpdate((event) => {
      let next = dragStart.get() + event.translationX;
      if (next > 0 && leftWidth === 0) next = 0;
      if (next < 0 && rightWidth === 0) next = 0;
      translateX.set(next);

      const full = Math.abs(next) > rowWidth.get() * FULL_SWIPE_RATIO;
      if (full !== isArmed.get()) {
        isArmed.set(full);
        armed.set(withTiming(full ? 1 : 0, { duration: 160 }));
      }
    })
    .onEnd((event) => {
      const x = translateX.get();
      const velocity = event.velocityX;

      if (isArmed.get()) {
        isArmed.set(false);
        const side: Side = x > 0 ? 'left' : 'right';
        const removesRow = side === 'left' ? leftRemovesRow : rightRemovesRow;
        if (removesRow) {
          translateX.set(
            withTiming(Math.sign(x) * rowWidth.get(), timing, (finished) => {
              if (finished) scheduleOnRN(runFullSwipe, side);
            })
          );
        } else {
          scheduleOnRN(runFullSwipe, side);
          translateX.set(withTiming(0, timing));
          armed.set(withTiming(0, timing));
        }
        scheduleOnRN(markClosed);
        return;
      }

      if (x > 0 && (x > leftWidth / 2 || velocity > 600) && velocity > -300) {
        translateX.set(withTiming(leftWidth, timing));
        scheduleOnRN(markOpen);
      } else if (x < 0 && (x < -rightWidth / 2 || velocity < -600) && velocity < 300) {
        translateX.set(withTiming(-rightWidth, timing));
        scheduleOnRN(markOpen);
      } else {
        translateX.set(withTiming(0, timing));
        scheduleOnRN(markClosed);
      }
    });

  const leftStyle = useAnimatedStyle(() => ({ width: Math.max(translateX.get(), 0) }));
  const rightStyle = useAnimatedStyle(() => ({ width: Math.max(-translateX.get(), 0) }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }],
  }));

  const onLayout = (event: LayoutChangeEvent) => rowWidth.set(event.nativeEvent.layout.width);

  const pressAction = (action: SwipeAction) => {
    close();
    action.onPress();
  };

  return (
    <View onLayout={onLayout} style={styles.container}>
      {leftActions.length > 0 && (
        <Animated.View style={[styles.actions, styles.left, leftStyle]}>
          {leftActions.map((action, index) => (
            <ActionButton
              key={action.key}
              action={action}
              side="left"
              isFullAction={index === 0}
              armed={armed}
              onPress={pressAction}
            />
          ))}
        </Animated.View>
      )}
      {rightActions.length > 0 && (
        <Animated.View style={[styles.actions, styles.right, rightStyle]}>
          {rightActions.map((action, index) => (
            <ActionButton
              key={action.key}
              action={action}
              side="right"
              isFullAction={index === rightActions.length - 1}
              armed={armed}
              onPress={pressAction}
            />
          ))}
        </Animated.View>
      )}

      <GestureDetector gesture={pan}>
        <Animated.View style={[{ backgroundColor: theme.background }, contentStyle]}>
          {children}
          {/* While open, a tap anywhere on the row just closes it. */}
          {isOpen && (
            <Pressable
              onPress={close}
              accessibilityLabel="Close actions"
              style={StyleSheet.absoluteFill}
            />
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

type ActionButtonProps = {
  action: SwipeAction;
  side: Side;
  isFullAction: boolean;
  armed: SharedValue<number>;
  onPress: (action: SwipeAction) => void;
};

function ActionButton({ action, side, isFullAction, armed, onPress }: ActionButtonProps) {
  // Buttons share the revealed space; past the full-swipe point the edge
  // action takes all of it.
  const style = useAnimatedStyle(() => ({
    flexGrow: isFullAction ? 1 + armed.get() * 12 : 1 - armed.get(),
  }));

  return (
    <Animated.View style={[styles.button, { backgroundColor: action.color }, style]}>
      <Pressable
        onPress={() => onPress(action)}
        accessibilityRole="button"
        accessibilityLabel={action.label}
        style={[
          styles.buttonPressable,
          isFullAction && { alignItems: side === 'left' ? 'flex-end' : 'flex-start' },
        ]}>
        <View style={styles.buttonContent}>
          <Icon name={action.icon} size={24} color="#FFFFFF" />
          <Text style={styles.buttonLabel} numberOfLines={1}>
            {action.label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  actions: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
  button: {
    flexBasis: 0,
    overflow: 'hidden',
  },
  buttonPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    width: Layout.swipeActionWidth,
    alignItems: 'center',
    gap: Spacing.one,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: FontSize.subhead,
  },
});
