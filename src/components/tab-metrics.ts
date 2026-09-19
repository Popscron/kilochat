/**
 * WhatsApp iOS tab icons are ~31pt. NativeTabs often uses the bitmap point
 * size (px / scale), so the PNGs are 31pt @3x (93px). Compact widths drop
 * 1pt if the width/height hint is honored, to avoid crowding.
 */
export function tabIconPointSize(width: number) {
  if (width < 400) return 30;
  if (width < 440) return 31;
  return 31;
}

/** Updates, Chats, and Communities — same optical size as WhatsApp. */
export function tabPngIconPointSize(width: number) {
  return tabIconPointSize(width);
}

export function tabLabelFontSize(width: number) {
  if (width < 400) return 9;
  if (width < 440) return 10;
  return 11;
}
