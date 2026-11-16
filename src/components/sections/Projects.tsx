'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';
import { accent } from '@/lib/accent';
import { PROJECTS, PLACEHOLDER_IMG } from '@/lib/data';

const FlowingMenu = dynamic(() => import('../ui/FlowingMenu'), { ssr: false });

// Ported 1:1 from PROJECTS_RAW.map(...) in Portfolio Rebuild.dc.html's renderVals().
const SPECIAL_PROJECT_NAMES = [
  'Stratum', 'Options Pricing Engine', 'Agentic AI · TCS Enterprise', 'CattleScanner',
  'Shivam Brass · Site Redesign', 'Job Management App Refactor', 'Cardinal',
];
const DATA_VIEW_NAMES = new Set(SPECIAL_PROJECT_NAMES.slice(0, 4));

function buildFlowingMenuItems() {
  return PROJECTS.map((p) => {
    const image =
      p.name === 'Stratum' ? '/images/stratum-logo-dark.png'
      : p.name === 'Agentic AI · TCS Enterprise' ? '/images/tcs-logo.png'
      : p.name === 'Shivam Brass · Site Redesign' ? '/images/shivam-brass-logo.png'
      : p.name === 'Job Management App Refactor' ? '/images/hanlon-logo.png'
      : PLACEHOLDER_IMG;

    return {
      link: p.url || '',
      text: p.name,
      image,
      num: p.num,
      tech: p.tech,
      glitchMoney: p.name === 'Stratum',
      matrixRain: p.name === 'Options Pricing Engine',
      tcsLogo: p.name === 'Agentic AI · TCS Enterprise',
      scanEffect: p.name === 'CattleScanner',
      logoOnly: p.name === 'Shivam Brass · Site Redesign' || p.name === 'Job Management App Refactor',
      videoLoop: p.name === 'Cardinal' ? '/video/cardinal-wordmark-glitch.mp4' : undefined,
      starfield: false,
      currencyRain: p.name === 'Cardinal',
      panelBg:
        p.name === 'Shivam Brass · Site Redesign' ? '#1F1810'
        : p.name === 'Job Management App Refactor' ? '#40296A'
        : p.name === 'Cardinal' ? '#000000'
        : DATA_VIEW_NAMES.has(p.name) ? '#0A0A0A'
        : undefined,
      panelTextColor: SPECIAL_PROJECT_NAMES.includes(p.name) ? '#FFFFFF' : undefined,
    };
  });
}

export default function Projects() {
  const { T, isDark } = useTheme();
  const items = useMemo(() => buildFlowingMenuItems(), []);
  // The hint said "hover", which is not a thing on a phone.
  const [isTouch, setIsTouch] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    const sync = () => setIsTouch(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <section id="projects" style={{ maxWidth: 1200, margin: '-320px auto 0', padding: '0 4rem 4.5rem', position: 'relative' }}>
      <div className="sec-label" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, color: T.inkFaint }}>
        <span style={{ color: accent('#FFE66D', isDark) }}>Projects</span>
        <span style={{ flex: 1, height: 1, maxWidth: 80, background: accent('#FFE66D', isDark), opacity: 0.4 }} />
      </div>
      <h2 id="projects-heading" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', fontSize: 'clamp(36px,4.5vw,64px)', margin: '0 0 24px', color: T.ink }}>
        What I&apos;ve built.
      </h2>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: T.inkFaint, margin: '0 0 32px' }}>
        {isTouch ? 'Tap a row for the data view' : 'Hover a row for the data view'}
      </p>

      <div className="fm-menu-wrap-outer" style={{ height: 640, borderTop: `0.5px solid ${T.line}` }}>
        <FlowingMenu
          items={items}
          speed={18}
          textColor={T.ink}
          techColor={T.inkFaint}
          marqueeBgColor={T.gold}
          marqueeTextColor={T.bg}
          borderColor={T.line}
        />
      </div>
    </section>
  );
}
