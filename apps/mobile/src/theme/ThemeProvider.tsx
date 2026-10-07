import { createContext, useContext, type ReactNode } from 'react';

import { themes, type ThemeColors, type ThemeName } from '@vivodha/shared/tokens';

type ThemeValue = { name: ThemeName; colors: ThemeColors };

const ThemeContext = createContext<ThemeValue>({ name: 'light', colors: themes.light });

/**
 * Light mode only for now (ADR-135). Dark mode = add a `dark` token set in
 * @vivodha/shared and choose it here from useColorScheme(); components that
 * read useTheme() need no changes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ name: 'light', colors: themes.light }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
