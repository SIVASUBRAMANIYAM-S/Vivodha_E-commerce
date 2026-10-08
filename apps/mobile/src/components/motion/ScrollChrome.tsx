import { useFocusEffect } from 'expo-router';
import { createContext, useCallback, useContext, type ReactNode } from 'react';
import {
  useAnimatedScrollHandler,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { springTo } from '@/theme';

/**
 * Scroll-reactive chrome (the CartBar). `hidden` is 0 (visible) .. 1 (hidden),
 * driven entirely on the UI thread from scroll events: hide on scroll down,
 * reveal on scroll up or near the top.
 */
type ChromeApi = { hidden: SharedValue<number> };

const ChromeContext = createContext<ChromeApi | null>(null);

export function ScrollChromeProvider({ children }: { children: ReactNode }) {
  const hidden = useSharedValue(0);
  return <ChromeContext.Provider value={{ hidden }}>{children}</ChromeContext.Provider>;
}

export function useScrollChrome(): ChromeApi {
  const ctx = useContext(ChromeContext);
  if (!ctx) throw new Error('useScrollChrome must be used inside <ScrollChromeProvider>');
  return ctx;
}

/** Screens call this so chrome hidden on one screen reappears on the next. */
export function useResetChromeOnFocus() {
  const { hidden } = useScrollChrome();
  useFocusEffect(
    useCallback(() => {
      hidden.set(springTo(0, 'gentle'));
    }, [hidden]),
  );
}

const THRESHOLD = 12;

/**
 * Scroll handler for a screen's main list. Also exposes the scroll offset for
 * screen-local effects (collapsing header). Pass `extra` to chain your own logic.
 */
export function useChromeScrollHandler(scrollY?: SharedValue<number>) {
  const { hidden } = useScrollChrome();
  const last = useSharedValue(0);
  const travel = useSharedValue(0);

  return useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = e.contentOffset.y;
      if (scrollY) scrollY.set(y);
      const dy = y - last.get();
      last.set(y);
      if (y <= 24) {
        if (hidden.get() !== 0) hidden.set(springTo(0, 'gentle'));
        travel.set(0);
        return;
      }
      // Accumulate travel in one direction before toggling, so tiny jitters don't flicker.
      const t = Math.sign(dy) === Math.sign(travel.get()) ? travel.get() + dy : dy;
      travel.set(t);
      if (t > THRESHOLD && hidden.get() === 0) hidden.set(springTo(1, 'gentle'));
      else if (t < -THRESHOLD && hidden.get() === 1) hidden.set(springTo(0, 'gentle'));
    },
  });
}
