import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { GlassSurface } from '@/components/glass-surface';
import { Icon } from '@/components/icon';
import { FontSize, HitSlop, Layout, Radius, Spacing } from '@/constants/theme';
import type { StatusRing } from '@/data';
import { useTheme } from '@/hooks/use-theme';

export const CHAT_HEADER_HEIGHT = Layout.headerIconButtonSize + Spacing.three;

type ChatHeaderProps = {
  title: string;
  subtitle?: string;
  avatar?: string;
  isGroup?: boolean;
  showTimerBadge?: boolean;
  statusRing?: StatusRing;
  backBadge?: number;
  onBack: () => void;
  onProfilePress?: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  children?: React.ReactNode;
};

/** Floating glass header over the wallpaper, like WhatsApp on iOS 26. */
export function ChatHeader({
  title,
  subtitle,
  avatar,
  isGroup,
  showTimerBadge,
  statusRing,
  backBadge,
  onBack,
  onProfilePress,
  onVideoCall,
  onVoiceCall,
  children,
}: ChatHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pillHeight = Layout.headerIconButtonSize;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.one,
          experimental_backgroundImage: `linear-gradient(to bottom, ${theme.wallpaper} 55%, transparent)`,
        },
      ]}>
      <View style={styles.row}>
        <Pressable onPress={onBack} hitSlop={HitSlop} accessibilityRole="button" accessibilityLabel="Back">
          {({ pressed }) => (
            <GlassSurface style={[styles.pill, styles.backPill, { height: pillHeight }, pressed && styles.pressed]}>
              <Icon name="back" size={20} color={theme.icon} />
              {!!backBadge && (
                <Text style={[styles.backBadge, { color: theme.text }]}>{backBadge}</Text>
              )}
            </GlassSurface>
          )}
        </Pressable>

        <Pressable onPress={onProfilePress} style={styles.flex} accessibilityRole="button">
          {({ pressed }) => (
            <GlassSurface style={[styles.pill, styles.profilePill, { height: pillHeight }, pressed && styles.pressed]}>
              <Avatar
                uri={avatar}
                size={pillHeight - Spacing.two * 1.5}
                isGroup={isGroup}
                showTimerBadge={showTimerBadge}
                statusRing={statusRing}
              />
              <View style={styles.flex}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                  {title}
                </Text>
                {!!subtitle && (
                  <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                    {subtitle}
                  </Text>
                )}
              </View>
            </GlassSurface>
          )}
        </Pressable>

        <GlassSurface style={[styles.pill, styles.actionsPill, { height: pillHeight }]}>
          <Pressable onPress={onVideoCall} hitSlop={HitSlop} accessibilityLabel="Video call">
            <Icon name="video" size={24} color={theme.icon} />
          </Pressable>
          <Pressable onPress={onVoiceCall} hitSlop={HitSlop} accessibilityLabel="Voice call">
            <Icon name="phone" size={21} color={theme.icon} />
          </Pressable>
        </GlassSurface>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: Spacing.three,
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  pill: {
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backPill: {
    minWidth: Layout.headerIconButtonSize,
    paddingHorizontal: Spacing.two + 2,
    justifyContent: 'center',
    gap: Spacing.half,
  },
  backBadge: {
    fontSize: FontSize.body,
    fontVariant: ['tabular-nums'],
  },
  profilePill: {
    paddingLeft: Spacing.one + 1,
    paddingRight: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: FontSize.body - 1,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FontSize.caption + 1,
  },
  actionsPill: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
