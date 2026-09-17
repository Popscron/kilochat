import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { HitSlop, Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const liquidGlass = isLiquidGlassAvailable();

type GlassSurfaceProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  tintColor?: string;
};

/** iOS 26 liquid glass where available, otherwise a soft opaque pill. */
export function GlassSurface({ children, style, tintColor }: GlassSurfaceProps) {
  const theme = useTheme();

  if (liquidGlass) {
    return (
      <GlassView style={style} tintColor={tintColor} isInteractive>
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { backgroundColor: tintColor ?? theme.glassFallback, shadowColor: theme.glassShadow },
        style,
      ]}>
      {children}
    </View>
  );
}

/**
 * Frosted-looking card for menus and toolbars that float over list content,
 * like WhatsApp's: mostly opaque white with a soft shadow, so rows behind it
 * show only faintly. Native glass is avoided here on purpose: over the list it
 * renders see-through or not at all when these views are shown and hidden.
 */
export function FloatingSurface({ children, style }: Omit<GlassSurfaceProps, 'tintColor'>) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.floating,
        { backgroundColor: theme.floatingSurface, shadowColor: theme.floatingShadow },
        style,
      ]}>
      {children}
    </View>
  );
}

type GlassIconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  /** Filled accent button (e.g. the green "new chat" button). */
  prominent?: boolean;
  size?: number;
};

export function GlassIconButton({
  icon,
  onPress,
  accessibilityLabel,
  prominent,
  size = Layout.headerIconButtonSize,
}: GlassIconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={HitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => pressed && styles.pressed}>
      <GlassSurface
        tintColor={prominent ? theme.accent : undefined}
        style={[styles.iconButton, { width: size, height: size, borderRadius: size / 2 }]}>
        <Icon name={icon} size={size * 0.46} color={prominent ? '#FFFFFF' : theme.icon} />
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fallback: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    borderCurve: 'continuous',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.6,
  },
});
