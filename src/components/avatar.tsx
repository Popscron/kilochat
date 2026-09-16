import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { avatarImageSource, DEFAULT_AVATAR_KEY, isDefaultAvatar } from '@/constants/avatars';
import { useTheme } from '@/hooks/use-theme';

/** Default PNGs already include transparent padding (~16%). Full-bleed photos do not. */
const DEFAULT_CONTENT_RATIO = 0.84;

type AvatarProps = {
  uri?: string;
  size: number;
  isGroup?: boolean;
  /** Small badge in the bottom-right corner (e.g. disappearing messages timer). */
  showTimerBadge?: boolean;
};

function usesPaddedAsset(uri?: string) {
  return isDefaultAvatar(uri) || uri === 'asset:0';
}

export function Avatar({ uri, size, isGroup, showTimerBadge }: AvatarProps) {
  const theme = useTheme();
  const padded = usesPaddedAsset(uri);
  const mediaSize = padded ? size : Math.round(size * DEFAULT_CONTENT_RATIO);
  const radius = mediaSize / 2;
  const badgeSize = Math.round(size * 0.36);
  const source = avatarImageSource(uri);

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      {source ? (
        <Image
          key={isDefaultAvatar(uri) ? DEFAULT_AVATAR_KEY : uri}
          source={source}
          style={{ width: mediaSize, height: mediaSize, borderRadius: radius, overflow: 'hidden' }}
          contentFit="cover"
          transition={0}
          recyclingKey={isDefaultAvatar(uri) ? DEFAULT_AVATAR_KEY : uri}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: mediaSize, height: mediaSize, borderRadius: radius, backgroundColor: theme.avatarPlaceholder },
          ]}>
          <Icon
            name={isGroup ? 'group' : 'person'}
            size={mediaSize * 0.5}
            color={theme.avatarPlaceholderIcon}
          />
        </View>
      )}

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
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
