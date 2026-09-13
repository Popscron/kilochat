import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function DateSeparator({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.chip, { backgroundColor: theme.dateChip }]}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.three,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  label: {
    fontSize: FontSize.footnote - 1,
    fontWeight: '600',
  },
});
