import { StyleSheet, Text } from 'react-native';

import { GlassSurface } from '@/components/glass-surface';
import { Icon } from '@/components/icon';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function PinnedBanner({ text }: { text: string }) {
  const theme = useTheme();

  return (
    <GlassSurface style={styles.banner}>
      <Icon name="pin" size={16} color={theme.textSecondary} />
      <Text style={[styles.text, { color: theme.text }]} numberOfLines={1}>
        {text}
      </Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginTop: Spacing.two,
    marginHorizontal: Spacing.three,
    paddingHorizontal: Spacing.four,
    height: 40,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    overflow: 'hidden',
  },
  text: {
    flex: 1,
    fontSize: FontSize.subhead,
  },
});
