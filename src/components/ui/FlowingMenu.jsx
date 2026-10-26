// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';

let __fmGsapPromise = null;
function getGsap() {
  if (!__fmGsapPromise) __fmGsapPromise = Promise.resolve(gsap);
  return __fmGsapPromise;
}

const CSS = `
.fm-menu-wrap { width: 100%; height: 100%; overflow: hidden; }
.fm-menu { display: flex; flex-direction: column; height: 100%; margin: 0; padding: 0; list-style: none; }
.fm-menu__item { flex: 1; position: relative; overflow: hidden; text-align: center; border-top: 0.5px solid; }
.fm-menu__item:first-child { border-top: none; }
.fm-menu__item-link { display: flex; align-items: center; justify-content: space-between; height: 100%; position: relative; cursor: none; text-decoration: none; padding: 0 3rem; }
.fm-marquee { position: absolute; top: 0; left: 0; overflow: hidden; width: 100%; height: 100%; pointer-events: none; transform: translate3d(0, 101%, 0); }
.fm-marquee__inner-wrap { height: 100%; width: 100%; overflow: hidden; }
.fm-marquee__inner { display: flex; align-items: center; position: relative; height: 100%; width: fit-content; will-change: transform; }
.fm-marquee__part { display: flex; align-items: center; flex-shrink: 0; }
.fm-marquee span { white-space: nowrap; padding: 0 1vw; }
.fm-visit { position: absolute; right: 8px; bottom: 8px; z-index: 6; pointer-events: auto;
  display: inline-flex; align-items: center; gap: 4px; padding: 5px 9px; border-radius: 999px;
  border: 1px solid currentColor; background: rgba(0,0,0,0.38); backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px); font-family: 'DM Mono', monospace; font-size: 0.48rem;
  letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; font-weight: 500;
  line-height: 1; white-space: nowrap; }
.fm-visit:active { transform: scale(0.96); }
.fm-marquee__img { width: 160px; height: 90px; margin: 0 2vw; border-radius: 4px; background-size: cover; background-position: 50% 50%; flex-shrink: 0; }
@keyframes currencyFall { from { top: -15%; } to { top: 115%; } }
`;

function injectCSS() {
  if (document.getElementById('fm-styles')) return;
  const s = document.createElement('style');
  s.id = 'fm-styles';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const MONEY_SYMBOLS = ['$', '€', '£', '₹', '¥', '₩', '₽', '₺', '₴', '₦'];
const GLITCH_PALETTE = ['#00F0FF', '#FF00C8', '#39FF14', '#FFEE00', '#FF2E2E', '#FFFFFF', '#0044FF'];

function GlitchNoiseOverlay() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, timer, destroyed = false;

    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function rand(a, b) { return a + Math.random() * (b - a); }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function drawFrame() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const bands = Math.floor(rand(6, 14));
      for (let i = 0; i < bands; i++) {
        const y = rand(0, h);
        const bandH = rand(2, 16);
        ctx.globalAlpha = rand(0.6, 1);
        ctx.fillStyle = pick(GLITCH_PALETTE);
        ctx.fillRect(0, y, w, bandH);
        if (Math.random() < 0.6) {
          ctx.fillStyle = pick(GLITCH_PALETTE);
          ctx.fillRect(rand(0, w * 0.6), y, rand(w * 0.2, w * 0.5), bandH);
        }
      }
      const streaks = Math.floor(rand(10, 26));
      for (let i = 0; i < streaks; i++) {
        ctx.globalAlpha = rand(0.35, 0.9);
        ctx.fillStyle = pick(GLITCH_PALETTE);
        ctx.fillRect(rand(0, w), 0, rand(1, 4), h);
      }
      const blocks = Math.floor(rand(2, 7));
      for (let i = 0; i < blocks; i++) {
        ctx.globalAlpha = rand(0.5, 1);
        ctx.fillStyle = Math.random() < 0.5 ? '#FFFFFF' : pick(GLITCH_PALETTE);
        ctx.fillRect(rand(0, w), rand(0, h), rand(10, 70), rand(8, 40));
      }
      ctx.globalAlpha = 1;
    }

    function burst() {
      let frame = 0;
      const frames = Math.floor(rand(3, 6));
      function step() {
        if (destroyed) return;
        drawFrame();
        frame++;
        if (frame < frames) { raf = setTimeout(step, rand(50, 90)); }
        else { ctx.clearRect(0, 0, canvas.width, canvas.height); scheduleBurst(); }
      }
      step();
    }
    function scheduleBurst() {
      timer = setTimeout(burst, rand(900, 2400));
    }
    scheduleBurst();

    return () => { destroyed = true; clearTimeout(timer); clearTimeout(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', mixBlendMode: 'screen', zIndex: 1 }} />;
}

const MATRIX_CHARS = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ$%#@&'.split('');

function MatrixRainOverlay() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, destroyed = false;
    const fontSize = 16;
    let columns, drops;

    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      columns = Math.ceil(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -canvas.height / fontSize);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      if (destroyed) return;
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px 'DM Mono', monospace`;
      for (let i = 0; i < columns; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const y = drops[i] * fontSize;
        ctx.fillStyle = Math.random() < 0.05 ? '#CFFFDB' : '#22C55E';
        ctx.fillText(char, i * fontSize, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => { destroyed = true; cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />;
}

const SAFE_CURRENCY_SYMBOLS = ['$', '€', '£', '¥', '₹', '¢'];

function CurrencyRainOverlay() {
  const itemsRef = useRef(null);
  if (!itemsRef.current) {
    itemsRef.current = Array.from({ length: 30 }, (_, i) => ({
      id: i, left: (i / 30) * 100 + (Math.random() * 2 - 1), delay: Math.random() * 4, duration: 2.5 + Math.random() * 2,
      size: 22 + Math.random() * 20, char: SAFE_CURRENCY_SYMBOLS[Math.floor(Math.random() * SAFE_CURRENCY_SYMBOLS.length)],
      bright: Math.random() < 0.3,
    }));
  }
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {itemsRef.current.map(it => (
        <span key={it.id} style={{
          position: 'absolute', left: `${it.left}%`, top: '-15%',
          fontFamily: 'Arial, Helvetica, sans-serif', fontWeight: 700, fontSize: `${it.size}px`,
          color: it.bright ? '#FFFFFF' : '#8A8A8A', opacity: it.bright ? 1 : 0.65,
          animation: `currencyFall ${it.duration}s linear ${it.delay}s infinite`,
        }}>{it.char}</span>
      ))}
    </div>
  );
}

function CornerBox({ width, height }) {
  const corner = { width: 22, height: 22, position: 'absolute' };
  const glow = { filter: 'drop-shadow(0 0 4px #22C55E)' };
  return (
    <div style={{ position: 'absolute', inset: 0, width, height }}>
      <div style={{ ...corner, ...glow, top: 0, left: 0, borderTop: '3px solid #22C55E', borderLeft: '3px solid #22C55E' }} />
      <div style={{ ...corner, ...glow, top: 0, right: 0, borderTop: '3px solid #22C55E', borderRight: '3px solid #22C55E' }} />
      <div style={{ ...corner, ...glow, bottom: 0, left: 0, borderBottom: '3px solid #22C55E', borderLeft: '3px solid #22C55E' }} />
      <div style={{ ...corner, ...glow, bottom: 0, right: 0, borderBottom: '3px solid #22C55E', borderRight: '3px solid #22C55E' }} />
    </div>
  );
}

function StarfieldOverlay() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, stars = [], shootingStars = [], nextShootAt = 0, destroyed = false, w = 0, h = 0;
    const palette = ['#FFFFFF', '#FFFFFF', '#FFF3D6', '#FFEFC2', '#D8E8FF'];
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w; canvas.height = h;
      const count = Math.floor((w * h) / 2400);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() < 0.12 ? (1.6 + Math.random() * 1.4) : (Math.random() * 0.7 + 0.75),
        color: palette[Math.floor(Math.random() * palette.length)],
        phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.015 + 0.005,
        flareAt: 150 + Math.random() * 500, flareCooldown: 200 + Math.random() * 600, flareT: 0,
      }));
      nextShootAt = 80 + Math.random() * 220;
    }
    resize();
    window.addEventListener('resize', resize);
    let t = 0;
    function spawnShootingStar() {
      const fromLeft = Math.random() < 0.5;
      const y0 = Math.random() * h * 0.55;
      const angle = (fromLeft ? 1 : -1) * (0.28 + Math.random() * 0.18);
      const spd = 7 + Math.random() * 5;
      shootingStars.push({
        x: fromLeft ? -30 : w + 30, y: y0,
        vx: (fromLeft ? 1 : -1) * spd, vy: spd * angle,
        life: 0, maxLife: 34 + Math.random() * 14,
        color: Math.random() < 0.5 ? '180,225,255' : '255,255,255',
      });
    }
    function drawSparkle(cx, cy, r, color, alpha) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = r * 1.4;
      function spike(len, width) {
        ctx.beginPath();
        ctx.moveTo(0, -len);
        ctx.quadraticCurveTo(width, 0, 0, len);
        ctx.quadraticCurveTo(-width, 0, 0, -len);
        ctx.fill();
      }
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); spike(r * 3.1, r * 0.55); }
      ctx.rotate(Math.PI / 4);
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); spike(r * 1.5, r * 0.32); }
      ctx.restore();
    }
    function tick() {
      if (destroyed) return;
      t += 1;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(s.phase + t * s.speed));
        let o = twinkle, r = s.r, glow = 0;
        s.flareAt -= 1;
        if (s.flareAt <= 0) {
          s.flareT += 1;
          const p = Math.min(1, s.flareT / 16);
          const wave = Math.sin(p * Math.PI);
          o = twinkle + wave * (1 - twinkle);
          r = s.r + wave * s.r * 2.2;
          glow = wave;
          if (s.flareT > 28) { s.flareAt = s.flareCooldown; s.flareCooldown = 300 + Math.random() * 800; s.flareT = 0; }
        }
        if (glow > 0.15) {
          const haloR = r * 5;
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, haloR);
          grad.addColorStop(0, `rgba(255,255,255,${0.5 * glow})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(s.x, s.y, haloR, 0, Math.PI * 2); ctx.fill();
          drawSparkle(s.x, s.y, s.r * 1.6, '#ffffff', glow);
          ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        }
        ctx.beginPath();
        ctx.fillStyle = s.color;
        ctx.globalAlpha = o;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = r * 2.2;
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      nextShootAt -= 1;
      if (nextShootAt <= 0) { spawnShootingStar(); nextShootAt = 280 + Math.random() * 500; }
      shootingStars = shootingStars.filter(ss => ss.life < ss.maxLife);
      for (const ss of shootingStars) {
        ss.life += 1; ss.x += ss.vx; ss.y += ss.vy;
        const fade = 1 - ss.life / ss.maxLife;
        const tailLen = 13;
        const tx = ss.x - ss.vx * tailLen, ty = ss.y - ss.vy * tailLen;
        const grad = ctx.createLinearGradient(ss.x, ss.y, tx, ty);
        grad.addColorStop(0, `rgba(${ss.color},${0.95 * fade})`);
        grad.addColorStop(0.4, `rgba(${ss.color},${0.35 * fade})`);
        grad.addColorStop(1, `rgba(${ss.color},0)`);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ss.x, ss.y); ctx.lineTo(tx, ty); ctx.stroke();
        const headGrad = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 6);
        headGrad.addColorStop(0, `rgba(${ss.color},${fade})`);
        headGrad.addColorStop(1, `rgba(${ss.color},0)`);
        ctx.fillStyle = headGrad;
        ctx.beginPath(); ctx.arc(ss.x, ss.y, 6, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => { destroyed = true; cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />;
}

function ScannerOverlay({ containerRef }) {
  const [box, setBox] = useState({ x: 0, y: 0, w: 150, h: 44, phase: 'idle' });
  const [visible, setVisible] = useState(false);
  const [scanY, setScanY] = useState(0);
  const rafRef = useRef(null);
  const targetElRef = useRef(null);
  const recentlyScannedRef = useRef([]);

  function getTargets() {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll('.fm-scan-target'));
  }
  function rectRelative(el) {
    const parentRect = containerRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - parentRect.left, y: r.top - parentRect.top, w: r.width, h: r.height };
  }
  function pickVisibleTarget() {
    if (!containerRef.current) return null;
    const parentRect = containerRef.current.getBoundingClientRect();
    const visibleTargets = getTargets().filter(el => {
      if (recentlyScannedRef.current.includes(el)) return false;
      const r = el.getBoundingClientRect();
      return r.right > parentRect.left + 10 && r.left < parentRect.right - 10;
    });
    if (!visibleTargets.length) return null;
    return visibleTargets[Math.floor(Math.random() * visibleTargets.length)];
  }

  useEffect(() => {
    let cancelled = false;
    const timers = [];

    function idlePause() {
      setVisible(false);
      timers.push(setTimeout(startSearch, 400 + Math.random() * 400));
    }
    function startSearch() {
      if (cancelled || !containerRef.current) return;
      setVisible(true);
      let jumps = 0;
      const maxJumps = 3 + Math.floor(Math.random() * 3);
      function jump() {
        if (cancelled || !containerRef.current) return;
        const parentRect = containerRef.current.getBoundingClientRect();
        setBox({ x: Math.random() * Math.max(1, parentRect.width - 170), y: Math.random() * Math.max(1, parentRect.height - 50), w: 150, h: 44, phase: 'searching' });
        jumps++;
        if (jumps < maxJumps) timers.push(setTimeout(jump, 240 + Math.random() * 220));
        else lockOn();
      }
      timers.push(setTimeout(jump, 150));
    }
    function lockOn() {
      if (cancelled) return;
      const target = pickVisibleTarget();
      if (!target) { timers.push(setTimeout(startSearch, 150)); return; }
      targetElRef.current = target;
      recentlyScannedRef.current = [target, ...recentlyScannedRef.current].slice(0, 2);
      const rect = rectRelative(target);
      setBox({ x: rect.x - 10, y: rect.y - 8, w: rect.w + 20, h: rect.h + 16, phase: 'locked' });
      const scanDuration = 2000 + Math.random() * 1200;
      const startTime = performance.now();
      function sweep(t) {
        if (cancelled) return;
        if (targetElRef.current && containerRef.current) {
          const r = rectRelative(targetElRef.current);
          setBox(b => ({ ...b, x: r.x - 10, y: r.y - 8, w: r.w + 20, h: r.h + 16 }));
        }
        const elapsed = t - startTime;
        const p = (elapsed % 1300) / 1300;
        setScanY(p < 0.5 ? p * 2 : 2 - p * 2);
        if (elapsed < scanDuration) rafRef.current = requestAnimationFrame(sweep);
        else timers.push(setTimeout(idlePause, 150));
      }
      rafRef.current = requestAnimationFrame(sweep);
    }
    timers.push(setTimeout(startSearch, 200 + Math.random() * 400));
    return () => { cancelled = true; timers.forEach(clearTimeout); cancelAnimationFrame(rafRef.current); };
  }, []);

  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h,
      transition: box.phase === 'searching' ? 'left .22s ease, top .22s ease' : 'none',
      pointerEvents: 'none', zIndex: 3,
    }}>
      <CornerBox width={box.w} height={box.h} />
      {box.phase === 'locked' && (
        <div style={{ position: 'absolute', left: 6, right: 6, top: `${scanY * 100}%`, height: 2, background: '#EF4444', boxShadow: '0 0 8px 2px rgba(239,68,68,0.9)' }} />
      )}
    </div>
  );
}

function MarqueeGlitchWord({ text, color, wordmark }) {
  const letters = React.useMemo(() => text.split(''), [text]);
  const [chars, setChars] = useState(() => letters.slice());
  useEffect(() => {
    const timers = [];
    function schedule(idx) {
      const delay = 900 + Math.random() * 2600;
      timers.push(setTimeout(() => glitchOne(idx), delay));
    }
    function glitchOne(idx) {
      if (letters[idx] === ' ') { schedule(idx); return; }
      setChars(prev => { const next = prev.slice(); next[idx] = MONEY_SYMBOLS[Math.floor(Math.random() * MONEY_SYMBOLS.length)]; return next; });
      timers.push(setTimeout(() => {
        setChars(prev => { const next = prev.slice(); next[idx] = letters[idx]; return next; });
        schedule(idx);
      }, 220 + Math.random() * 260));
    }
    letters.forEach((_, idx) => schedule(idx));
    return () => timers.forEach(clearTimeout);
  }, [letters]);
  return (
    <span style={wordmark
      ? { fontFamily: "'Arial Narrow', Arial, sans-serif", fontWeight: 900, fontStyle: 'italic', fontSize: '2.2rem', letterSpacing: '0.02em', textTransform: 'uppercase', color }
      : { fontFamily: 'DM Mono, monospace', fontSize: '1.4rem', textTransform: 'uppercase', color }
    }>
      {chars.map((c, i) => <span key={i} style={{ display: 'inline-block' }}>{c === ' ' ? '\u00A0' : c}</span>)}
    </span>
  );
}

function KeyedVideo({ src, height, margin }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current, canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let raf, destroyed = false;
    function draw() {
      if (destroyed) return;
      if (video.videoWidth && video.videoHeight) {
        if (canvas.width !== video.videoWidth) { canvas.width = video.videoWidth; canvas.height = video.videoHeight; }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = frame.data;
        for (let i = 0; i < d.length; i += 4) {
          const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
          if (lum < 22) d[i + 3] = 0; else if (lum < 60) d[i + 3] = Math.round((lum - 22) / 38 * 255);
        }
        ctx.putImageData(frame, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { destroyed = true; cancelAnimationFrame(raf); };
  }, []);
  return (
    <span style={{ display: 'inline-block', height, margin, position: 'relative' }}>
      <video ref={videoRef} src={src} autoPlay loop muted playsInline preload="auto" style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ height: '100%', width: 'auto', display: 'block', objectFit: 'contain' }} />
    </span>
  );
}

const GLITCH_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FF8C42', '#5FD068', '#FF5DA2'];
function skillColor(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return GLITCH_COLORS[h % GLITCH_COLORS.length];
}

function MenuItem({ link, text, image, num, tech, speed, textColor, techColor, marqueeBgColor, marqueeTextColor, borderColor, fontFamily, glitchMoney, matrixRain, tcsLogo, scanEffect, logoOnly, videoLoop, starfield, currencyRain, panelBg, panelTextColor, isOpen = false, onToggle }) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const gsapRef = useRef(null);
  const [gsapReady, setGsapReady] = useState(false);
  const [repetitions, setRepetitions] = useState(4);
  const [imgTick, setImgTick] = useState(0);
  // On touch devices there is no hover, so the panel is opened by tapping the
  // row instead and a button inside it handles the link.
  const [isTouch, setIsTouch] = useState(false);
  const animationDefaults = { duration: 0.6, ease: 'expo' };

  useEffect(() => { getGsap().then(g => { gsapRef.current = g; setGsapReady(true); }); }, []);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    const sync = () => setIsTouch(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const distMetric = (x, y, x2, y2) => (x - x2) * (x - x2) + (y - y2) * (y - y2);
  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  useEffect(() => {
    const setup = () => {
      if (!marqueeInnerRef.current) return;
      const part = marqueeInnerRef.current.querySelector('.fm-marquee__part');
      if (!part) return;
      const contentWidth = part.offsetWidth;
      if (contentWidth === 0) return;
      const needed = Math.ceil(window.innerWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };
    setup();
    window.addEventListener('resize', setup);
    return () => window.removeEventListener('resize', setup);
  }, [text, image, imgTick]);

  useEffect(() => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    const timer = setTimeout(() => {
      if (!marqueeInnerRef.current) return;
      const part = marqueeInnerRef.current.querySelector('.fm-marquee__part');
      if (!part) return;
      const contentWidth = part.offsetWidth;
      if (contentWidth === 0) return;
      if (animationRef.current) animationRef.current.kill();
      animationRef.current = gsap.to(marqueeInnerRef.current, { x: -contentWidth, duration: speed, ease: 'none', repeat: -1 });
    }, 50);
    return () => { clearTimeout(timer); if (animationRef.current) animationRef.current.kill(); };
  }, [text, image, repetitions, speed, gsapReady, imgTick]);

  const handleMouseEnter = ev => {
    const gsap = gsapRef.current;
    if (!gsap || !itemRef.current || !marqueeRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0);
    if (marqueeInnerRef.current) tl.set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
    tl.to(marqueeRef.current, { y: '0%' }, 0);
    if (marqueeInnerRef.current) tl.to(marqueeInnerRef.current, { y: '0%' }, 0);
  };
  const handleMouseLeave = ev => {
    const gsap = gsapRef.current;
    if (!gsap || !itemRef.current || !marqueeRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    const tl = gsap.timeline({ defaults: animationDefaults });
    tl.to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0);
    if (marqueeInnerRef.current) tl.to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  // Touch equivalents: always slide in from the bottom so the motion is
  // predictable without a pointer position to read.
  const slidePanel = (show) => {
    const gsap = gsapRef.current;
    if (!gsap || !marqueeRef.current) return;
    const tl = gsap.timeline({ defaults: animationDefaults });
    if (show) {
      tl.set(marqueeRef.current, { y: '101%' }, 0);
      if (marqueeInnerRef.current) tl.set(marqueeInnerRef.current, { y: '-101%' }, 0);
      tl.to(marqueeRef.current, { y: '0%' }, 0);
      if (marqueeInnerRef.current) tl.to(marqueeInnerRef.current, { y: '0%' }, 0);
    } else {
      tl.to(marqueeRef.current, { y: '101%' }, 0);
      if (marqueeInnerRef.current) tl.to(marqueeInnerRef.current, { y: '-101%' }, 0);
    }
  };

  const handleTap = (ev) => {
    if (!isTouch) return;
    // Let the in-panel button do its own thing.
    if (ev.target.closest && ev.target.closest('.fm-visit')) return;
    ev.preventDefault();
    if (onToggle) onToggle();
  };

  // Drive the panel from the parent's open state so that opening one row
  // closes whichever was open before. Skips the initial mount so nothing
  // animates on first paint.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!isTouch) return;
    if (!didMountRef.current) { didMountRef.current = true; return; }
    slidePanel(isOpen);
  }, [isOpen, isTouch]);

  return (
    <li className="fm-menu__item" ref={itemRef} style={{ borderColor }}>
      <a className="fm-menu__item-link" href={isTouch ? undefined : (link || undefined)}
         target={!isTouch && link ? '_blank' : undefined} rel="noopener noreferrer"
         role={isTouch ? 'button' : undefined}
         aria-expanded={isTouch ? isOpen : undefined}
         onClick={handleTap}
         onMouseEnter={isTouch ? undefined : handleMouseEnter}
         onMouseLeave={isTouch ? undefined : handleMouseLeave}
         data-cursor-hover="true">
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 24, minWidth: 0 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: skillColor(num), opacity: 0.85 }}>{num}</span>
          <span style={{ fontFamily, fontWeight: 700, fontSize: 'clamp(1.3rem,2.6vw,2rem)', color: textColor }}>{text}</span>
        </span>
        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 260 }}>
          {(tech || []).slice(0, 3).map((t, i) => (
            <span key={i} style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.56rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px', border: `0.5px solid ${skillColor(t)}`, borderRadius: 2, color: skillColor(t) }}>{t}</span>
          ))}
        </span>
      </a>
      <div className="fm-marquee" ref={marqueeRef} style={{ backgroundColor: panelBg || marqueeBgColor }}>
        <div className="fm-marquee__inner-wrap" style={{ position: 'relative', zIndex: 2 }}>
          <div className="fm-marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
            {[...Array(repetitions)].map((_, idx) => (
              <div className="fm-marquee__part" key={idx} style={{ color: panelTextColor || marqueeTextColor }}>
                {videoLoop ? (
                  <>
                    <video src={videoLoop} autoPlay loop muted playsInline preload="auto" onLoadedMetadata={() => setImgTick(t => t + 1)} style={{ height: '11rem', width: 'auto', objectFit: 'contain', marginRight: '0.2vw' }} />
                    <KeyedVideo src="/video/cardinal-loading-icon.mp4" height="14rem" margin="0 0.05vw" />
                  </>
                ) : glitchMoney ? <MarqueeGlitchWord text={text} color={panelTextColor || marqueeTextColor} wordmark /> : logoOnly ? (
                  <img src={image} alt={text} onLoad={() => setImgTick(t => t + 1)} style={{ height: '3.4rem', width: 'auto', objectFit: 'contain', marginRight: '2.4vw' }} />
                ) : tcsLogo ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '1.4vw' }}>
                    <img src={image} alt="TCS" onLoad={() => setImgTick(t => t + 1)} style={{ height: '4.6rem', width: 'auto', objectFit: 'contain' }} />
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.4rem', textTransform: 'uppercase', color: panelTextColor || marqueeTextColor, fontWeight: 700 }}>Garage Team</span>
                  </span>
                ) : (
                  <span className={scanEffect ? 'fm-scan-target' : undefined} style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.4rem', textTransform: 'uppercase', color: panelTextColor || marqueeTextColor, fontWeight: matrixRain ? 700 : 400, padding: scanEffect ? 0 : undefined, marginRight: scanEffect ? '1px' : undefined }}>{text}</span>
                )}
                {!glitchMoney && !matrixRain && !tcsLogo && !logoOnly && !videoLoop && <div className="fm-marquee__img" style={{ backgroundImage: `url(${image})` }} />}
              </div>
            ))}
          </div>
        </div>
        {isTouch && isOpen && link && (
          <a
            className="fm-visit"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={ev => ev.stopPropagation()}
            style={{ color: panelTextColor || marqueeTextColor, borderColor: panelTextColor || marqueeTextColor }}
          >
            View project
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        )}
        {starfield && <StarfieldOverlay />}
        {currencyRain && <CurrencyRainOverlay />}
        {glitchMoney && <GlitchNoiseOverlay />}
        {matrixRain && <MatrixRainOverlay />}
        {scanEffect && <ScannerOverlay containerRef={marqueeRef} />}
      </div>
    </li>
  );
}

function FlowingMenu({ items = [], speed = 18, textColor = '#1A1612', techColor = '#8A7F72', bgColor = 'transparent', marqueeBgColor = '#C4962A', marqueeTextColor = '#F5F0E8', borderColor = 'rgba(26,22,18,0.12)', fontFamily = "'Playfair Display', serif" }) {
  useEffect(() => { injectCSS(); }, []);
  // Which row is expanded on touch. Held here rather than per-item so opening
  // one closes whichever was already open.
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="fm-menu-wrap" style={{ backgroundColor: bgColor }}>
      <ul className="fm-menu">
        {items.map((item, idx) => (
          <MenuItem key={idx} {...item} speed={speed} textColor={textColor} techColor={techColor}
            marqueeBgColor={marqueeBgColor} marqueeTextColor={marqueeTextColor} borderColor={borderColor} fontFamily={fontFamily}
            isOpen={openIndex === idx}
            onToggle={() => setOpenIndex(prev => (prev === idx ? null : idx))} />
        ))}
      </ul>
    </div>
  );
}

export default FlowingMenu;
