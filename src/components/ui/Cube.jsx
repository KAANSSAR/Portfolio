// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const faceArray = ['front', 'back', 'top', 'bottom', 'left', 'right'];
const TICKERS = ['AAPL','TSLA','NVDA','MSFT','GOOGL','AMZN','META','SPY','QQQ','BTC/USD','ETH/USD','JPM','AMD','NFLX','V','COIN','GME','PLTR','SOFI','ARM','AVGO','CRM','ORCL','UBER','SNAP','RIVN','SHOP','SQ','PYPL','DIS','BA','XOM','WMT','KO','PEP','NKE','INTC','IBM','ADBE','CSCO','QCOM','T','VZ','GM','F','ABNB','DASH','RBLX','SNOW','ZM','SBUX'];
const DISPLAY_SYMBOL = { 'BTC/USD': 'BTC', 'ETH/USD': 'ETH' };

// --- ported verbatim from JithuTholoor/RubixCube src/utilities/utilities.js ---
const toRadians = angle => angle * (Math.PI / 180);
const toDegrees = angle => angle * (180 / Math.PI);

function calcPosition(position, rotationVector, angleOfRotation) {
  const cos = a => Math.cos(toRadians(a));
  const sin = a => Math.sin(toRadians(a));
  const ux = rotationVector[0], uy = rotationVector[1], uz = rotationVector[2];
  const angle = angleOfRotation;
  const x = position[0] * (cos(angle) + ux * ux * (1 - cos(angle))) +
    position[1] * (ux * uy * (1 - cos(angle)) - uz * sin(angle)) +
    position[2] * (ux * uz * (1 - cos(angle)) + uy * sin(angle));
  const y = position[0] * (uy * ux * (1 - cos(angle)) + uz * sin(angle)) +
    position[1] * (cos(angle) + uy * uy * (1 - cos(angle))) +
    position[2] * (uy * uz * (1 - cos(angle)) - ux * sin(angle));
  const z = position[0] * (uz * ux * (1 - cos(angle)) - uy * sin(angle)) +
    position[1] * (uz * uy * (1 - cos(angle)) + ux * sin(angle)) +
    position[2] * (cos(angle) + uz * uz * (1 - cos(angle)));
  return [x, y, z];
}

function calculateResultantAngle(alpha, rotationVector, currentRotationVector, beta) {
  const cos = a => Math.cos(toRadians(a));
  const sin = a => Math.sin(toRadians(a));
  const lx = rotationVector[0], ly = rotationVector[1], lz = rotationVector[2];
  const mx = currentRotationVector[0], my = currentRotationVector[1], mz = currentRotationVector[2];
  const gamaInverse = cos(alpha / 2) * cos(beta / 2) - sin(alpha / 2) * sin(beta / 2) * (lx * mx + ly * my + lz * mz);
  const gama = 2 * toDegrees(Math.acos(Math.abs(gamaInverse) > 1 ? gamaInverse / Math.abs(gamaInverse) : gamaInverse));
  const nx = (sin(alpha / 2) * cos(beta / 2) * lx + cos(alpha / 2) * sin(beta / 2) * mx + sin(alpha / 2) * sin(beta / 2) * (ly * mz - lz * my)) / sin(gama / 2);
  const ny = (sin(alpha / 2) * cos(beta / 2) * ly + cos(alpha / 2) * sin(beta / 2) * my + sin(alpha / 2) * sin(beta / 2) * (lz * mx - lx * mz)) / sin(gama / 2);
  const nz = (sin(alpha / 2) * cos(beta / 2) * lz + cos(alpha / 2) * sin(beta / 2) * mz + sin(alpha / 2) * sin(beta / 2) * (lx * my - ly * mx)) / sin(gama / 2);
  return { gama, rotationVector: [isNaN(nx) || !isFinite(nx) ? 1 : nx, isNaN(ny) || !isFinite(nx) ? 1 : ny, isNaN(nz) || !isFinite(nx) ? 1 : nz] };
}
// --- end ported utilities ---

function buildInitialPositions(cw) {
  return [
    [0, 0, 0], [-cw, 0, 0], [cw, 0, 0], [0, -cw, 0], [0, cw, 0],
    [-cw, -cw, 0], [-cw, cw, 0], [cw, -cw, 0], [cw, cw, 0],
    [0, 0, -cw], [-cw, 0, -cw], [cw, 0, -cw], [0, -cw, -cw], [0, cw, -cw],
    [-cw, -cw, -cw], [-cw, cw, -cw], [cw, -cw, -cw], [cw, cw, -cw],
    [0, 0, cw], [-cw, 0, cw], [cw, 0, cw], [0, -cw, cw], [0, cw, cw],
    [-cw, -cw, cw], [-cw, cw, cw], [cw, -cw, cw], [cw, cw, cw],
  ];
}
// face-key -> index into sixFaceAxis = [[0,0,1],[0,0,-1],[0,1,0],[0,-1,0],[1,0,0],[-1,0,0]]
const FACE_INDEX = { F: 0, B: 1, D: 2, U: 3, R: 4, L: 5 };

function injectCSS(isDark) {
  const existing = document.getElementById('rc-styles');
  if (existing) existing.remove();
  const s = document.createElement('style');
  s.id = 'rc-styles';
  const borderColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const textColor = isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.92)';
  s.textContent = `
.rc-container{transform-style:preserve-3d;-webkit-user-select:none;user-select:none}
.rc-cube{width:var(--cw);height:var(--cw);transform-style:preserve-3d;position:absolute;left:calc(50% - var(--cw)/2);top:calc(50% - var(--cw)/2)}
.rc-face{border:1px solid ${borderColor};border-radius:4px;width:var(--cw);height:var(--cw);position:absolute;box-sizing:border-box;overflow:hidden;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-weight:600;color:${textColor}}
.rc-face pre{margin:0;white-space:pre;text-align:center}
.rc-face.front{transform:translateZ(calc(var(--cw)/2))}
.rc-face.back{transform:translateZ(calc(var(--cw)/-2))}
.rc-face.top{transform:rotateX(-90deg) translateY(calc(var(--cw)/-2));transform-origin:top center}
.rc-face.bottom{transform:rotateX(90deg) translateY(calc(var(--cw)/2));transform-origin:bottom center}
.rc-face.left{transform:rotateY(270deg) translateX(calc(var(--cw)/-2));transform-origin:center left}
.rc-face.right{transform:rotateY(-270deg) translateX(calc(var(--cw)/2));transform-origin:center right}
`;
  document.head.appendChild(s);
}

function buildTickerMap(positions, cw) {
  const shuffled = TICKERS.slice().sort(() => Math.random() - 0.5);
  let k = 0;
  const map = positions.map(t => ({
    top: t[1] === -cw ? shuffled[k++ % shuffled.length] : null,
    bottom: t[1] === cw ? shuffled[k++ % shuffled.length] : null,
    left: t[0] === -cw ? shuffled[k++ % shuffled.length] : null,
    right: t[0] === cw ? shuffled[k++ % shuffled.length] : null,
    front: t[2] === cw ? shuffled[k++ % shuffled.length] : null,
    back: t[2] === -cw ? shuffled[k++ % shuffled.length] : null,
  }));
  return map;
}

function Cubie({ translate, orientation, tickers, quotes, cw, isDark }) {
  const style = { transform: `translate3d(${translate[0]}px,${translate[1]}px,${translate[2]}px) rotate3d(${orientation[0]},${orientation[1]},${orientation[2]},${orientation[3]}deg)` };
  const faceBg = isDark ? '#000000' : '#FFFFFF';
  const symColor = isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';
  return (
    <div className="rc-cube" style={style}>
      {faceArray.map(face => {
        const sym = tickers[face];
        const q = sym ? quotes[sym] : null;
        return (
          <div key={face} className={`rc-face ${face}`} style={sym == null ? { background: 'transparent', border: 'none' } : { background: faceBg, flexDirection: 'column', gap: cw * 0.03 }}>
            {sym != null && q && (
              <React.Fragment>
                <div style={{ fontSize: cw * 0.16, fontWeight: 700, color: symColor }}>{DISPLAY_SYMBOL[sym] || sym}</div>
                <div style={{ fontSize: cw * 0.13, fontWeight: 700, color: q.up ? '#2ECC71' : '#FF4D4D' }}>{q.up ? '▲' : '▼'} {q.pct}</div>
              </React.Fragment>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Cube({
  size = 260,
  pxPerMove = 260,
  isDark = true,
}) {
  const numSize = Number(size) || 260;
  const numPxPerMove = Number(pxPerMove) || 260;
  const cw = numSize / 3;

  const initialPositionsRef = useRef(null);
  if (initialPositionsRef.current === null) initialPositionsRef.current = buildInitialPositions(cw);
  const INITIAL_POSITIONS = initialPositionsRef.current;

  const [positions, setPositions] = useState(() => INITIAL_POSITIONS.slice());
  const [angleOfRotation, setAngleOfRotation] = useState(() => Array(27).fill(0));
  const [rotationVector, setRotationVector] = useState(() => Array(27).fill([1, 0, 0]));
  const tickerMapRef = useRef(null);
  if (tickerMapRef.current === null) tickerMapRef.current = buildTickerMap(INITIAL_POSITIONS, cw);
  const allSymbols = useMemo(() => {
    const set = new Set();
    tickerMapRef.current.forEach(m => faceArray.forEach(f => { if (m[f]) set.add(m[f]); }));
    return Array.from(set);
  }, []);
  const [quotes, setQuotes] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('cubeTickerQuotes') || 'null');
      if (cached) {
        const out = {};
        Object.keys(cached).forEach(sym => { out[sym] = { up: cached[sym].up, pct: cached[sym].pct }; });
        return out;
      }
    } catch (e) {}
    return {};
  });

  useEffect(() => {
    const MAX_AGE = 2 * 60 * 60 * 1000;
    if (window.__cubeTickerLoopActive) return;
    window.__cubeTickerLoopActive = true;
    let cancelled = false;
    function readCache() {
      try { return JSON.parse(localStorage.getItem('cubeTickerQuotes') || 'null') || {}; } catch (e) { return {}; }
    }
    function writeCacheEntry(sym, entry) {
      const cache = readCache();
      cache[sym] = { ...entry, fetchedAt: Date.now() };
      try { localStorage.setItem('cubeTickerQuotes', JSON.stringify(cache)); } catch (e) {}
    }
    const cache = readCache();
    const oldestFresh = Object.values(cache).reduce((min, e) => e.fetchedAt < min ? e.fetchedAt : min, Infinity);
    if (isFinite(oldestFresh)) window.__cubeNextRefreshAt = oldestFresh + MAX_AGE;
    async function waitForGlobalSlot() {
      while (true) {
        const now = Date.now();
        const last = window.__cubeLastCallAt || 0;
        if (now - last >= 9000) { window.__cubeLastCallAt = now; return; }
        await new Promise(r => setTimeout(r, 500));
      }
    }
    async function fetchOne(sym, attempt) {
      await waitForGlobalSlot();
      try {
        const res = await fetch(`/api/quote?symbol=${encodeURIComponent(sym)}`);
        const data = await res.json();
        if (data && data.status === 'error' && /run out of API credits|429/i.test(data.message || '')) {
          console.warn('Cube ticker: rate-limited, skipping', sym);
          return;
        }
        const price = data && parseFloat(data.close);
        const prevClose = data && parseFloat(data.previous_close);
        if (typeof price === 'number' && !isNaN(price) && prevClose) {
          const pct = ((price - prevClose) / prevClose) * 100;
          const entry = { up: pct >= 0, pct: Math.abs(pct).toFixed(2) + '%' };
          writeCacheEntry(sym, entry);
          if (!cancelled) setQuotes(prev => ({ ...prev, [sym]: entry }));
        } else {
          console.warn('Cube ticker: bad quote data for', sym, data);
        }
      } catch (e) { console.warn('Cube ticker: fetch failed for', sym, e); }
    }
    async function fetchAll() {
      const now = Date.now();
      window.__cubeNextRefreshAt = now + MAX_AGE;
      for (let i = 0; i < allSymbols.length; i++) {
        if (cancelled) return;
        const sym = allSymbols[i];
        const c = readCache()[sym];
        if (c && now - c.fetchedAt < MAX_AGE) continue;
        await fetchOne(sym, 0);
      }
    }
    fetchAll();
    return () => { cancelled = true; window.__cubeTickerLoopActive = false; };
  }, [allSymbols]);
  const worldAxesRef = useRef([[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]]);
  const sequenceRef = useRef(null);
  const appliedRef = useRef(0);
  const anchorRef = useRef(null);
  const stateRef = useRef({ positions, angleOfRotation, rotationVector });
  stateRef.current = { positions, angleOfRotation, rotationVector };
  const containerRef = useRef(null);

  if (sequenceRef.current === null) {
    const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
    const scramble = [];
    let lastFace = null;
    for (let i = 0; i < 9; i++) {
      let f;
      do { f = faces[Math.floor(Math.random() * faces.length)]; } while (f === lastFace);
      lastFace = f;
      scramble.push({ face: f, dir: Math.random() < 0.5 ? 1 : -1 });
    }
    const solve = scramble.slice().reverse().map(m => ({ face: m.face, dir: -m.dir }));
    sequenceRef.current = scramble.concat(solve);
  }

  useEffect(() => { injectCSS(isDark); }, [isDark]);

  // whole-cube presentation: base tilt + continuous idle spin + scroll-reactive multi-axis tilt
  useEffect(() => {
    let raf, spin = 0, last = performance.now();
    let lastScrollY = window.scrollY, smoothTiltX = 0, smoothTiltZ = 0, smoothVel = 0;
    const baseTilt = -16;
    function frame(now) {
      const dt = now - last;
      last = now;
      spin += dt * 0.012;

      const scrollDelta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      smoothVel += (scrollDelta - smoothVel) * 0.06;
      const targetTiltX = Math.max(-38, Math.min(38, window.scrollY * 0.02));
      const targetTiltZ = Math.max(-22, Math.min(22, smoothVel * 2.2));
      smoothTiltX += (targetTiltX - smoothTiltX) * 0.1;
      smoothTiltZ += (targetTiltZ - smoothTiltZ) * 0.1;
      spin += scrollDelta * 0.04;

      if (containerRef.current) containerRef.current.style.transform = `rotateX(${baseTilt + smoothTiltX}deg) rotateY(${spin % 360}deg) rotateZ(${smoothTiltZ}deg)`;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (anchorRef.current === null) anchorRef.current = window.scrollY;

    function applyMoveSegment(seqEntry, degrees) {
      const axis = worldAxesRef.current[FACE_INDEX[seqEntry.face]];
      const { positions: pos, angleOfRotation: ang, rotationVector: vec } = stateRef.current;
      const newPos = pos.slice(), newAng = ang.slice(), newVec = vec.slice();
      for (let j = 0; j < newPos.length; j++) {
        const lineSum = newPos[j][0] * axis[0] + newPos[j][1] * axis[1] + newPos[j][2] * axis[2];
        if (Math.abs(lineSum - cw) < cw * 0.012) {
          newPos[j] = calcPosition(pos[j], axis, degrees);
          const r = calculateResultantAngle(degrees, axis, vec[j], ang[j]);
          newVec[j] = r.rotationVector;
          newAng[j] = r.gama;
        }
      }
      stateRef.current = { positions: newPos, angleOfRotation: newAng, rotationVector: newVec };
    }

    function onScroll() {
      const sequence = sequenceRef.current;
      const target = (window.scrollY - anchorRef.current) / numPxPerMove;
      let applied = appliedRef.current;
      let guard = 0;
      while (applied !== target && guard < 200) {
        guard++;
        const moveIdx = target > applied ? Math.floor(applied + 1e-9) : Math.ceil(applied - 1e-9) - 1;
        const boundary = target > applied ? moveIdx + 1 : moveIdx;
        const next = target > applied ? Math.min(target, boundary) : Math.max(target, boundary);
        const segFrac = next - applied;
        const seqIdx = ((moveIdx % sequence.length) + sequence.length) % sequence.length;
        const seqEntry = sequence[seqIdx];
        applyMoveSegment(seqEntry, segFrac * 90 * seqEntry.dir);
        applied = next;
      }
      appliedRef.current = applied;
      setPositions(stateRef.current.positions);
      setAngleOfRotation(stateRef.current.angleOfRotation);
      setRotationVector(stateRef.current.rotationVector);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [numPxPerMove, cw]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: `${numSize * 7}px` }}>
      <div ref={containerRef} className="rc-container" style={{ '--cw': `${cw}px`, width: numSize, height: numSize }}>
        {positions.map((pos, i) => (
          <Cubie key={i} translate={pos} orientation={[rotationVector[i][0], rotationVector[i][1], rotationVector[i][2], angleOfRotation[i]]} tickers={tickerMapRef.current[i]} quotes={quotes} cw={cw} isDark={isDark} />
        ))}
      </div>
    </div>
  );
}

export default Cube;
