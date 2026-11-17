// @ts-nocheck
'use client';
// Floating résumé button, bottom centre, matching the share button (left) and
// the + menu (right). Hover widens it into a pill that reads "Résumé" with a
// download bar sweeping across; click fills the bar, shows a tick and downloads.
import React, { useEffect, useRef, useState } from 'react';

export default function ResumeFAB({ href, filename, ink = '#F2EEE6', isDark = true }) {
  const [hover, setHover] = useState(false);
  const [done, setDone] = useState(false);
  const [touch, setTouch] = useState(false);
  const linkRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    const sync = () => setTouch(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => { mq.removeEventListener('change', sync); timers.current.forEach(clearTimeout); };
  }, []);

  const glass = isDark
    ? { background: 'rgba(120,120,120,0.22)', backdropFilter: 'blur(14px) saturate(1.4) brightness(1.15)', WebkitBackdropFilter: 'blur(14px) saturate(1.4) brightness(1.15)', border: '1px solid rgba(255,255,255,0.22)' }
    : { background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(14px) saturate(1.6)', WebkitBackdropFilter: 'blur(14px) saturate(1.6)', border: '1px solid rgba(20,16,10,0.10)' };
  const onFill = isDark ? '#0A0A0A' : '#F6F4EF';

  const open = (hover && !touch) || done;
  const click = e => {
    e.preventDefault();
    if (done) return;
    setDone(true);
    timers.current.push(setTimeout(() => linkRef.current?.click(), 320));
    timers.current.push(setTimeout(() => setDone(false), 1700));
  };

  return (
    <div className="fab-resume" style={{ position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 100 }}>
      <button
        type="button"
        aria-label="Download résumé (PDF)"
        data-cursor-hover="true"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={click}
        style={{
          position: 'relative', overflow: 'hidden', isolation: 'isolate', height: 56, width: open ? 156 : 56,
          borderRadius: 999, ...glass, cursor: 'pointer', padding: 0, color: done ? onFill : ink,
          boxShadow: isDark ? '0 8px 20px rgba(0,0,0,0.25)' : '0 8px 22px rgba(40,30,15,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'width 0.4s cubic-bezier(0.2,0.9,0.3,1), color 0.2s ease',
        }}
      >
        {/* download bar */}
        <span aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: -1, transformOrigin: 'left center',
          background: done ? ink : 'transparent', transform: `scaleX(${done ? 1 : 0})`,
          transition: done ? 'transform 0.32s cubic-bezier(0.4,0,0.2,1)' : 'transform 0.25s ease, background 0s linear 0.25s',
        }} />
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.66rem', letterSpacing: '0.18em', textTransform: 'uppercase',
          whiteSpace: 'nowrap', maxWidth: open ? 80 : 0, opacity: open ? 1 : 0, overflow: 'hidden',
          // spacing lives on the label so the icon is dead centre when the label is hidden
          marginRight: open ? 10 : 0,
          transition: 'max-width 0.4s cubic-bezier(0.2,0.9,0.3,1), margin 0.4s cubic-bezier(0.2,0.9,0.3,1), opacity 0.25s ease',
        }}>Résumé</span>
        <span aria-hidden="true" style={{ position: 'relative', width: 16, height: 18, flexShrink: 0 }}>
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', inset: 0, opacity: done ? 0 : 1, transform: `translateY(${open && !done ? 2 : 0}px)`, transition: 'transform 0.3s ease, opacity 0.15s ease' }}>
            <path d="M8 1.5v11M3.5 8.5 8 13l4.5-4.5M2 16.5h12" />
          </svg>
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', inset: 0, opacity: done ? 1 : 0, transform: `scale(${done ? 1 : 0.4})`, transition: 'transform 0.35s cubic-bezier(0.3,1.6,0.5,1) 0.18s, opacity 0.2s ease 0.18s' }}>
            <path d="M2 9.5 6.2 13.7 14 4.5" />
          </svg>
        </span>
      </button>
      <a ref={linkRef} href={href} download={filename} style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />
    </div>
  );
}
