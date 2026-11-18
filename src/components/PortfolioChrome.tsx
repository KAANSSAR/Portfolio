'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';
import { NAV_LINKS, SITE } from '@/lib/data';
import { smoothScrollTo } from '@/lib/scroll';
import Logo from './Logo';
import CustomCursor from './CustomCursor';
import ReaderNav, { readerOpen, closeReaderToHero } from './ui/ReaderNav';

// All of these manipulate window/canvas/three.js directly and have no SEO
// value server-rendered, so they're loaded client-only.
const ChaosGrid = dynamic(() => import('./ui/ChaosGrid'), { ssr: false });
const Cube = dynamic(() => import('./ui/Cube'), { ssr: false });
const PetCompanion = dynamic(() => import('./ui/PetCompanion'), { ssr: false });
const DynamicInfo = dynamic(() => import('./ui/DynamicInfo'), { ssr: false });
const UnfoldMenu = dynamic(() => import('./ui/UnfoldMenu'), { ssr: false });
const ThemeChanger = dynamic(() => import('./ui/ThemeChanger'), { ssr: false });
const SocialShareFAB = dynamic(() => import('./ui/SocialShareFAB'), { ssr: false });
const ResumeFAB = dynamic(() => import('./ui/ResumeFAB'), { ssr: false });

const UNFOLD_ITEMS = [...NAV_LINKS].reverse().concat([{ label: 'Home', href: '#hero' }]);

export default function PortfolioChrome() {
  const { T, isDark, toggleTheme } = useTheme();
  const [roleIndex, setRoleIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setRoleIndex((i) => (i + 1) % SITE.roles.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Fixed particle-grid background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
        <ChaosGrid
          gridPercentage={55}
          chaosStrength={1}
          particleColor={T.ink}
          backgroundColor="transparent"
          connectionDistance={90}
          spacing={46}
          mouseInteraction
          mouseRadius={140}
          mouseStrength={1}
          intensity={isDark ? 1 : 0.5}
          showLines={false}
          shootingStars
        />
      </div>

      {/* Floating Rubik's cube, fixed behind content while scrolling */}
      <div
        className="cube-halo"
        style={{
          position: 'fixed', top: '78%', left: '12%', transform: 'translate(-50%,-50%)',
          width: 520, height: 520, zIndex: 0, pointerEvents: 'none',
          background: `radial-gradient(circle, ${T.bg} 0%, ${T.bg} 45%, transparent 72%)`,
        }}
      >
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 340, height: 340, opacity: isDark ? 0.6 : 0.65 }}>
          <Cube size={220} pxPerMove={220} isDark={isDark} />
        </div>
      </div>

      <PetCompanion spriteSrc="/images/astronaut-pet-sprite.png" size={48} />

      <Logo onClick={() => (readerOpen() ? closeReaderToHero() : window.scrollTo({ top: 0, behavior: 'smooth' }))} />

      <DynamicInfo
        name={SITE.name}
        role={SITE.roles[roleIndex]}
        initials={SITE.initials}
        location="Sydney, AU"
        timeZone="Australia/Sydney"
        status="Open to work"
        accent="#FFFFFF"
      />

      <UnfoldMenu
        items={UNFOLD_ITEMS}
        onSelect={(item: { label: string; href: string }) => smoothScrollTo(item.href)}
        ink={T.ink}
        bg={T.bg}
        inkFaint={T.inkFaint}
        isDark={isDark}
      />

      <div className="theme-toggle-wrap">
        <ThemeChanger isDark={isDark} onToggle={toggleTheme} ink={T.ink} bg={T.bg} />
      </div>

      <SocialShareFAB ink={T.ink} bg={T.bg} itemGap={60} isDark={isDark} />
      <ResumeFAB href={SITE.resumeUrl} filename="Kanishka_Sarkar_Resume-2026.pdf" ink={T.ink} isDark={isDark} />

      <ReaderNav ink={T.ink} isDark={isDark} />

      <CustomCursor />
    </>
  );
}
