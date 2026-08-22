// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    let t;
    const obs = new IntersectionObserver(([entry]) => {
      clearTimeout(t);
      t = setTimeout(() => setInView(entry.isIntersecting), 120);
    }, { threshold: 0.35 });
    obs.observe(ref.current);
    return () => { obs.disconnect(); clearTimeout(t); };
  }, []);
  return inView;
}

function ArcFocusCarousel({ items = [], cardWidth = 180, cardHeight = 240, spacing = 130, arcHeight = 46, activeScale = 1.08, inactiveScale = 0.82, accent = '#0A0A0A', bg = 'transparent' }) {
  cardWidth = Number(cardWidth) || 180;
  cardHeight = Number(cardHeight) || 240;
  spacing = Number(spacing) || 130;
  arcHeight = Number(arcHeight) || 46;
  activeScale = Number(activeScale) || 1.08;
  inactiveScale = Number(inactiveScale) || 0.82;
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const dragRef = useRef(null);
  const wrapRef = useRef(null);
  const opened = useInView(wrapRef);
  const n = items.length;
  const wrap = v => ((v % n) + n) % n;

  useEffect(() => { if (!opened) { const t = setTimeout(() => setIndex(0), 200); return () => clearTimeout(t); } }, [opened]);

  const onDown = e => { dragRef.current = { x: e.clientX }; };
  const onMove = e => { if (dragRef.current) setDrag(e.clientX - dragRef.current.x); };
  const onUp = () => {
    if (dragRef.current) setIndex(i => i - Math.round(drag / spacing));
    dragRef.current = null; setDrag(0);
  };
  const onWheel = e => { e.preventDefault(); if (Math.abs(e.deltaY) > 8) setIndex(i => i + (e.deltaY > 0 ? 1 : -1)); };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: '100%', background: bg }}>
      <div
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onWheel={onWheel}
        style={{ position: 'relative', width: '100%', height: '100%', cursor: 'grab', overflow: 'hidden' }}
      >
        {items.map((it, i) => {
          let offset = i - index - drag / spacing;
          offset -= Math.round(offset / n) * n;
          const dist = Math.abs(offset);
          const x = opened ? offset * spacing : 0;
          const y = opened ? Math.min(arcHeight, offset * offset * (arcHeight / 6)) : dist * 3;
          const scale = opened ? (dist < 0.5 ? activeScale : Math.max(inactiveScale - (dist - 0.5) * 0.08, 0.5)) : Math.max(0.86, activeScale - dist * 0.03);
          const opacity = opened ? (dist > 3.5 ? 0 : 1 - Math.max(0, dist - 1) * 0.28) : (dist < 4 ? 1 : 0);
          const rotate = opened ? 0 : (i % 2 === 0 ? -1 : 1) * Math.min(dist * 2.5, 6);
          return (
            <div key={i} onClick={() => setIndex(idx => idx + Math.round(offset))} style={{
              position: 'absolute', top: '50%', left: '50%', width: cardWidth, height: cardHeight,
              marginLeft: -cardWidth / 2, marginTop: -cardHeight / 2,
              transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
              opacity, borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
              boxShadow: dist < 0.5 ? '0 22px 44px rgba(0,0,0,0.3)' : '0 10px 22px rgba(0,0,0,0.15)',
              transition: dragRef.current ? 'none' : `transform ${opened ? '1.1s' : '0.9s'} cubic-bezier(.22,1,.36,1) ${opened ? Math.min(dist, 3) * 0.08 : 0}s, opacity .6s ease`,
              zIndex: Math.round(100 - dist),
            }}>
              <img src={it.src} alt={it.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: it.pos || 'center', display: 'block' }} draggable={false} />
            </div>
          );
        })}
      </div>

      <button onClick={() => setIndex(i => i - 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', border: 'none', background: `${accent}14`, color: accent, cursor: 'pointer', fontSize: '1.1rem', zIndex: 200 }}>‹</button>
      <button onClick={() => setIndex(i => i + 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', border: 'none', background: `${accent}14`, color: accent, cursor: 'pointer', fontSize: '1.1rem', zIndex: 200 }}>›</button>

      {items[wrap(index)] && (items[wrap(index)].caption) && (
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: accent, opacity: 0.7, whiteSpace: 'nowrap' }}>
          {items[wrap(index)].caption}
        </div>
      )}
    </div>
  );
}

export default ArcFocusCarousel;
