import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassIconButton } from '@/components/glass-surface';
import { FontSize, HitSlop, Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function GeneratorHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.one, borderBottomColor: theme.separator }]}>
      <GlassIconButton icon="back" accessibilityLabel="Back" onPress={onBack} />
      <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

export function SectionCard({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.groupedCard }]}>{children}</View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const theme = useTheme();
  return <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{children}</Text>;
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? theme.chipActiveBorder : theme.chipBorder,
          backgroundColor: selected ? theme.chipActiveBackground : 'transparent',
        },
        pressed && { opacity: 0.7 },
      ]}>
      <Text style={[styles.chipLabel, { color: selected ? theme.chipActiveText : theme.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  subtitle,
  step = 1,
  min = 0,
  max = 50,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  subtitle?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  const theme = useTheme();
  const canDown = value > min;
  const canUp = value < max;
  return (
    <View style={styles.stepperRow}>
      <View style={styles.stepperLabels}>
        <Text style={[styles.stepperLabel, { color: theme.text }]}>{label}</Text>
        {!!subtitle && (
          <Text style={[styles.stepperSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      <View style={styles.stepperControls}>
        <Pressable
          accessibilityLabel={`Decrease ${label}`}
          accessibilityState={{ disabled: !canDown }}
          disabled={!canDown}
          hitSlop={HitSlop}
          onPress={() => onChange(value - step)}
          style={({ pressed }) => [
            styles.stepBtn,
            { borderColor: theme.chipBorder, backgroundColor: theme.backgroundElement },
            (!canDown || pressed) && { opacity: 0.45 },
          ]}>
          <Text style={[styles.stepBtnText, { color: theme.text }]}>−</Text>
        </Pressable>
        <Text style={[styles.stepValue, { color: theme.text }]}>{value}</Text>
        <Pressable
          accessibilityLabel={`Increase ${label}`}
          accessibilityState={{ disabled: !canUp }}
          disabled={!canUp}
          hitSlop={HitSlop}
          onPress={() => onChange(value + step)}
          style={({ pressed }) => [
            styles.stepBtn,
            { borderColor: theme.chipBorder, backgroundColor: theme.backgroundElement },
            (!canUp || pressed) && { opacity: 0.45 },
          ]}>
          <Text style={[styles.stepBtnText, { color: theme.text }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: theme.accent, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
      ]}>
      <Text style={[styles.primaryLabel, { color: theme.onAccent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Layout.topBarHeight,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    gap: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerRight: {
    minWidth: 64,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  card: {
    borderRadius: Radius.card,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.six,
    borderCurve: 'continuous',
  },
  sectionLabel: {
    fontSize: FontSize.footnote,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: Spacing.six,
    marginBottom: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three + 2,
    height: 34,
    justifyContent: 'center',
  },
  chipLabel: {
    fontSize: FontSize.subhead,
    fontWeight: '500',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Layout.settingsRowHeight,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  stepperLabels: {
    flex: 1,
    gap: Spacing.half,
  },
  stepperLabel: {
    fontSize: FontSize.body,
  },
  stepperSubtitle: {
    fontSize: FontSize.footnote,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: '500',
    marginTop: -1,
  },
  stepValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: FontSize.body,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  primary: {
    marginHorizontal: Spacing.four,
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontSize: FontSize.body,
    fontWeight: '700',
  },
});
