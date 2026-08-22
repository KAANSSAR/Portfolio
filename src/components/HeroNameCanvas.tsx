'use client';

import React, { useEffect, useRef } from 'react';
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
    octx.fillText(first, 4, 90);
    octx.fillText(rest.join(' '), 4, 190);

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
      ctx.fillStyle = isDarkRef.current ? '#FFFFFF' : '#0A0A0A';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += (p.tx - p.x) * 0.1;
        p.y += (p.ty - p.y) * 0.1;
        ctx.fillRect(p.x, p.y, 2, 2);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={SITE.name}
      style={{ width: '100%', maxWidth: 820, height: 'auto', display: 'block', marginLeft: -8 }}
    />
  );
}
