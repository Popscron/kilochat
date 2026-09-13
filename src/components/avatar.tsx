import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';

type AvatarProps = {
  uri?: string;
  size: number;
  isGroup?: boolean;
  /** Small badge in the bottom-right corner (e.g. disappearing messages timer). */
  showTimerBadge?: boolean;
};

export function Avatar({ uri, size, isGroup, showTimerBadge }: AvatarProps) {
  const theme = useTheme();
  const radius = size / 2;
  const badgeSize = Math.round(size * 0.36);

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: radius }}
          contentFit="cover"
          transition={150}
          recyclingKey={uri}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: radius, backgroundColor: theme.avatarPlaceholder },
          ]}>
          <Icon
            name={isGroup ? 'group' : 'person'}
            size={size * 0.5}
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
          <Icon name="timer" size={badgeSize * 0.7} color={theme.textSecondary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
