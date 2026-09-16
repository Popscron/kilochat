import { Appearance } from 'react-native';
import { useSyncExternalStore } from 'react';
import { File, Paths } from 'expo-file-system';

export type ThemePreference = 'light' | 'dark' | 'system';

const FILE_NAME = 'theme-preference.txt';

let preference: ThemePreference = 'system';
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return preference;
}

function getVersion() {
  return version;
}

function preferenceFile() {
  return new File(Paths.document, FILE_NAME);
}

function applyNative(next: ThemePreference) {
  Appearance.setColorScheme(next === 'system' ? null : next);
}

export function getThemePreference(): ThemePreference {
  return preference;
}

export function resolvedColorScheme(system?: 'light' | 'dark' | null): 'light' | 'dark' {
  if (preference === 'light' || preference === 'dark') return preference;
  return system === 'dark' ? 'dark' : 'light';
}

export function setThemePreference(next: ThemePreference) {
  if (preference === next) return;
  preference = next;
  applyNative(next);
  emit();
  try {
    const file = preferenceFile();
    if (!file.exists) file.create();
    file.write(next);
  } catch {
    // Preference still applies for this launch.
  }
}

export async function restoreThemePreference() {
  try {
    const file = preferenceFile();
    if (!file.exists) return;
    const value = (await file.text()).trim();
    if (value === 'light' || value === 'dark' || value === 'system') {
      preference = value;
      applyNative(value);
      emit();
    }
  } catch {
    // Keep system default.
  }
}

export function useThemePreference() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useThemePreferenceVersion() {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}

restoreThemePreference();
