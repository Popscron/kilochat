import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useMemo } from 'react';
import { Image, useWindowDimensions, type ImageSourcePropType } from 'react-native';

import { iconSymbols, type IconName } from '@/components/icon';
import { useTabBarVisibility } from '@/components/tab-bar-visibility';
import { tabLabelFontSize, tabPngIconPointSize } from '@/components/tab-metrics';
import { getCurrentUser, getTotalUnreadCount, useChatData } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import { useProfileTabIcon } from '@/profile/tab-avatar';

const STATUS_TAB_ASSET = require('../../assets/icons/status-tab.png');
const CHATS_TAB_ASSET = require('../../assets/icons/chats-tab.png');
const CHATS_TAB_SELECTED_ASSET = require('../../assets/icons/chats-tab-selected.png');
const COMMUNITIES_TAB_ASSET = require('../../assets/icons/communities-tab.png');

/**
 * You-tab photos are data-URI PNGs so Expo Go on a real phone can display them.
 * NativeTabs uses the bitmap's point size. These PNGs are shipped as @3x.
 * Pass width/height in points and scale 3 so iOS 26 does not treat the raw
 * pixel size as the tab icon size. Compact phones get a smaller point size.
 */
function nativeTabImage(asset: number, pt: number): ImageSourcePropType {
  const resolved = Image.resolveAssetSource(asset);
  if (!resolved?.uri) return asset;
  return {
    uri: resolved.uri,
    width: pt,
    height: pt,
    scale: resolved.scale || 3,
  };
}

type TabConfig = {
  /** Route file name inside `app/(tabs)`. */
  name: string;
  label: string;
  icon: IconName;
  badge?: () => string | undefined;
};

/** Same order as WhatsApp. `index` is the Chats tab so it opens by default. */
const TABS: TabConfig[] = [
  { name: 'updates', label: 'Updates', icon: 'status' },
  { name: 'calls', label: 'Calls', icon: 'calls' },
  { name: 'communities', label: 'Communities', icon: 'communities' },
  {
    name: 'index',
    label: 'Chats',
    icon: 'chats',
    badge: () => {
      const unread = getTotalUnreadCount();
      return unread > 0 ? String(unread) : undefined;
    },
  },
  { name: 'you', label: 'You', icon: 'you' },
];

export default function AppTabs() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { hidden } = useTabBarVisibility();
  const data = useChatData();
  const tabIcon = useProfileTabIcon(data.currentUser.avatar ?? getCurrentUser().avatar, width);
  const iconPt = tabPngIconPointSize(width);
  const labelSize = tabLabelFontSize(width);
  const icons = useMemo(
    () => ({
      status: nativeTabImage(STATUS_TAB_ASSET, iconPt),
      chats: nativeTabImage(CHATS_TAB_ASSET, iconPt),
      chatsSelected: nativeTabImage(CHATS_TAB_SELECTED_ASSET, iconPt),
      communities: nativeTabImage(COMMUNITIES_TAB_ASSET, iconPt),
    }),
    [iconPt]
  );

  return (
    <NativeTabs
      key={`you-${tabIcon.uri}`}
      hidden={hidden}
      tintColor={theme.text}
      iconColor={{ default: theme.text, selected: theme.text }}
      labelStyle={{
        default: { color: theme.text, fontSize: labelSize },
        selected: { color: theme.text, fontSize: labelSize },
      }}
      backgroundColor={theme.background}
      indicatorColor={theme.chipActiveBackground}
      badgeBackgroundColor={theme.accentBright}
      badgeTextColor="#FFFFFF">
      {TABS.map(({ name, label, icon, badge }) => {
        const symbols = iconSymbols(icon);
        const badgeValue = badge?.();
        return (
          <NativeTabs.Trigger key={name} name={name}>
            <NativeTabs.Trigger.Label>{label}</NativeTabs.Trigger.Label>
            {icon === 'status' ? (
              <NativeTabs.Trigger.Icon src={icons.status} renderingMode="template" />
            ) : icon === 'chats' ? (
              <NativeTabs.Trigger.Icon
                src={{ default: icons.chats, selected: icons.chatsSelected }}
                renderingMode="template"
              />
            ) : icon === 'communities' ? (
              <NativeTabs.Trigger.Icon src={icons.communities} renderingMode="template" />
            ) : icon === 'you' ? (
              <NativeTabs.Trigger.Icon src={tabIcon.source} renderingMode="original" />
            ) : (
              <NativeTabs.Trigger.Icon sf={symbols.ios} md={symbols.android} />
            )}
            {badgeValue && <NativeTabs.Trigger.Badge>{badgeValue}</NativeTabs.Trigger.Badge>}
          </NativeTabs.Trigger>
        );
      })}
    </NativeTabs>
  );
}
