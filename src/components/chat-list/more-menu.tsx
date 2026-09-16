import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/glass-surface';
import { FontSize, Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type MoreMenuProps = {
  visible: boolean;
  onClose: () => void;
  onGenerate: () => void;
  onMarkAllRead: () => void;
};

export function MoreMenu({ visible, onClose, onGenerate, onMarkAllRead }: MoreMenuProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View
          style={[styles.anchor, { top: insets.top + Spacing.two, left: Spacing.four }]}
          onStartShouldSetResponder={() => true}>
          <GlassSurface style={styles.card}>
            <MenuRow
              label="Generate"
              color={theme.text}
              onPress={() => {
                onClose();
                onGenerate();
              }}
            />
            <View style={[styles.separator, { backgroundColor: theme.separator }]} />
            <MenuRow
              label="Mark all as read"
              color={theme.text}
              onPress={() => {
                onClose();
                onMarkAllRead();
              }}
            />
          </GlassSurface>
        </View>
      </Pressable>
    </Modal>
  );
}

function MenuRow({
  label,
  color,
  onPress,
}: {
  label: string;
  color: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.groupedCardPressed },
      ]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  anchor: {
    position: 'absolute',
    minWidth: 220,
    maxWidth: 280,
  },
  card: {
    borderRadius: Radius.medium,
    overflow: 'hidden',
    minWidth: 220,
  },
  row: {
    minHeight: Layout.settingsRowHeight - 4,
    paddingHorizontal: Spacing.five,
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.body,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.four,
  },
});
