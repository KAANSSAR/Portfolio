'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { SITE } from '@/lib/data';

const W = 820;
const H = 240;

export default function HeroNameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();
  const isDarkRef = useRef(isDark);
  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  // Re-runs the particle build only when the breakpoint is crossed, so an
  // orientation change re-centres the name without rebuilding on every resize.
  const [centred, setCentred] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)');
    const sync = () => setCentred(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;

    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const octx = off.getContext('2d');
    if (!octx) return;
    octx.fillStyle = '#000';
    octx.font = '900 92px "Playfair Display", serif';
    octx.textBaseline = 'alphabetic';
    const [first, ...rest] = SITE.name.split(' ');
    const second = rest.join(' ');
    // On desktop the name is left-aligned within the canvas; on narrow screens
    // the hero is centred, and since the glyphs occupy less than the canvas
    // width, drawing them at a fixed x made the name look off to the left.
    const xFor = (line: string) => (centred ? Math.max(4, (W - octx.measureText(line).width) / 2) : 4);
    octx.fillText(first, xFor(first), 90);
    octx.fillText(second, xFor(second), 190);

    let data: Uint8ClampedArray;
    try {
      data = octx.getImageData(0, 0, W, H).data;
    } catch {
      return;
    }
    const targets: { x: number; y: number }[] = [];
    for (let y = 0; y < H; y += 3) {
      for (let x = 0; x < W; x += 3) {
        if (data[(y * W + x) * 4 + 3] > 120) targets.push({ x, y });
      }
    }
    const particles = targets.map((t) => ({ x: Math.random() * W, y: Math.random() * H, tx: t.x, ty: t.y }));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const dark = isDarkRef.current;
      ctx.fillStyle = dark ? '#FFFFFF' : '#121110';
      // Light dots on black read brighter than dark dots on paper, so the
      // light theme uses slightly bigger dots to keep the same weight.
      const sz = dark ? 2 : 2.6;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += (p.tx - p.x) * 0.1;
        p.y += (p.ty - p.y) * 0.1;
        ctx.fillRect(p.x, p.y, sz, sz);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [centred]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={SITE.name}
      style={{ width: '100%', maxWidth: 820, height: 'auto', display: 'block', marginLeft: -8 }}
    />
  );
}
