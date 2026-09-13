import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/glass-surface';
import { Icon } from '@/components/icon';
import { FontSize, HitSlop, Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subs = [
      Keyboard.addListener(show, () => setVisible(true)),
      Keyboard.addListener(hide, () => setVisible(false)),
    ];
    return () => subs.forEach((sub) => sub.remove());
  }, []);
  return visible;
}

type ComposerProps = {
  onSend: (text: string) => void;
};

export function Composer({ onSend }: ComposerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const [text, setText] = useState('');
  const hasText = text.trim().length > 0;

  const send = () => {
    if (!hasText) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: (keyboardVisible ? 0 : insets.bottom) + Spacing.two },
      ]}>
      <Pressable hitSlop={HitSlop} accessibilityLabel="Attach" style={styles.sideButton}>
        <Icon name="plus" size={26} color={theme.icon} />
      </Pressable>

      <GlassSurface style={styles.inputPill}>
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder=""
          selectionColor={theme.accent}
          style={[styles.input, { color: theme.text }]}
        />
        <Pressable hitSlop={HitSlop} accessibilityLabel="Stickers" style={styles.inlineIcon}>
          <Icon name="sticker" size={22} color={theme.icon} />
        </Pressable>
      </GlassSurface>

      {hasText ? (
        <Animated.View entering={ZoomIn.duration(150)} exiting={ZoomOut.duration(120)}>
          <Pressable
            onPress={send}
            accessibilityLabel="Send"
            style={[styles.sendButton, { backgroundColor: theme.accent }]}>
            <Icon name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View
          entering={ZoomIn.duration(150)}
          exiting={ZoomOut.duration(120)}
          style={styles.actions}>
          <Pressable hitSlop={HitSlop} accessibilityLabel="Camera" style={styles.sideButton}>
            <Icon name="camera" size={24} color={theme.icon} />
          </Pressable>
          <Pressable hitSlop={HitSlop} accessibilityLabel="Record voice message" style={styles.sideButton}>
            <Icon name="mic" size={24} color={theme.icon} />
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
    gap: Spacing.one,
  },
  sideButton: {
    height: Layout.composerMinHeight,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputPill: {
    flex: 1,
    minHeight: Layout.composerMinHeight,
    borderRadius: Radius.bubble + 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: Spacing.four,
    paddingRight: Spacing.two,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
  },
  inlineIcon: {
    height: Layout.composerMinHeight,
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  sendButton: {
    width: Layout.composerMinHeight,
    height: Layout.composerMinHeight,
    borderRadius: Layout.composerMinHeight / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.one,
  },
});
