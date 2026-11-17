'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ABOUT_PARAGRAPHS, SKILLS, STATS, GLITCH_COLORS } from '@/lib/data';
import { accent } from '@/lib/accent';

const EASE_OUT_EXPO = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));

function hashColor(name: string, isDark: boolean) {
  const h = [...name].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0);
  return accent(GLITCH_COLORS[h % GLITCH_COLORS.length], isDark);
}

export default function About() {
  const { T, isDark } = useTheme();
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    let fallback: ReturnType<typeof setTimeout>;
    const runCounter = () => {
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / 1800);
        setProgress(p);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      fallback = setTimeout(() => setProgress(1), 2400);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setProgress(0);
          runCounter();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, []);

  const ease = EASE_OUT_EXPO(progress);
  const stats = STATS.map((s) => ({
    label: s.label,
    display:
      s.numericValue != null
        ? `${s.decimals ? (s.numericValue * ease).toFixed(s.decimals) : s.noSeparator ? Math.round(s.numericValue * ease) : Math.round(s.numericValue * ease).toLocaleString('en-US')}${s.suffix || ''}`
        : s.value,
  }));

  return (
    <section id="about" ref={sectionRef} style={{ maxWidth: 1680, margin: '0 auto', padding: '4.5rem 1.5rem' }}>
      <div className="sec-label" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48, color: T.inkFaint }}>
        <span style={{ color: accent('#FF6B6B', isDark) }}>About</span>
        <span style={{ flex: 1, height: 1, maxWidth: 80, background: accent('#FF6B6B', isDark), opacity: 0.4 }} />
      </div>

      <div className="resp-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, alignItems: 'start' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.02em', fontSize: 'clamp(40px,6vw,84px)', margin: '0 0 40px', color: T.ink }}>
            Building things
            <br />
            <em style={{ fontStyle: 'italic', color: T.inkMuted }}>that matter.</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {ABOUT_PARAGRAPHS.map((p, i) => (
              <p key={i} style={{ fontSize: '0.97rem', lineHeight: 1.85, color: T.inkMuted, margin: 0 }}>
                {p}
              </p>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 40 }}>
            {SKILLS.map((s) => {
              const color = hashColor(s, isDark);
              return (
                <span
                  key={s}
                  className="skill-tag"
                  style={{
                    fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '6px 12px', borderRadius: 2, border: `0.5px solid ${color}`, color,
                  }}
                >
                  {s}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ borderTop: `0.5px solid ${T.line}` }}>
            {stats.map((st) => (
              <div key={st.label} style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '26px 0', borderBottom: `0.5px solid ${T.line}` }}>
                <div className="stat-value" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1, fontSize: '2.6rem', minWidth: 116, textAlign: 'center', color: T.ink }}>
                  {st.display}
                </div>
                <div className="stat-label" style={{ fontSize: '0.82rem', lineHeight: 1.55, color: T.inkFaint }}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
