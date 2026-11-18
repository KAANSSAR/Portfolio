// @ts-nocheck
'use client';
// Extra floating controls while a Writing post or Research note is open:
// a "Back" pill that closes the reader from anywhere in the article, and a
// back-to-top button that takes the place of the + menu.
// Readers announce themselves with body[data-reader="writing"|"research"] and
// mark their scroll container with .reader-scroll; they listen for
// "reader:close" to shut themselves.
import React, { useEffect, useState } from 'react';

export function readerOpen() {
  return typeof document !== 'undefined' && !!document.body.dataset.reader;
}

/** Closes the open reader, then scrolls the homepage back to the hero. */
export function closeReaderToHero() {
  window.dispatchEvent(new Event('reader:close'));
  const started = performance.now();
  const wait = () => {
    // the reader puts the page back where it was first, then we take it up
    if (!readerOpen() && document.documentElement.style.overflow !== 'hidden') {
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    } else if (performance.now() - started < 1500) {
      requestAnimationFrame(wait);
    }
  };
  requestAnimationFrame(wait);
}

export default function ReaderNav({ ink = '#F2EEE6', isDark = true }) {
  const [type, setType] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // follow body[data-reader]
  useEffect(() => {
    const sync = () => setType(document.body.dataset.reader || '');
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ['data-reader'] });
    return () => mo.disconnect();
  }, []);

  // show back-to-top once the article has been scrolled a bit
  useEffect(() => {
    setScrolled(false);
    if (!type) return;
    let el = null, raf = 0;
    const onScroll = () => setScrolled(el.scrollTop > 240);
    const find = () => {
      el = document.querySelector('.reader-scroll');
      if (!el) { raf = requestAnimationFrame(find); return; }
      el.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    };
    find();
    return () => { cancelAnimationFrame(raf); el?.removeEventListener('scroll', onScroll); };
  }, [type]);

  if (!type) return null;

  // research notes are always on a dark page, whatever the site theme
  const dark = type === 'research' ? true : isDark;
  const fg = type === 'research' ? '#F2EEE6' : ink;
  const glass = dark
    ? { background: 'rgba(120,120,120,0.22)', backdropFilter: 'blur(14px) saturate(1.4) brightness(1.15)', WebkitBackdropFilter: 'blur(14px) saturate(1.4) brightness(1.15)', border: '1px solid rgba(255,255,255,0.22)' }
    : { background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(14px) saturate(1.6)', WebkitBackdropFilter: 'blur(14px) saturate(1.6)', border: '1px solid rgba(20,16,10,0.10)' };
  const shadow = dark ? '0 8px 20px rgba(0,0,0,0.25)' : '0 8px 22px rgba(40,30,15,0.12)';

  const toTop = () => document.querySelector('.reader-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <button
        type="button"
        className="reader-back"
        data-cursor-hover="true"
        aria-label={type === 'research' ? 'Back to Quant Lab' : 'Back to the site'}
        onClick={() => window.dispatchEvent(new Event('reader:close'))}
        style={{
          position: 'fixed', top: 34, left: 'calc(var(--gutter, 0px) + 96px)', zIndex: 110, height: 36, padding: '0 16px 0 12px',
          borderRadius: 999, ...glass, boxShadow: shadow, color: fg, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: "'DM Mono', monospace", fontSize: '0.64rem', letterSpacing: '0.16em', textTransform: 'uppercase',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 3L5 8l5 5" />
        </svg>
        Back
      </button>

      <button
        type="button"
        className="reader-top"
        data-cursor-hover="true"
        aria-label="Back to top"
        onClick={toTop}
        style={{
          position: 'fixed', bottom: 28, right: 'calc(var(--gutter, 0px) + 28px)', zIndex: 110, width: 56, height: 56,
          borderRadius: '50%', ...glass, boxShadow: shadow, color: fg, cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: scrolled ? 1 : 0, transform: scrolled ? 'translateY(0)' : 'translateY(10px)',
          pointerEvents: scrolled ? 'auto' : 'none', transition: 'opacity .3s ease, transform .3s ease',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" />
        </svg>
      </button>
    </>
  );
}
