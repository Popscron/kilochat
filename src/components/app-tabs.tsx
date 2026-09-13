import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { iconSymbols, type IconName } from '@/components/icon';
import { useTabBarVisibility } from '@/components/tab-bar-visibility';
import { getTotalUnreadCount } from '@/data';
import { useTheme } from '@/hooks/use-theme';

type TabConfig = {
  /** Route file name inside `app/(tabs)`. */
  name: string;
  label: string;
  icon: IconName;
  badge?: () => string | undefined;
};

/** Same order as WhatsApp. `index` is the Chats tab so it opens by default. */
const TABS: TabConfig[] = [
  { name: 'updates', label: 'Updates', icon: 'updates' },
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
            <NativeTabs.Trigger.Icon sf={symbols.ios} md={symbols.android} />
            {badgeValue && <NativeTabs.Trigger.Badge>{badgeValue}</NativeTabs.Trigger.Badge>}
          </NativeTabs.Trigger>
        );
      })}
    </NativeTabs>
  );
}
