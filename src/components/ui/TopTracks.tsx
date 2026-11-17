'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { accent } from '@/lib/accent';

type Track = { name: string; artist: string; image: string | null; url: string };
const RANGES = [
  { key: 'short_term', label: '4 weeks' },
  { key: 'medium_term', label: '6 months' },
  { key: 'long_term', label: 'All time' },
] as const;
const GREEN = '#1DB954';

export default function TopTracks() {
  const { T, isDark } = useTheme();
  const [range, setRange] = useState<string>('short_term');
  const [cache, setCache] = useState<Record<string, Track[]>>({});
  const [failed, setFailed] = useState(false);
  const tracks = cache[range];

  useEffect(() => {
    if (cache[range]) return;
    let live = true;
    fetch(`/api/spotify/top-tracks?range=${range}`)
      .then((r) => (r.ok ? r.json() : { tracks: [] }))
      .then((d) => { if (live) setCache((c) => ({ ...c, [range]: d.tracks || [] })); })
      .catch(() => live && setFailed(true));
    return () => { live = false; };
  }, [range, cache]);

  // Hide the whole block when Spotify is not set up or the first load came back empty.
  if (failed || (cache.short_term && cache.short_term.length === 0)) return null;

  const green = accent(GREEN, isDark);
  const mono = "'DM Mono', monospace";

  return (
    <div className="top-tracks" style={{ marginTop: 88, paddingTop: 40, borderTop: `0.5px solid ${T.line}` }}>
      <div className="tt-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="tt-eq" aria-hidden style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 3, height: '100%', background: green, borderRadius: 1, animation: `ttEq 1s ${i * 0.18}s ease-in-out infinite`, transformOrigin: 'bottom' }} />
            ))}
          </span>
          <span style={{ fontFamily: mono, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: T.inkFaint }}>
            On repeat
          </span>
        </div>
        <div role="tablist" style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 999, border: `0.5px solid ${T.line}` }}>
          {RANGES.map((r) => {
            const on = r.key === range;
            return (
              <button key={r.key} role="tab" aria-selected={on} onClick={() => setRange(r.key)}
                style={{ fontFamily: mono, fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: on ? T.ink : 'transparent', color: on ? T.bg : T.inkFaint, transition: 'background .25s, color .25s' }}>
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <ol className="tt-list" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 190px))', justifyContent: 'space-between', gap: 28 }}>
        {(tracks || Array.from({ length: 5 }, () => null)).slice(0, 5).map((t, i) => (
          <li key={t ? t.url + i : i} className="tt-item">
            <a href={t?.url} target="_blank" rel="noopener noreferrer" className="tt-row"
              style={{ display: 'flex', flexDirection: 'column', gap: 12, textDecoration: 'none', color: 'inherit', pointerEvents: t ? 'auto' : 'none' }}>
              <span className="tt-art" style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: 6, overflow: 'hidden', background: T.line }}>
                {t?.image && <img src={t.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s' }} />}
                <svg className="tt-arrow" width="14" height="14" viewBox="0 0 12 12" aria-hidden style={{ position: 'absolute', top: 10, right: 10, opacity: 0, transition: 'opacity .2s', color: '#fff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.6))' }}>
                  <path d="M3 9L9 3M4 3h5v5" stroke="currentColor" strokeWidth="1.4" fill="none" />
                </svg>
              </span>
              <span className="tt-meta" style={{ display: 'flex', gap: 10, alignItems: 'baseline', minWidth: 0 }}>
                <span className="tt-num" style={{ fontFamily: mono, fontSize: '0.72rem', color: T.inkFaint, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                <span className="tt-text" style={{ minWidth: 0, flex: 1 }}>
                  <span className="tt-name" style={{ display: 'block', fontSize: '0.92rem', color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color .2s' }}>
                    {t ? t.name : '\u00A0'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: T.inkFaint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                    {t ? t.artist : '\u00A0'}
                  </span>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
      <style>{`
        @keyframes ttEq { 0%,100% { transform: scaleY(.3) } 50% { transform: scaleY(1) } }
        .tt-row:hover .tt-name { color: ${green} !important; }
        .tt-row:hover .tt-arrow { opacity: 1 !important; }
        .tt-row:hover .tt-art img { transform: scale(1.05); }
        @media (max-width: 768px) {
          .top-tracks { margin-top: 56px !important; }
          .tt-list { grid-template-columns: 1fr !important; gap: 0 !important; }
          .tt-item { border-bottom: 0.5px solid ${T.line}; }
          .tt-row { flex-direction: row !important; align-items: center; padding: 12px 4px; gap: 16px !important; }
          .tt-meta { display: contents !important; }
          .tt-num { order: 0; width: 22px; }
          .tt-art { order: 1; }
          .tt-text { order: 2; }
          .tt-art { width: 44px !important; flex-shrink: 0; border-radius: 4px !important; }
          .tt-arrow { display: none; }
        }
        @media (prefers-reduced-motion: reduce) { .tt-eq span { animation: none !important; } }
      `}</style>
    </div>
  );
}
