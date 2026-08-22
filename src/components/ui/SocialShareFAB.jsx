// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const ICONS = {
  instagram: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 01-1.38-.9 3.72 3.72 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56a5.88 5.88 0 00-2.13 1.39A5.88 5.88 0 00.63 4.15c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.3.79.71 1.46 1.39 2.13a5.88 5.88 0 002.13 1.39c.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.88 5.88 0 002.13-1.39 5.88 5.88 0 001.39-2.13c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.88 5.88 0 00-1.39-2.13A5.88 5.88 0 0019.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.41-10.4a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z',
  github: 'M12 0C5.37 0 0 5.5 0 12.26c0 5.42 3.44 10.02 8.21 11.65.6.11.82-.27.82-.6 0-.29-.01-1.06-.02-2.08-3.34.74-4.04-1.64-4.04-1.64-.55-1.42-1.34-1.8-1.34-1.8-1.09-.76.08-.74.08-.74 1.21.09 1.84 1.26 1.84 1.26 1.08 1.86 2.83 1.33 3.52 1.02.11-.79.42-1.33.76-1.64-2.67-.31-5.47-1.36-5.47-6.03 0-1.33.46-2.42 1.23-3.28-.12-.31-.53-1.56.12-3.25 0 0 1-.33 3.3 1.25a11.3 11.3 0 016 0c2.29-1.58 3.29-1.25 3.29-1.25.66 1.69.24 2.94.12 3.25.77.86 1.23 1.95 1.23 3.28 0 4.68-2.8 5.72-5.48 6.02.43.38.81 1.13.81 2.28 0 1.65-.02 2.98-.02 3.39 0 .33.22.72.83.6C20.57 22.27 24 17.68 24 12.26 24 5.5 18.63 0 12 0z',
  linkedin: 'M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 11.02-4.12 2.06 2.06 0 01-.02 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z',
  x: 'M18.24 2.25h3.3l-7.2 8.23 8.47 11.27h-6.63l-5.2-6.8-5.95 6.8H1.72l7.7-8.8L1.3 2.25h6.8l4.7 6.2 5.44-6.2z',
};

const ICON_COLORS = { instagram: '#FF5DA2', github: '#A78BFA', linkedin: '#4ECDC4', x: '#FF8C42' };
const SOCIALS = [
  { key: 'instagram', href: 'https://instagram.com/art_by_kaanssar', depth: 1.4 },
  { key: 'github', href: 'https://github.com/KAANSSAR', depth: 1 },
  { key: 'linkedin', href: 'https://linkedin.com/in/kanishka-sarkar', depth: 0.7 },
];

function injectCSS() {
  if (document.getElementById('sfab-styles')) return;
  const s = document.createElement('style');
  s.id = 'sfab-styles';
  s.textContent = `@keyframes sfabPulse { 0% { transform: scale(1); opacity: .5; } 100% { transform: scale(1.9); opacity: 0; } }`;
  document.head.appendChild(s);
}

function SocialShareFAB({ ink = '#0A0A0A', bg = '#FFFFFF', itemGap = 60, isDark = true }) {
  const [open, setOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);
  const glass = isDark
    ? { background: 'rgba(120,120,120,0.22)', backdropFilter: 'blur(14px) saturate(1.4) brightness(1.15)', WebkitBackdropFilter: 'blur(14px) saturate(1.4) brightness(1.15)', border: '1px solid rgba(255,255,255,0.22)' }
    : { background: 'rgba(15,15,15,0.55)', backdropFilter: 'blur(14px) saturate(1.2) brightness(0.9)', WebkitBackdropFilter: 'blur(14px) saturate(1.2) brightness(0.9)', border: '1px solid rgba(255,255,255,0.12)' };

  useEffect(() => { injectCSS(); }, []);

  useEffect(() => {
    if (!open) return;
    const onMove = e => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMouse({ x: e.clientX - (rect.left + rect.width / 2), y: e.clientY - (rect.top + rect.height / 2) });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [open]);

  const n = SOCIALS.length;

  return (
    <div ref={wrapRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ position: 'fixed', bottom: 0, left: 28, zIndex: 100, width: itemGap * SOCIALS.length + 60, height: 60, pointerEvents: 'auto' }}
    >
      {SOCIALS.map((s, i) => {
        const bx = 66 + i * itemGap, by = 0;
        const px = mouse.x * 0.06 * s.depth, py = mouse.y * 0.06 * s.depth;
        const dimmed = hoverIdx != null && hoverIdx !== i;
        return (
          <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.key}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            style={{
              position: 'absolute', left: 28, bottom: 28, width: 44, height: 44, borderRadius: '50%',
              ...glass, boxShadow: '0 6px 16px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: open ? `translate(${bx + px}px, ${by + py}px) scale(${dimmed ? 0.92 : 1})` : 'translate(0,0) scale(0.3)',
              opacity: open ? (dimmed ? 0.45 : 1) : 0,
              filter: dimmed ? 'blur(1.5px)' : 'none',
              transition: open
                ? `transform .5s cubic-bezier(.34,1.56,.64,1) ${i * 0.05}s, opacity .35s ease ${i * 0.05}s, filter .25s ease`
                : `transform .3s ease ${(n - 1 - i) * 0.04}s, opacity .25s ease ${(n - 1 - i) * 0.04}s`,
              pointerEvents: open ? 'auto' : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={ICON_COLORS[s.key]}><path d={ICONS[s.key]} /></svg>
          </a>
        );
      })}

      <div style={{ position: 'absolute', left: 28, bottom: 28, width: 56, height: 56, transform: 'translate(-6px,-6px)', pointerEvents: 'none' }}>
        {!open && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${ink}`, animation: 'sfabPulse 2.2s ease-out infinite' }} />}
      </div>

      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Share"
        style={{
          position: 'absolute', left: 28, bottom: 28, width: 56, height: 56, borderRadius: '50%', ...glass,
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)', cursor: 'pointer', pointerEvents: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="M8.6 10.6l6.8-3.9M8.6 13.4l6.8 3.9" />
        </svg>
      </button>
    </div>
  );
}

export default SocialShareFAB;
