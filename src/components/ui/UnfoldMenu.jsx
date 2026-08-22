// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const SECTION_COLORS = { About: '#FF6B6B', Experience: '#4ECDC4', Projects: '#FFE66D', 'Quant Lab': '#F5C518', Blog: '#4ECDC4', Life: '#A78BFA', Contact: '#FF8C42', Home: '#5FD068' };
const ICONS = {
  Home: 'M12 3l9 8h-3v9h-4v-6H10v6H6v-9H3z',
  About: 'M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.5 0-10.4 1.7-10.4 5.2v1.2h20.8v-1.2c0-3.5-6.9-5.2-10.4-5.2z',
  Experience: 'M4 20h3V10H4v10zm6.5 0h3V4h-3v16zM17 20h3v-7h-3v7z',
  Projects: 'M3 6.5A1.5 1.5 0 0 1 4.5 5H10l2 2h7.5A1.5 1.5 0 0 1 21 8.5v10A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5v-12z',
  Life: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.5 12.5 4.5-5.5 3 3.5 3-4L20.5 17H5.5z',
  Contact: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.5 2.5.8 3.9.8.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.8 22 2 13.2 2 3c0-.6.4-1 1-1h3.9c.6 0 1 .4 1 1 0 1.4.3 2.7.8 3.9.1.4.1.8-.2 1.1z',
  Dark: 'M12 3a9 9 0 1 0 9 9c0-.3 0-.6-.1-.9a7 7 0 0 1-8.9-8.9c-.3-.1-.6-.2-1-.2z',
  Light: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5v3m0 20v-3m10-8h-3M5 12H2m15.5-6.5-2 2m-11 11-2 2m0-15 2 2m11 11 2 2',
};

function UnfoldMenu({ items = [], onSelect, ink = '#0A0A0A', bg = '#FFFFFF', isDark = true }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const glass = isDark
    ? { background: 'rgba(120,120,120,0.22)', backdropFilter: 'blur(14px) saturate(1.4) brightness(1.15)', WebkitBackdropFilter: 'blur(14px) saturate(1.4) brightness(1.15)', border: '1px solid rgba(255,255,255,0.22)' }
    : { background: 'rgba(15,15,15,0.55)', backdropFilter: 'blur(14px) saturate(1.2) brightness(0.9)', WebkitBackdropFilter: 'blur(14px) saturate(1.2) brightness(0.9)', border: '1px solid rgba(255,255,255,0.12)' };
  const content = isDark ? ink : '#FFFFFF';

  const handleEnter = () => setOpen(true);
  const handleLeave = () => setOpen(false);

  return (
    <div
      onMouseLeave={handleLeave}
      style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14, paddingTop: 260, paddingLeft: 40, pointerEvents: open ? 'auto' : 'none' }}
    >
      {items.slice().reverse().map((it, ri) => {
        const i = items.length - 1 - ri;
        const rot = -3 - i * 1.4;
        const shift = i * 26;
        return (
          <div key={it.label}
            onClick={() => { setOpen(false); onSelect?.(it); }}
            onMouseEnter={e => { e.currentTarget.style.transform = e.currentTarget.style.transform.replace(/scale\([^)]*\)/, 'scale(1.08)'); }}
            onMouseLeave={e => { e.currentTarget.style.transform = e.currentTarget.style.transform.replace(/scale\([^)]*\)/, 'scale(1)'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px 10px 12px', borderRadius: 999,
              ...glass, boxShadow: '0 8px 20px rgba(0,0,0,0.25)', cursor: 'pointer',
              transform: open ? `translate(-${shift}px, 0) rotate(${rot}deg) scale(1)` : 'translate(0,12px) rotate(0deg) scale(0.6)',
              opacity: open ? 1 : 0,
              transformOrigin: 'right center',
              transition: `transform .15s ease, opacity .3s ease ${(items.length - 1 - i) * 0.05}s`,
              pointerEvents: open ? 'auto' : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={SECTION_COLORS[it.label] || content}><path d={ICONS[it.label] || ICONS.About} /></svg>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: SECTION_COLORS[it.label] || content, whiteSpace: 'nowrap' }}>{it.label}</span>
          </div>
        );
      })}

      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={handleEnter}
        aria-label="Menu"
        style={{
          width: 56, height: 56, borderRadius: '50%', ...glass,
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)', cursor: 'pointer', pointerEvents: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" style={{ transition: 'transform .3s ease' }}>
          <path d="M12 5v14M5 12h14" stroke={content} strokeWidth="2" strokeLinecap="round"
            style={{ transformOrigin: '12px 12px', transition: 'transform .35s ease', transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }} />
        </svg>
      </button>
    </div>
  );
}

export default UnfoldMenu;
