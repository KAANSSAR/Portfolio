'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeRoot({ children }: { children: React.ReactNode }) {
  const { T, isDark } = useTheme();
  // Keep the page canvas (overscroll, behind fixed layers) in step with the theme.
  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = isDark ? 'dark' : 'light';
    root.style.background = T.bg;
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark, T.bg]);
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: T.bg,
        color: T.ink,
        transition: 'background .3s ease, color .3s ease',
        isolation: 'isolate',
      }}
    >
      {children}
    </div>
  );
}
