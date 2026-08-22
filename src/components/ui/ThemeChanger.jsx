// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

function ThemeChanger({ isDark = false, onToggle, ink = '#0A0A0A', bg = '#FFFFFF' }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      style={{
        position: 'fixed', top: 35, right: 88, zIndex: 100, width: 64, height: 34, borderRadius: 999,
        border: `1px solid ${ink}33`, background: isDark ? ink : `${ink}0d`, cursor: 'pointer', padding: 3,
        display: 'flex', alignItems: 'center', justifyContent: isDark ? 'flex-end' : 'flex-start',
        transition: 'background .35s ease, justify-content .35s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: '50%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform .35s cubic-bezier(.65,0,.35,1)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round"
          style={{ position: 'absolute', opacity: isDark ? 0 : 1, transform: isDark ? 'scale(0.5) rotate(-45deg)' : 'scale(1) rotate(0deg)', transition: 'all .3s ease' }}>
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1.5v3M12 19.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1.5 12h3M19.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </svg>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={ink}
          style={{ position: 'absolute', opacity: isDark ? 1 : 0, transform: isDark ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(45deg)', transition: 'all .3s ease' }}>
          <path d="M20.7 15.5A8.5 8.5 0 0 1 9 4.3a.5.5 0 0 0-.6-.7 10 10 0 1 0 12.9 12.9.5.5 0 0 0-.6-1z" />
        </svg>
      </div>
    </button>
  );
}

export default ThemeChanger;
