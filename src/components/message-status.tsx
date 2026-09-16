import { Image } from 'expo-image';

import type { MessageStatus as Status } from '@/data';
import { useTheme } from '@/hooks/use-theme';

const SENT_RECEIPT = require('../../assets/receipts/sent.png');
const READ_RECEIPT = require('../../assets/receipts/read.png');
const DELIVERED_RECEIPT = require('../../assets/receipts/delivered.png');
const RECEIPT_ASPECT = 23 / 16;

type MessageStatusProps = {
  status?: Status;
  size?: number;
  /** Colour used for sent/delivered ticks. Read ticks use the official blue asset. */
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

/** WhatsApp ticks: grey ✓ sent, grey ✓✓ delivered, blue ✓✓ read. */
export function MessageStatus({ status, size = 14, color }: MessageStatusProps) {
  const theme = useTheme();
  if (!status) return null;

  const tickSize = size - 2;
  const muted = color ?? theme.textSecondary;

  if (status === 'read') {
    return <ReceiptImage source={READ_RECEIPT} size={tickSize} label="Read" />;
  }

  if (status === 'delivered') {
    return <ReceiptImage source={DELIVERED_RECEIPT} size={tickSize} label="Delivered" tint={muted} />;
  }

  return <ReceiptImage source={SENT_RECEIPT} size={tickSize} label="Sent" tint={muted} />;
}
