'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';
import { SITE, SHORT_ROLES, TRACKS } from '@/lib/data';
import HeroNameCanvas from '../HeroNameCanvas';

const OrbitDotGlobe = dynamic(() => import('../ui/OrbitDotGlobe'), { ssr: false });
const GlitchText = dynamic(() => import('../ui/GlitchText'), { ssr: false });
const GlassyMusicPlayer = dynamic(() => import('../ui/GlassyMusicPlayer'), { ssr: false });

export default function Hero() {
  const { T, isDark } = useTheme();

  return (
    <section
      id="hero"
      style={{
        position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 4rem', overflow: 'hidden',
      }}
    >
      <div className="hero-globe" style={{ position: 'absolute', top: '48%', right: '2%', transform: 'translateY(-50%)', width: 340, height: 340, borderRadius: '50%', overflow: 'visible', pointerEvents: 'auto' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: T.bg }} />
        <div style={{ position: 'relative', width: 520, height: 520, left: -90, top: -90 }}>
          <OrbitDotGlobe
            autoRotate
            rotationSpeed={0.009}
            radius={2}
            dotColor={isDark ? '#ffffff' : '#121110'}
            oceanDotColor={isDark ? '#ffffff25' : '#1211102e'}
            lightMode={!isDark}
          />
        </div>
      </div>

      <div className="hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}>
        <div className="hero-location" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.gold }}>
          <span style={{ display: 'block', width: 40, height: 1, background: T.gold }} />
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#E8453C" style={{ flexShrink: 0 }}>
            <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 6.06 7.31 14.62 7.62 14.98a1.13 1.13 0 0 0 1.76 0C13.19 23.12 20.5 14.56 20.5 8.5 20.5 3.81 16.69 0 12 0zm0 12a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
          </svg>
          {SITE.location} · {SITE.university}
        </div>

        <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{SITE.name}</h1>
        <HeroNameCanvas />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 20, marginBottom: 44, flexWrap: 'wrap' }}>
          <span className="hero-currently" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: T.inkFaint }}>Currently:</span>
          <GlitchText
            words={SHORT_ROLES}
            holdDuration={3200}
            glitchDuration={900}
            textStyle={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(15px,1.8vw,22px)', color: T.rust, fontWeight: 400 }}
          />
        </div>

        <div className="hero-player" style={{ width: 330, marginLeft: -4 }}>
          <GlassyMusicPlayer tracks={TRACKS} ink={T.ink} dim={`rgba(${T.inkRgb},0.55)`} isDark={isDark} />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 36, right: 44, fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.inkFaint, writingMode: 'vertical-rl' }}>
        Scroll
      </div>
    </section>
  );
}
