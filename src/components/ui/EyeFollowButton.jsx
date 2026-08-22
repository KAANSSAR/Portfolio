// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

function Eye({ pupil, blink }) {
  return (
    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.25)', transform: blink ? 'scaleY(0.12)' : 'scaleY(1)', transition: 'transform 0.09s ease' }}>
      <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#0A0A0A', transform: `translate(${pupil.x}px, ${pupil.y}px)`, opacity: blink ? 0 : 1 }} />
    </div>
  );
}

function EyeFollowButton({ children, onClick, color = '#FFFFFF', bg = '#0A0A0A', style = {} }) {
  const btnRef = useRef(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    function onMove(e) {
      const el = btnRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.min(1, Math.hypot(dx, dy) / 120);
      const angle = Math.atan2(dy, dx);
      setPupil({ x: Math.cos(angle) * dist * 6.5, y: Math.sin(angle) * dist * 6.5 });
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    let timer;
    function scheduleBlink() {
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        scheduleBlink();
      }, 2500 + Math.random() * 3500);
    }
    scheduleBlink();
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase',
        padding: '10px 10px 10px 30px', borderRadius: 999, border: 'none', cursor: 'none', color, background: bg,
        boxShadow: pressed ? '0 2px 6px rgba(0,0,0,0.25)' : '0 6px 16px rgba(0,0,0,0.25)',
        transform: pressed ? 'scale(0.94)' : 'scale(1)',
        transition: 'transform .12s ease, box-shadow .12s ease',
        ...style,
      }}
    >
      {children}
      <div style={{ display: 'flex', gap: 5 }}>
        <Eye pupil={pupil} blink={blink} />
        <Eye pupil={pupil} blink={blink} />
      </div>
    </button>
  );
}

export default EyeFollowButton;
