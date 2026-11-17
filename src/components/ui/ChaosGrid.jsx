// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function ChaosGrid({
  gridPercentage = 55,
  chaosStrength = 1,
  particleColor = '#0A0A0A',
  backgroundColor = 'transparent',
  connectionDistance = 90,
  spacing = 46,
  mouseInteraction = true,
  mouseRadius = 140,
  mouseStrength = 1,
  intensity = 1,
  showLines = true,
  shootingStars = false,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf, w = 0, h = 0, particles = [];
    const mouse = { x: -9999, y: -9999, active: false };
    const order = Math.max(0, Math.min(1, gridPercentage / 100));
    const rgb = hexToRgb(particleColor);

    function build() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      const cols = Math.ceil(w / spacing) + 2;
      const rows = Math.ceil(h / spacing) + 2;
      particles = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const gx = i * spacing, gy = j * spacing;
          particles.push({
            gx, gy, x: gx, y: gy,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.6,
            wanderR: (20 + Math.random() * 40) * (1 - order),
            angle: Math.random() * Math.PI * 2,
          });
        }
      }
    }
    build();

    function resize() { build(); }
    window.addEventListener('resize', resize);

    const onMove = e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };
    if (mouseInteraction) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseleave', onLeave);
    }

    // Shooting stars: every 5-12s a random on-screen star swells and glows,
    // fires a streak off at a shallow diagonal, then settles back to normal.
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const GLOW = 650, FLY = 900, SETTLE = 700;
    let shot = null;
    let nextShot = performance.now() + 3000 + Math.random() * 4000;
    function spawnShot(now) {
      const visible = particles.filter(p => p.x > w * 0.08 && p.x < w * 0.92 && p.y > h * 0.06 && p.y < h * 0.6);
      if (!visible.length) return;
      const p = visible[Math.floor(Math.random() * visible.length)];
      const dir = Math.random() < 0.5 ? -1 : 1;
      const ang = (dir < 0 ? Math.PI - 0.45 : 0.45) + (Math.random() - 0.5) * 0.35;
      shot = { p, start: now, dx: Math.cos(ang), dy: Math.sin(ang), dist: 260 + Math.random() * 220 };
    }
    const easeOut = k => 1 - Math.pow(1 - k, 3);

    let t = 0;
    function draw() {
      raf = requestAnimationFrame(draw);
      t += 0.012 * chaosStrength;
      if (backgroundColor !== 'transparent') { ctx.fillStyle = backgroundColor; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      else ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        const flowX = Math.sin(t * p.speed + p.phase) * p.wanderR;
        const flowY = Math.cos(t * p.speed * 0.8 + p.phase * 1.3) * p.wanderR;
        let x = p.gx + flowX, y = p.gy + flowY;
        if (mouse.active && mouseInteraction) {
          const dx = x - mouse.x, dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius && dist > 0.001) {
            const push = (1 - dist / mouseRadius) * 22 * mouseStrength;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
          }
        }
        p.x = x; p.y = y;
      });

      if (showLines) {
      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.2)`;
      ctx.lineWidth = 1 * dpr;
      const cd2 = connectionDistance * connectionDistance;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < cd2) {
            const alpha = (1 - d2 / cd2) * 0.28 * intensity;
            ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x * dpr, a.y * dpr);
            ctx.lineTo(b.x * dpr, b.y * dpr);
            ctx.stroke();
          }
        }
      }
      }

      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.8 * intensity})`;
      particles.forEach(p => {
        if (shot && p === shot.p) return;
        ctx.beginPath();
        ctx.arc(p.x * dpr, p.y * dpr, 1.6 * dpr, 0, Math.PI * 2);
        ctx.fill();
      });

      if (shootingStars && !reduceMotion) {
        const now = performance.now();
        if (!shot && now > nextShot && !document.hidden) spawnShot(now);
        if (shot) {
          const e = now - shot.start;
          const { p } = shot;
          // the star itself: swell up, hold while it fires, then ease back down
          let glow;
          if (e < GLOW) glow = easeOut(e / GLOW);
          else if (e < GLOW + FLY * 0.4) glow = 1;
          else glow = Math.max(0, 1 - (e - GLOW - FLY * 0.4) / SETTLE);
          const r = (1.6 + glow * 1.8) * dpr;
          if (glow > 0) {
            const halo = ctx.createRadialGradient(p.x * dpr, p.y * dpr, 0, p.x * dpr, p.y * dpr, r * 6);
            halo.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.45 * glow * intensity})`);
            halo.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
            ctx.fillStyle = halo;
            ctx.beginPath(); ctx.arc(p.x * dpr, p.y * dpr, r * 6, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(0.8 + 0.2 * glow) * intensity})`;
          ctx.beginPath(); ctx.arc(p.x * dpr, p.y * dpr, r, 0, Math.PI * 2); ctx.fill();

          // the streak, launched from the star once it has lit up
          const fe = e - GLOW;
          if (fe > 0 && fe < FLY) {
            const k = fe / FLY;
            const head = easeOut(k) * shot.dist;
            const tail = Math.max(0, head - 130 * Math.sin(Math.PI * Math.min(1, k * 1.2)) - 4);
            const fade = 1 - Math.pow(k, 2);
            const hx = p.x + shot.dx * head, hy = p.y + shot.dy * head;
            const tx = p.x + shot.dx * tail, ty = p.y + shot.dy * tail;
            const g = ctx.createLinearGradient(tx * dpr, ty * dpr, hx * dpr, hy * dpr);
            g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
            g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.9 * fade * intensity})`);
            ctx.strokeStyle = g; ctx.lineWidth = 1.6 * dpr; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(tx * dpr, ty * dpr); ctx.lineTo(hx * dpr, hy * dpr); ctx.stroke();
            ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${fade * intensity})`;
            ctx.beginPath(); ctx.arc(hx * dpr, hy * dpr, 1.5 * dpr, 0, Math.PI * 2); ctx.fill();
          }
          if (e > GLOW + FLY * 0.4 + SETTLE && fe >= FLY) {
            shot = null;
            nextShot = now + 5000 + Math.random() * 7000;
          }
        }
      }
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (mouseInteraction) {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseleave', onLeave);
      }
    };
  }, [gridPercentage, chaosStrength, particleColor, backgroundColor, connectionDistance, spacing, mouseInteraction, mouseRadius, mouseStrength, intensity, showLines, shootingStars]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

export default ChaosGrid;
