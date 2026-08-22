'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeRoot({ children }: { children: React.ReactNode }) {
  const { T } = useTheme();
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
