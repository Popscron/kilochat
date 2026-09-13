import AppTabs from '@/components/app-tabs';
import { TabBarVisibilityProvider } from '@/components/tab-bar-visibility';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function TabsLayout() {
  return (
    <TabBarVisibilityProvider>
      <AppTabs />
    </TabBarVisibilityProvider>
  );
}
