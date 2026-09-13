import { createContext, use, useState, type ReactNode } from 'react';

type TabBarVisibility = {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
};

const TabBarVisibilityContext = createContext<TabBarVisibility>({
  hidden: false,
  setHidden: () => {},
});

/** Lets a tab screen (e.g. search mode) temporarily hide the bottom tab bar. */
export function TabBarVisibilityProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return <TabBarVisibilityContext value={{ hidden, setHidden }}>{children}</TabBarVisibilityContext>;
}

export function useTabBarVisibility() {
  return use(TabBarVisibilityContext);
}
