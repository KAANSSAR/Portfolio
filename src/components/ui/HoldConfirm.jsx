// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

function HoldConfirm({ href, download, children = 'Download résumé', onConfirm, borderColor = '#C4962A', bg = '#0A0A0A', textColor = '#FFFFFF', duration = 900 }) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const anchorRef = useRef(null);

  function tick() {
    const elapsed = performance.now() - startRef.current;
    const p = Math.min(1, elapsed / duration);
    setProgress(p);
    if (p >= 1) {
      setHolding(false);
      setDone(true);
      if (onConfirm) onConfirm();
      if (anchorRef.current) anchorRef.current.click();
      setTimeout(() => { setDone(false); setProgress(0); }, 900);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function start() {
    if (done) return;
    setHolding(true);
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }
  function cancel() {
    if (done) return;
    setHolding(false);
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <a ref={anchorRef} href={href} download={download} style={{ display: 'none' }} />
      <button
        onMouseDown={start}
        onMouseUp={cancel}
        onMouseLeave={cancel}
        onTouchStart={start}
        onTouchEnd={cancel}
        style={{
          position: 'relative', overflow: 'hidden', userSelect: 'none',
          fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase',
          padding: '16px 32px', borderRadius: 999, border: 'none', background: bg, color: textColor,
          cursor: 'none', width: 240,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', opacity: 0.9, width: `${progress * 100}%`, transition: holding ? 'none' : 'width 0.25s ease' }} />
        <span style={{ position: 'relative', zIndex: 1, mixBlendMode: progress > 0.5 ? 'difference' : 'normal' }}>{done ? 'Confirmed ✓' : children}</span>
      </button>
    </div>
  );
}

export default HoldConfirm;
