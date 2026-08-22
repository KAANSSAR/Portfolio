'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

const TRAIL_COUNT = 14;

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();
  const isDarkRef = useRef(isDark);
  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (fine) document.documentElement.classList.add('has-fine-pointer');
    if (!fine) return;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let scale = 1;
    const trail = Array.from({ length: TRAIL_COUNT }, () => ({ x: mouse.x, y: mouse.y }));
    let raf = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const hoverEl = (e.target as HTMLElement)?.closest?.('[data-cursor-hover]');
      scale = hoverEl ? 1.9 : 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const tick = () => {
      trail[0].x += (mouse.x - trail[0].x) * 0.55;
      trail[0].y += (mouse.y - trail[0].y) * 0.55;
      for (let i = 1; i < TRAIL_COUNT; i++) {
        trail[i].x += (trail[i - 1].x - trail[i].x) * 0.45;
        trail[i].y += (trail[i - 1].y - trail[i].y) * 0.45;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
          canvas.width = w * dpr;
          canvas.height = h * dpr;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, w, h);
          for (let i = 0; i < TRAIL_COUNT - 1; i++) {
            const p0 = trail[i];
            const p1 = trail[i + 1];
            const t = i / TRAIL_COUNT;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.strokeStyle = isDarkRef.current ? `rgba(255,255,255,${(1 - t) * 0.7})` : `rgba(10,10,10,${(1 - t) * 0.7})`;
            ctx.lineWidth = Math.max(0.5, (1 - t) * 5 * scale);
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'round';
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(trail[0].x, trail[0].y, 4.5 * scale, 0, Math.PI * 2);
          ctx.fillStyle = isDarkRef.current ? '#FFFFFF' : '#0A0A0A';
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
