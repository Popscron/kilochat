import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, type View } from 'react-native';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useTabBarVisibility } from '@/components/tab-bar-visibility';
import { Motion } from '@/constants/theme';

const timing = { duration: Motion.searchDuration, easing: Easing.bezier(0.25, 0.9, 0.3, 1) };

/**
 * Drives the WhatsApp search transition: the header slides up, the search pill
 * travels from its place in the list to the top of the screen and the
 * suggestions fade in. `progress` goes 0 (list) → 1 (search).
 */
export function useSearchTransition(targetY: number) {
  const progress = useSharedValue(0);
  /** Y of the search pill inside the container when search was opened. */
  const startY = useSharedValue(targetY);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<View>(null);
  const anchorRef = useRef<View>(null);
  const { setHidden: setTabBarHidden } = useTabBarVisibility();

  const open = useCallback(() => {
    const container = containerRef.current;
    const anchor = anchorRef.current;
    if (!container || !anchor) return;

    container.measureInWindow((_cx, containerY) => {
      anchor.measureInWindow((_ax, anchorY) => {
        // If the pill is scrolled out of view, grow it from the top instead.
        startY.set(Math.max(anchorY - containerY, targetY));
        setIsOpen(true);
        setTabBarHidden(true);
        progress.set(withTiming(1, timing));
      });
    });
  }, [progress, startY, targetY, setTabBarHidden]);

  const close = useCallback(() => {
    Keyboard.dismiss();
    setTabBarHidden(false);
    progress.set(
      withTiming(0, timing, (finished) => {
        if (finished) {
          scheduleOnRN(setIsOpen, false);
          scheduleOnRN(setQuery, '');
        }
      })
    );
  }, [progress, setTabBarHidden]);

  useEffect(() => {
    if (!isOpen) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => subscription.remove();
  }, [isOpen, close]);

  return { progress, startY, targetY, isOpen, open, close, query, setQuery, containerRef, anchorRef };
}

export type SearchTransition = ReturnType<typeof useSearchTransition>;
