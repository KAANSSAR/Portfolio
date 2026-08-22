'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';
import { GALLERY, SITE } from '@/lib/data';

const ArcFocusCarousel = dynamic(() => import('../ui/ArcFocusCarousel'), { ssr: false });

export default function Gallery() {
  const { T } = useTheme();

  // The category filter buttons are hidden in the source design (display:none),
  // so all gallery items are shown, matching the shipped behaviour.
  const igPosts = useMemo(
    () =>
      GALLERY.map((g) => ({
        src: g.src,
        alt: g.alt,
        caption: g.caption,
        pos: g.pos,
        location: g.category === 'events' ? SITE.location : undefined,
      })),
    []
  );

  return (
    <section id="gallery" style={{ padding: '4.5rem 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 4rem' }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, color: T.inkFaint }}>
          <span style={{ color: '#A78BFA' }}>Life</span>
          <span style={{ flex: 1, height: 1, maxWidth: 80, background: '#A78BFA', opacity: 0.4 }} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', fontSize: 'clamp(36px,4.5vw,64px)', margin: '0 0 20px', color: T.ink }}>
          Beyond the <em style={{ fontStyle: 'italic', color: T.inkMuted }}>code.</em>
        </h2>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 520, margin: '0 0 32px', color: T.inkFaint }}>
          Travel, sport, sketching, and everything in between. Swipe or drag through the photos.
        </p>
      </div>

      <div style={{ marginTop: 48, height: 360, borderRadius: 4, overflow: 'hidden' }}>
        <ArcFocusCarousel
          items={igPosts}
          cardWidth={190}
          cardHeight={250}
          spacing={135}
          arcHeight={42}
          activeScale={1.08}
          inactiveScale={0.8}
          accent={T.ink}
          bg="transparent"
        />
      </div>
    </section>
  );
}
