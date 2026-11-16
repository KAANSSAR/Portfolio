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

      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.8 * intensity})`;
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x * dpr, p.y * dpr, 1.6 * dpr, 0, Math.PI * 2);
        ctx.fill();
      });
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
  }, [gridPercentage, chaosStrength, particleColor, backgroundColor, connectionDistance, spacing, mouseInteraction, mouseRadius, mouseStrength, intensity]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

export default ChaosGrid;
