// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

function fmt(s) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function GlassyMusicPlayer({ tracks = [], ink = '#FFFFFF', dim = 'rgba(255,255,255,0.55)', isDark = true }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const barRef = useRef(null);
  const track = tracks[index] || {};

  const glass = isDark
    ? { background: 'rgba(120,120,120,0.22)', backdropFilter: 'blur(18px) saturate(1.4) brightness(1.1)', WebkitBackdropFilter: 'blur(18px) saturate(1.4) brightness(1.1)', border: '1px solid rgba(255,255,255,0.18)' }
    : { background: 'rgba(15,15,15,0.55)', backdropFilter: 'blur(18px) saturate(1.2) brightness(0.9)', WebkitBackdropFilter: 'blur(18px) saturate(1.2) brightness(0.9)', border: '1px solid rgba(255,255,255,0.12)' };
  const content = isDark ? ink : '#FFFFFF';
  const faint = isDark ? dim : 'rgba(255,255,255,0.55)';

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrent(el.currentTime);
    const onDur = () => setDuration(el.duration || 0);
    const onEnd = () => next();
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onDur);
    el.addEventListener('ended', onEnd);
    return () => { el.removeEventListener('timeupdate', onTime); el.removeEventListener('loadedmetadata', onDur); el.removeEventListener('ended', onEnd); };
  }, [index]);

  useEffect(() => {
    setCurrent(0); setDuration(0);
    if (playing && audioRef.current) audioRef.current.play();
  }, [index]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el || !track.src) return;
    if (playing) { el.pause(); setPlaying(false); } else { el.play(); setPlaying(true); }
  };
  const prev = () => { if (!tracks.length) return; setIndex(i => (i - 1 + tracks.length) % tracks.length); };
  const next = () => { if (!tracks.length) return; setIndex(i => (i + 1) % tracks.length); };
  const seek = e => {
    const el = audioRef.current;
    if (!el || !duration || !barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = p * duration;
    setCurrent(p * duration);
  };

  const CircleBtn = ({ onClick, children, label }) => (
    <button onClick={onClick} aria-label={label} style={{
      width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
      background: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{children}</button>
  );

  const progress = duration ? current / duration : 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, borderRadius: 999, padding: '10px 20px 10px 10px',
      ...glass, boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.25), 0 12px 30px rgba(0,0,0,0.25)',
    }}>
      {track.src && <audio ref={audioRef} src={track.src} preload="metadata" />}
      <div style={{
        width: 44, height: 44, borderRadius: 11, flexShrink: 0, overflow: 'hidden',
        background: track.art ? `url(${track.art}) center/cover no-repeat` : 'rgba(255,255,255,0.08)',
      }} />
      <div style={{ minWidth: 0, marginRight: 6 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '0.85rem', color: content, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title || 'No track loaded'}</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: faint, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist || ''}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.52rem', color: faint }}>{fmt(current)}</span>
          <div ref={barRef} onClick={seek} style={{ width: 100, height: 3, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)', cursor: track.src ? 'pointer' : 'default', overflow: 'hidden' }}>
            <div style={{ width: `${progress * 100}%`, height: '100%', background: content, opacity: 0.9 }} />
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.52rem', color: faint }}>{fmt(duration)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
        <CircleBtn onClick={prev} label="Previous">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={content} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </CircleBtn>
        <CircleBtn onClick={toggle} label={playing ? 'Pause' : 'Play'}>
          {playing
            ? <svg width="11" height="11" viewBox="0 0 24 24" fill={content}><rect x="5" y="4" width="5" height="16" /><rect x="14" y="4" width="5" height="16" /></svg>
            : <svg width="11" height="11" viewBox="0 0 24 24" fill={content}><path d="M6 4l14 8-14 8V4z" /></svg>}
        </CircleBtn>
        <CircleBtn onClick={next} label="Next">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={content} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </CircleBtn>
      </div>
    </div>
  );
}

export default GlassyMusicPlayer;
