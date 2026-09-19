import type { Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icon';
import { FontSize, HitSlop, Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const SEARCH_PLACEHOLDER = 'Ask Meta AI or Search ';

type SearchFieldButtonProps = {
  onPress: () => void;
  ref?: Ref<View>;
};

/** The static pill in the chat list header. Tapping it starts search mode. */
export function SearchFieldButton({ onPress, ref }: SearchFieldButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel="Search chats"
      style={styles.buttonWrapper}>
      <View ref={ref} collapsable={false} style={[styles.field, { backgroundColor: theme.searchField }]}>
        <Icon name="search" size={18} color={theme.textSecondary} />
        <Text style={[styles.text, { color: theme.textSecondary }]} numberOfLines={1}>
          {SEARCH_PLACEHOLDER}
        </Text>
      </View>
    </Pressable>
  );
}

type SearchFieldInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<ViewStyle>;
};

/** The editable pill shown while search mode is active. */
export function SearchFieldInput({ value, onChangeText, style }: SearchFieldInputProps) {
  const theme = useTheme();

  return (
    <View style={[styles.field, { backgroundColor: theme.searchField }, style]}>
      <Icon name="search" size={18} color={theme.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoFocus
        placeholder={SEARCH_PLACEHOLDER}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.accent}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        style={[styles.text, styles.input, { color: theme.text }]}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={HitSlop}
          accessibilityLabel="Clear search"
          style={[styles.clear, { backgroundColor: theme.textTertiary }]}>
          <Icon name="close" size={10} color={theme.background} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    paddingHorizontal: Spacing.four,
  },
  field: {
    height: Layout.searchFieldHeight,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  text: {
    flex: 1,
    fontSize: FontSize.body,
  },
  input: {
    height: '100%',
    paddingVertical: 0,
  },
  clear: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
