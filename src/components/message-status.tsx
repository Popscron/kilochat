import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { MessageStatus as Status } from '@/data';
import { useTheme } from '@/hooks/use-theme';

type MessageStatusProps = {
  status?: Status;
  size?: number;
  /** Colour used for sent/delivered ticks. Read ticks are always blue. */
  color?: string;
};

/** WhatsApp ticks: ✓ sent, ✓✓ delivered, blue ✓✓ read. */
export function MessageStatus({ status, size = 14, color }: MessageStatusProps) {
  const theme = useTheme();
  if (!status || status === 'sending') return null;

  const tint = status === 'read' ? theme.readTick : (color ?? theme.textSecondary);
  const double = status !== 'sent';
  const overlap = size * 0.4;

  return (
    <View style={[styles.row, { height: size, width: double ? size * 2 - overlap : size }]}>
      <Icon name="check" size={size} color={tint} />
      {double && (
        <Icon name="check" size={size} color={tint} style={{ marginLeft: -overlap }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
