'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function Logo({ onClick }: { onClick?: () => void }) {
  const spinRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef(0);
  const degRef = useRef(0);
  const lastRef = useRef<number | null>(null);
  const { T } = useTheme();

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      if (lastRef.current == null) lastRef.current = t;
      const dt = t - lastRef.current;
      lastRef.current = t;
      speedRef.current += (0 - speedRef.current) * 0.02;
      degRef.current += speedRef.current * dt * 0.06;
      if (spinRef.current) spinRef.current.style.transform = `rotateY(${degRef.current}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClick = () => {
    speedRef.current = 9;
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      data-cursor-hover="true"
      style={{
        position: 'fixed', top: 26, left: 30, zIndex: 210, width: 52, height: 52,
        perspective: 400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div ref={spinRef} style={{ width: 44, height: 44, position: 'relative', transformStyle: 'preserve-3d' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(1px)', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.3rem', color: T.ink }}>KS</div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.3rem', color: T.ink }}>KS</div>
      </div>
    </div>
  );
}
