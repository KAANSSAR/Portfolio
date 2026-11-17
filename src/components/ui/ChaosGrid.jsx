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

    // Shooting stars: every 3.5-8.5s a random on-screen star lights up, then that
    // glowing star itself streaks off at a shallow diagonal until it leaves the screen,
    // and a star fades back in at the spot it left.
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const GLOW = 600, SETTLE = 900, SPEED = 0.85, TAIL = 140; // speed in px per ms
    let shot = null;
    let nextShot = performance.now() + 3000 + Math.random() * 4000;
    function spawnShot(now) {
      const visible = particles.filter(p => p.x > w * 0.08 && p.x < w * 0.92 && p.y > h * 0.06 && p.y < h * 0.6);
      if (!visible.length) return;
      const p = visible[Math.floor(Math.random() * visible.length)];
      const dir = Math.random() < 0.5 ? -1 : 1;
      const ang = (dir < 0 ? Math.PI - 0.45 : 0.45) + (Math.random() - 0.5) * 0.35;
      const dx = Math.cos(ang), dy = Math.sin(ang);
      // distance until the head is off-screen, plus the tail so it fully clears
      const tx = dx > 0 ? (w - p.x) / dx : -p.x / dx;
      const ty = dy > 0 ? (h - p.y) / dy : -p.y / dy;
      const dist = Math.min(tx, ty) + TAIL + 20;
      shot = { p, start: now, dx, dy, dist, fly: dist / SPEED + 200 };
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
          const col = a => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a * intensity})`;
          const glowDot = (x, y, g, a) => {
            const r = (1.6 + g * 1.6) * dpr;
            const halo = ctx.createRadialGradient(x * dpr, y * dpr, 0, x * dpr, y * dpr, r * 6);
            halo.addColorStop(0, col(0.5 * g * a));
            halo.addColorStop(1, col(0));
            ctx.fillStyle = halo;
            ctx.beginPath(); ctx.arc(x * dpr, y * dpr, r * 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = col((0.8 + 0.2 * g) * a);
            ctx.beginPath(); ctx.arc(x * dpr, y * dpr, r, 0, Math.PI * 2); ctx.fill();
          };
          const fe = e - GLOW;

          if (e < GLOW) {
            // 1. the star lights up where it is
            glowDot(p.x, p.y, easeOut(e / GLOW), 1);
          } else if (fe < shot.fly) {
            // 2. the lit-up star itself shoots off and keeps going until it leaves the screen
            const ramp = Math.min(1, fe / 250); // quick launch, then constant speed
            const head = fe * SPEED * (0.4 + 0.6 * ramp);
            const tail = Math.max(0, head - TAIL * Math.min(1, head / TAIL));
            const fade = 1;
            const hx = p.x + shot.dx * head, hy = p.y + shot.dy * head;
            const tx = p.x + shot.dx * tail, ty = p.y + shot.dy * tail;
            const g = ctx.createLinearGradient(tx * dpr, ty * dpr, hx * dpr, hy * dpr);
            g.addColorStop(0, col(0));
            g.addColorStop(1, col(0.85 * fade));
            ctx.strokeStyle = g; ctx.lineWidth = 1.8 * dpr; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(tx * dpr, ty * dpr); ctx.lineTo(hx * dpr, hy * dpr); ctx.stroke();
            glowDot(hx, hy, 0.85, fade);
          } else {
            // 3. a fresh star fades back in at the original spot
            const k = Math.min(1, (fe - shot.fly) / SETTLE);
            ctx.fillStyle = col(0.8 * k);
            ctx.beginPath(); ctx.arc(p.x * dpr, p.y * dpr, 1.6 * dpr, 0, Math.PI * 2); ctx.fill();
          }
          if (fe >= shot.fly + SETTLE) {
            shot = null;
            nextShot = now + 3500 + Math.random() * 5000;
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
