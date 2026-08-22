'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';
import { TIMELINE } from '@/lib/data';

const ExperienceJourney = dynamic(() => import('../ui/ExperienceJourney'), { ssr: false });

export default function Experience() {
  const { T } = useTheme();

  return (
    <section id="experience" style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 4rem 1.5rem' }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48, color: T.inkFaint }}>
        <span style={{ color: '#4ECDC4' }}>Experience</span>
        <span style={{ flex: 1, height: 1, maxWidth: 80, background: '#4ECDC4', opacity: 0.4 }} />
      </div>
      <h2 id="exp-heading" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', fontSize: 'clamp(36px,4.5vw,64px)', margin: '0 0 32px', color: T.ink }}>
        Where I&apos;ve been.
      </h2>

      {/* ExperienceJourney manages its own scroll height (entries.length * 34vh)
          and internally pins/releases its canvas layer as you scroll through
          it — it must be a direct child here with no height-constrained
          wrapper around it, or that inner height overflows straight through
          and the pinned canvas bleeds into the sections below. */}
      <ExperienceJourney entries={TIMELINE} accent={T.gold} titleColor={T.ink} metaColor={T.inkFaint} />
    </section>
  );
}
