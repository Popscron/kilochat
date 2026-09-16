import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { MessageStatus as Status } from '@/data';
import { useTheme } from '@/hooks/use-theme';

const READ_RECEIPT = require('../../assets/receipts/read.png');
const DELIVERED_RECEIPT = require('../../assets/receipts/delivered.png');
const RECEIPT_ASPECT = 23 / 16;

type MessageStatusProps = {
  status?: Status;
  size?: number;
  /** Colour used for the single sent tick. Double ticks use the official WhatsApp assets. */
  color?: string;
};

function ReceiptImage({
  source,
  size,
  label,
  tint,
}: {
  source: number;
  size: number;
  label: string;
  tint?: string;
}) {
  return (
    <Image
      source={source}
      style={{ width: size * RECEIPT_ASPECT, height: size }}
      contentFit="contain"
      tintColor={tint}
      accessibilityLabel={label}
    />
  );
}

/** WhatsApp ticks: ✓ sent, grey ✓✓ delivered, blue ✓✓ read. */
export function MessageStatus({ status, size = 14, color }: MessageStatusProps) {
  const theme = useTheme();
  if (!status || status === 'sending') return null;

  const tickSize = size - 4;

  if (status === 'read') {
    return <ReceiptImage source={READ_RECEIPT} size={tickSize} label="Read" />;
  }

  if (status === 'delivered') {
    return (
      <ReceiptImage
        source={DELIVERED_RECEIPT}
        size={tickSize}
        label="Delivered"
        tint={color ?? theme.textSecondary}
      />
    );
  }

  return (
    <View style={[styles.row, { height: tickSize, width: tickSize }]}>
      <Icon name="check" size={tickSize} color={color ?? theme.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
