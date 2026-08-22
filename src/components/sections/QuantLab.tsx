'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';

const QuantLabSection = dynamic(() => import('../ui/QuantLabSection'), { ssr: false });

export default function QuantLab() {
  const { T } = useTheme();
  return (
    <section id="quant-lab" style={{ maxWidth: 1200, margin: '0 auto', padding: '4.5rem 4rem' }}>
      <QuantLabSection
        ink={T.ink}
        inkFaint={T.inkFaint}
        inkMuted={T.inkMuted}
        line={`rgba(${T.inkRgb},0.12)`}
        accentColor="#F5C518"
      />
    </section>
  );
}
