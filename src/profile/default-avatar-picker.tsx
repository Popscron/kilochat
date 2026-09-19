import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  DEFAULT_AVATAR,
  DEFAULT_AVATAR_KEY,
  DEFAULT_PLACEHOLDERS,
  defaultPlaceholderKey,
  PICKABLE_DEFAULTS,
} from '@/constants/avatars';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const OPTIONS =
  PICKABLE_DEFAULTS ??
  [
    { key: DEFAULT_AVATAR_KEY, source: DEFAULT_AVATAR },
    ...DEFAULT_PLACEHOLDERS.map((source, index) => ({
      key: defaultPlaceholderKey(index),
      source,
    })),
  ];

type PickerRequest = {
  onPick: (uri: string) => void;
};

let openPicker: ((request: PickerRequest) => void) | null = null;

export function showDefaultAvatarPicker(onPick: (uri: string) => void) {
  if (openPicker) {
    openPicker({ onPick });
    return;
  }
  onPick(DEFAULT_AVATAR_KEY);
}

export function DefaultAvatarPickerHost() {
  const theme = useTheme();
  const [request, setRequest] = useState<PickerRequest | null>(null);

  useEffect(() => {
    openPicker = setRequest;
    return () => {
      openPicker = null;
    };
  }, []);

  const close = () => setRequest(null);

  return (
    <Modal
      visible={!!request}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.groupedCard }]}
          onPress={() => {}}>
          <Text style={[styles.title, { color: theme.text }]}>Choose a default picture</Text>
          <View style={styles.row}>
            {OPTIONS.map((item, index) => (
              <Pressable
                key={item.key}
                onPress={() => {
                  request?.onPick(item.key);
                  close();
                }}
                accessibilityRole="button"
                accessibilityLabel={`Default picture ${index + 1}`}
                style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
                <Image source={item.source} style={styles.image} contentFit="cover" />
              </Pressable>
            ))}
          </View>
          <Pressable onPress={close} style={styles.cancel} accessibilityRole="button">
            <Text style={[styles.cancelLabel, { color: theme.textSecondary }]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const SIZE = 68;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    margin: Spacing.four,
    marginBottom: Spacing.eight,
    borderRadius: Radius.card,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderCurve: 'continuous',
  },
  title: {
    fontSize: FontSize.body,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.five,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  cell: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cancel: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  cancelLabel: {
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
