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
// "Hotel California - 2013 Remaster" -> "Hotel California"
const cleanName = (n: string) => n.replace(/\s+-\s+(\d{4}\s+)?Remaster(ed)?(\s+\d{4})?(\s+Version)?$/i, '');

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
    <div className="top-tracks" style={{ marginTop: 40 }}>
      <div className="tt-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
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

      <ol className="tt-list" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(tracks || Array.from({ length: 5 }, () => null)).slice(0, 5).map((t, i) => (
          <li key={t ? t.url + i : i}>
            <a href={t?.url} target="_blank" rel="noopener noreferrer" className="tt-pill"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 16px 5px 5px', borderRadius: 999, border: `0.5px solid ${T.line}`,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)', textDecoration: 'none', color: 'inherit', pointerEvents: t ? 'auto' : 'none', transition: 'border-color .2s, background .2s' }}>
              <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', overflow: 'hidden', background: T.line }}>
                {t?.image && <img src={t.image} alt="" width={32} height={32} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </span>
              <span style={{ fontFamily: mono, fontSize: '0.66rem', color: T.inkFaint, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ minWidth: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.84rem' }}>
                <span className="tt-name" style={{ color: T.ink, transition: 'color .2s' }}>{t ? cleanName(t.name) : '\u00A0'}</span>
                {t && <span style={{ color: T.inkFaint }}>{'  \u00B7  '}{t.artist}</span>}
              </span>
              <svg className="tt-arrow" width="11" height="11" viewBox="0 0 12 12" aria-hidden style={{ flexShrink: 0, opacity: 0, transition: 'opacity .2s', color: green }}>
                <path d="M3 9L9 3M4 3h5v5" stroke="currentColor" strokeWidth="1.4" fill="none" />
              </svg>
            </a>
          </li>
        ))}
      </ol>
      <style>{`
        @keyframes ttEq { 0%,100% { transform: scaleY(.3) } 50% { transform: scaleY(1) } }
        .tt-pill:hover { border-color: ${green} !important; }
        .tt-pill:hover .tt-name { color: ${green} !important; }
        .tt-pill:hover .tt-arrow { opacity: 1 !important; }
        @media (max-width: 520px) { .tt-head { flex-direction: column; align-items: flex-start !important; gap: 12px !important; } }
        @media (prefers-reduced-motion: reduce) { .tt-eq span { animation: none !important; } }
      `}</style>
    </div>
  );
}
