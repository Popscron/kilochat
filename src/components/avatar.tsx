import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { avatarImageSource, DEFAULT_AVATAR_KEY, isDefaultAvatar } from '@/constants/avatars';
import type { StatusRing } from '@/data';
import { useTheme } from '@/hooks/use-theme';

/** Default PNGs already include transparent padding (~16%). Full-bleed photos do not. */
const DEFAULT_CONTENT_RATIO = 0.84;
/** Status ring: stroke and the gap between it and the photo, as in WhatsApp. */
const RING_WIDTH = 2;
const RING_GAP = 2.5;

type AvatarProps = {
  uri?: string;
  size: number;
  isGroup?: boolean;
  /** Small badge in the bottom-right corner (e.g. disappearing messages timer). */
  showTimerBadge?: boolean;
  /** Ring for a posted status: green when unseen, grey once seen. */
  statusRing?: StatusRing;
};

function usesPaddedAsset(uri?: string) {
  return isDefaultAvatar(uri) || uri === 'asset:0';
}

export function Avatar({ uri, size, isGroup, showTimerBadge, statusRing }: AvatarProps) {
  const theme = useTheme();
  const padded = usesPaddedAsset(uri);
  const mediaSize = padded ? size : Math.round(size * DEFAULT_CONTENT_RATIO);
  // What the eye sees: padded assets draw their art inside transparent margins,
  // so the placeholder and the ring follow that diameter, not the frame.
  const visibleSize = Math.round(size * DEFAULT_CONTENT_RATIO);
  // Drawn around the avatar rather than inside it, so rows keep their layout.
  const ringSize = visibleSize + (RING_WIDTH + RING_GAP) * 2;
  const radius = mediaSize / 2;
  const badgeSize = Math.round(size * 0.36);
  const ringOffset = (size - ringSize) / 2;
  const source = avatarImageSource(uri);

  const media = source ? (
    <Image
      key={uri ?? DEFAULT_AVATAR_KEY}
      source={source}
      style={{ width: mediaSize, height: mediaSize, borderRadius: radius, overflow: 'hidden' }}
      contentFit="cover"
      transition={0}
      recyclingKey={uri ?? DEFAULT_AVATAR_KEY}
    />
  ) : (
    <View
      style={[
        styles.placeholder,
        {
          width: visibleSize,
          height: visibleSize,
          borderRadius: visibleSize / 2,
          backgroundColor: theme.avatarPlaceholder,
        },
      ]}>
      <Icon
        name={isGroup ? 'group' : 'person'}
        size={visibleSize * 0.5}
        color={theme.avatarPlaceholderIcon}
      />
    </View>
  );

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      {media}
      {statusRing ? (
        <View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              top: ringOffset,
              left: ringOffset,
              borderColor: statusRing === 'unviewed' ? theme.statusRing : theme.statusRingViewed,
            },
          ]}
        />
      ) : null}

      {showTimerBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: theme.background,
            },
          ]}>
          <Icon name="timer" size={badgeSize * 0.78} color={theme.textSecondary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: RING_WIDTH,
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
