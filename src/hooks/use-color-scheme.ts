import { useColorScheme as useRNColorScheme } from 'react-native';

import { resolvedColorScheme, useThemePreference } from '@/theme/preference';

export function useColorScheme(): 'light' | 'dark' {
  useThemePreference();
  return resolvedColorScheme(useRNColorScheme());
}
