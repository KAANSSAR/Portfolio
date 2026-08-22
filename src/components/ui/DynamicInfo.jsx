// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

function formatTime(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone }).format(date);
  } catch (e) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
  }
}

const ICONS = {
  instagram: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 01-1.38-.9 3.72 3.72 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56a5.88 5.88 0 00-2.13 1.39A5.88 5.88 0 00.63 4.15c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.3.79.71 1.46 1.39 2.13a5.88 5.88 0 002.13 1.39c.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.88 5.88 0 002.13-1.39 5.88 5.88 0 001.39-2.13c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.88 5.88 0 00-1.39-2.13A5.88 5.88 0 0019.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.41-10.4a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z',
  github: 'M12 0C5.37 0 0 5.5 0 12.26c0 5.42 3.44 10.02 8.21 11.65.6.11.82-.27.82-.6 0-.29-.01-1.06-.02-2.08-3.34.74-4.04-1.64-4.04-1.64-.55-1.42-1.34-1.8-1.34-1.8-1.09-.76.08-.74.08-.74 1.21.09 1.84 1.26 1.84 1.26 1.08 1.86 2.83 1.33 3.52 1.02.11-.79.42-1.33.76-1.64-2.67-.31-5.47-1.36-5.47-6.03 0-1.33.46-2.42 1.23-3.28-.12-.31-.53-1.56.12-3.25 0 0 1-.33 3.3 1.25a11.3 11.3 0 016 0c2.29-1.58 3.29-1.25 3.29-1.25.66 1.69.24 2.94.12 3.25.77.86 1.23 1.95 1.23 3.28 0 4.68-2.8 5.72-5.48 6.02.43.38.81 1.13.81 2.28 0 1.65-.02 2.98-.02 3.39 0 .33.22.72.83.6C20.57 22.27 24 17.68 24 12.26 24 5.5 18.63 0 12 0z',
  linkedin: 'M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 11.02-4.12 2.06 2.06 0 01-.02 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z',
};

const ICON_COLORS = { instagram: '#FF5DA2', github: '#A78BFA', linkedin: '#4ECDC4' };
const SOCIALS = [
  { key: 'instagram', href: 'https://instagram.com/art_by_kaanssar', label: 'Instagram' },
  { key: 'github', href: 'https://github.com/KAANSSAR', label: 'GitHub' },
  { key: 'linkedin', href: 'https://linkedin.com/in/kanishka-sarkar', label: 'LinkedIn' },
];

function DynamicInfo({
  name = 'Kanishka Sarkar',
  role = 'Software Engineer',
  initials = 'KS',
  location = 'Sydney, AU',
  timeZone = 'Australia/Sydney',
  status = 'Open to work',
  accent = '#FFFFFF',
}) {
  const [now, setNow] = useState(new Date());
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const handleEnter = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const handleLeave = () => { closeTimer.current = setTimeout(() => setOpen(false), 250); };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
        background: '#0A0A0A', borderRadius: '0 0 18px 18px',
        width: open ? 272 : 250, height: open ? 148 : 68,
        transition: 'width 0.45s cubic-bezier(.22,1,.36,1), height 0.45s cubic-bezier(.22,1,.36,1)',
        overflow: 'hidden', boxShadow: '0 12px 24px rgba(0,0,0,0.35)', cursor: 'pointer',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      }}
    >
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 16px', width: '100%',
        fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '0.75rem', color: '#0A0A0A',
          }}>{initials}</div>
          <div style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '0.78rem', color: '#FFFFFF', whiteSpace: 'nowrap' }}>{open ? name : name.split(' ')[0]}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                {!open && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3DDC73', display: 'inline-block', flexShrink: 0 }} />}
                <span style={{ fontSize: '0.5rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: open ? '#8C8C8C' : '#3DDC73', fontWeight: open ? 400 : 700, whiteSpace: open ? 'normal' : 'nowrap', maxWidth: open ? 230 : 150, overflow: open ? 'visible' : 'hidden', textOverflow: 'ellipsis' }}>{open ? role : status}</span>
              </div>
            </div>
            <div style={{ fontSize: '0.58rem', color: '#8C8C8C', flexShrink: 0 }}>{formatTime(now, timeZone)}</div>
          </div>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          maxHeight: open ? 80 : 0, opacity: open ? 1 : 0,
          transition: 'max-height .4s ease, opacity .3s ease', transitionDelay: open ? '0.1s' : '0s', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3DDC73', display: 'inline-block' }} />
            <span style={{ fontSize: '0.48rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#3DDC73', fontWeight: 700 }}>{status}</span>
            <span style={{ fontSize: '0.5rem', color: '#8C8C8C', marginLeft: 4 }}>{location}</span>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {SOCIALS.map(s => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                onClick={e => e.stopPropagation()}
                style={{ display: 'flex', color: ICON_COLORS[s.key], opacity: 0.7, transition: 'opacity .2s', transformStyle: 'preserve-3d' }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '1';
                  const el = e.currentTarget;
                  if (el.dataset.spinning === '1') return;
                  el.dataset.spinning = '1';
                  el.style.animation = 'globeSpinOnce 0.5s linear 1';
                  const onEnd = () => { el.style.animation = 'none'; delete el.dataset.spinning; el.removeEventListener('animationend', onEnd); };
                  el.addEventListener('animationend', onEnd);
                }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d={ICONS[s.key]} /></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DynamicInfo;
