import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Image, type ImageSourcePropType } from 'react-native';

import { iconSymbols, type IconName } from '@/components/icon';
import { useTabBarVisibility } from '@/components/tab-bar-visibility';
import { getCurrentUser, getTotalUnreadCount, useChatData } from '@/data';
import { useTheme } from '@/hooks/use-theme';
import { useProfileTabIcon } from '@/profile/tab-avatar';

const STATUS_TAB_ASSET = require('../../assets/icons/status-tab.png');
const CHATS_TAB_ASSET = require('../../assets/icons/chats-tab.png');
const CHATS_TAB_SELECTED_ASSET = require('../../assets/icons/chats-tab-selected.png');
const COMMUNITIES_TAB_ASSET = require('../../assets/icons/communities-tab.png');

/** Keep PNG tab icons at SF Symbol size so iOS 26 does not fill the selected pill. */
function nativeTabImage(asset: number, pt = 25): ImageSourcePropType {
  const resolved = Image.resolveAssetSource(asset);
  if (!resolved?.uri) return asset;
  return {
    uri: resolved.uri,
    width: pt,
    height: pt,
    scale: resolved.scale > 1 ? resolved.scale : 3,
  };
}

const STATUS_TAB_ICON = nativeTabImage(STATUS_TAB_ASSET);
const CHATS_TAB_ICON = nativeTabImage(CHATS_TAB_ASSET, 31);
const CHATS_TAB_SELECTED_ICON = nativeTabImage(CHATS_TAB_SELECTED_ASSET, 31);
const COMMUNITIES_TAB_ICON = nativeTabImage(COMMUNITIES_TAB_ASSET, 31);

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
  const { hidden } = useTabBarVisibility();
  useChatData();
  const profileTabIcon = useProfileTabIcon(getCurrentUser().avatar);

  return (
    <NativeTabs
      hidden={hidden}
      tintColor={theme.text}
      iconColor={{ default: theme.text, selected: theme.text }}
      labelStyle={{ default: { color: theme.text }, selected: { color: theme.text } }}
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
              <NativeTabs.Trigger.Icon src={STATUS_TAB_ICON} renderingMode="template" />
            ) : icon === 'chats' ? (
              <NativeTabs.Trigger.Icon
                src={{ default: CHATS_TAB_ICON, selected: CHATS_TAB_SELECTED_ICON }}
                renderingMode="template"
              />
            ) : icon === 'communities' ? (
              <NativeTabs.Trigger.Icon src={COMMUNITIES_TAB_ICON} renderingMode="template" />
            ) : icon === 'you' ? (
              <NativeTabs.Trigger.Icon src={profileTabIcon} renderingMode="original" />
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
