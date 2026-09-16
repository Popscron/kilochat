import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { setLoginCountry } from '@/auth/login-country';
import { Icon } from '@/components/icon';
import { COUNTRIES, countryFlag, type Country } from '@/constants/countries';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function CountryPickerScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const sections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = COUNTRIES.filter((country) => {
      if (!needle) return true;
      return (
        country.name.toLowerCase().includes(needle) ||
        country.dial.includes(needle.replace('+', '')) ||
        country.iso.toLowerCase().includes(needle)
      );
    });
    const groups = new Map<string, Country[]>();
    for (const country of filtered) {
      const letter = country.name[0]!.toUpperCase();
      const list = groups.get(letter) ?? [];
      list.push(country);
      groups.set(letter, list);
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [query]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={[styles.top, { paddingTop: insets.top + Spacing.one, borderBottomColor: theme.separator }]}>
        <Pressable accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Icon name="back" size={22} color={theme.icon} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Choose a country</Text>
        <View style={styles.back} />
      </View>

      <View style={[styles.searchWrap, { backgroundColor: theme.backgroundElement }]}>
        <Icon name="search" size={18} color={theme.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search countries"
          placeholderTextColor={theme.textTertiary}
          autoCorrect={false}
          autoCapitalize="none"
          selectionColor={theme.accent}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.iso + item.dial}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.eight }}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: theme.background }]}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setLoginCountry(item);
              router.back();
            }}
            style={({ pressed }) => [
              styles.row,
              pressed && { backgroundColor: theme.backgroundElement },
            ]}>
            <Text style={styles.flag}>{countryFlag(item)}</Text>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.dial, { color: theme.textSecondary }]}>+{item.dial}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textSecondary }]}>No countries match that search.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  top: {
    minHeight: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {
    width: Layout.headerIconButtonSize,
    height: Layout.headerIconButtonSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  searchWrap: {
    margin: Spacing.four,
    height: Layout.searchFieldHeight,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    paddingVertical: 0,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
  },
  sectionTitle: {
    fontSize: FontSize.footnote,
    fontWeight: '600',
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  flag: {
    fontSize: 22,
    width: 32,
  },
  name: {
    flex: 1,
    fontSize: FontSize.body,
  },
  dial: {
    fontSize: FontSize.subhead,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  empty: {
    textAlign: 'center',
    padding: Spacing.eight,
    fontSize: FontSize.subhead,
  },
});
