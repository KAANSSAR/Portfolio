'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { THEME, ThemeTokens } from '@/lib/data';

type ThemeContextValue = {
  isDark: boolean;
  T: ThemeTokens;
  toggleTheme: (e?: React.MouseEvent) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Design defaults to dark on load, matching Portfolio Rebuild.dc.html.
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = useCallback((e?: React.MouseEvent) => {
    const root = document.documentElement;
    if (e) {
      root.style.setProperty('--reveal-x', `${e.clientX}px`);
      root.style.setProperty('--reveal-y', `${e.clientY}px`);
    }
    const flip = () => setIsDark((d) => !d);
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(flip);
    } else {
      flip();
    }
  }, []);

  const T = isDark ? THEME.dark : THEME.light;

  return (
    <ThemeContext.Provider value={{ isDark, T, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
