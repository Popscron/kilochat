import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PinnedBanner } from '@/components/chat/pinned-banner';
import { CommunityIcon } from '@/components/community/community-group-row';
import { GlassSurface } from '@/components/glass-surface';
import { Icon } from '@/components/icon';
import { FontSize, HitSlop, Layout, Spacing } from '@/constants/theme';
import type { Community } from '@/data/communities';
import { useTheme } from '@/hooks/use-theme';

const ICON_SIZE = 34;
const SMALL_ICON_SIZE = 28;

type CommunityChatHeaderProps = {
  community: Community;
  title: string;
  subtitle: string;
  backBadge?: number;
  pinnedMessage?: string;
  onBack: () => void;
  /** Title and the small icon on the right both open the community page. */
  onOpenCommunity: () => void;
};

/**
 * WhatsApp's community chat header: a glass back button and one glass pill
 * holding the community tile, title and a small community shortcut.
 */
export function CommunityChatHeader({
  community,
  title,
  subtitle,
  backBadge,
  pinnedMessage,
  onBack,
  onOpenCommunity,
}: CommunityChatHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.one },
        // With a pin: solid band. Without: the wallpaper fades in under the glass.
        pinnedMessage
          ? [styles.band, { backgroundColor: theme.headerBand, shadowColor: theme.floatingShadow }]
          : {
              paddingBottom: Spacing.three,
              experimental_backgroundImage: `linear-gradient(to bottom, ${theme.wallpaper} 55%, transparent)`,
            },
      ]}>
      <View style={styles.row}>
        <Pressable onPress={onBack} hitSlop={HitSlop} accessibilityRole="button" accessibilityLabel="Back">
          {({ pressed }) => (
            <GlassSurface style={[styles.back, pressed && styles.pressed]}>
              <Icon name="back" size={20} color={theme.icon} />
              {!!backBadge && <Text style={[styles.backBadge, { color: theme.text }]}>{backBadge}</Text>}
            </GlassSurface>
          )}
        </Pressable>

        <Pressable onPress={onOpenCommunity} accessibilityRole="button" style={styles.flex}>
          {({ pressed }) => (
            <GlassSurface style={[styles.pill, pressed && styles.pressed]}>
              <CommunityIcon community={community} size={ICON_SIZE} />
              <View style={styles.flex}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
              <View accessibilityLabel="Open community">
                <CommunityIcon community={community} size={SMALL_ICON_SIZE} />
                <View style={[styles.goBadge, { borderColor: theme.glassFallback }]}>
                  <Icon name="chevronRight" size={9} color="#FFFFFF" />
                </View>
              </View>
            </GlassSurface>
          )}
        </Pressable>
      </View>

      {!!pinnedMessage && <PinnedBanner text={pinnedMessage} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  band: {
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  row: {
    height: Layout.headerIconButtonSize,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  back: {
    minWidth: Layout.headerIconButtonSize,
    height: Layout.headerIconButtonSize,
    borderRadius: Layout.headerIconButtonSize / 2,
    paddingHorizontal: Spacing.two + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
    overflow: 'hidden',
  },
  backBadge: {
    fontSize: FontSize.body,
    fontVariant: ['tabular-nums'],
  },
  pill: {
    height: Layout.headerIconButtonSize,
    borderRadius: Layout.headerIconButtonSize / 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.one + 1,
    paddingRight: Spacing.three,
    gap: Spacing.two + 2,
    overflow: 'hidden',
  },
  title: {
    fontSize: FontSize.body - 1,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: FontSize.footnote,
  },
  goBadge: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
