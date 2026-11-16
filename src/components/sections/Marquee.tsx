'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { MARQUEE_ITEMS } from '@/lib/data';

export default function Marquee() {
  const { T, isDark } = useTheme();
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div style={{
      background: isDark ? T.darkPanel : '#ECE8E0', overflow: 'hidden', padding: '16px 0',
      borderTop: isDark ? 'none' : `0.5px solid ${T.line}`, borderBottom: isDark ? 'none' : `0.5px solid ${T.line}`,
    }}>
      <div style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content', animation: 'marqueeScroll 24s linear infinite' }}>
        {doubled.map((m, i) => (
          <span
            key={i}
            className="marquee-item"
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: '0.63rem', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: isDark ? 'rgba(255,255,255,0.4)' : `rgba(${T.inkRgb},0.55)`, padding: '0 32px', display: 'inline-flex', alignItems: 'center', gap: 32,
            }}
          >
            {m} <span style={{ color: T.gold, opacity: 0.6 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
