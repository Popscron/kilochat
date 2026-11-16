import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const PIN_TILE_SIZE = 40;
export const PINNED_ROW_HEIGHT = PIN_TILE_SIZE + Spacing.three * 2;

/** Pinned message row inside the chat header band: pin tile + one line of text. */
export function PinnedBanner({ text, onPress }: { text: string; onPress?: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Pinned message: ${text}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.tile, { backgroundColor: theme.searchField }]}>
        <Icon name="pin" size={18} color={theme.textSecondary} />
      </View>
      <Text style={[styles.text, { color: theme.text }]} numberOfLines={1}>
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    height: PINNED_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  tile: {
    width: PIN_TILE_SIZE,
    height: PIN_TILE_SIZE,
    borderRadius: Radius.small + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: FontSize.body,
  },
  pressed: {
    opacity: 0.6,
  },
});
