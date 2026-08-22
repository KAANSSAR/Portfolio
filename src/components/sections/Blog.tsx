'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';

const BlogSection = dynamic(() => import('../ui/BlogSection'), { ssr: false });

export default function Blog() {
  const { T } = useTheme();
  return (
    <section id="blog" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 4rem 4.5rem' }}>
      <BlogSection
        category="blog"
        sectionLabel="Blog"
        heading="Writing"
        accentColor="#4ECDC4"
        ink={T.ink}
        inkFaint={T.inkFaint}
        inkMuted={T.inkMuted}
        bg={T.bg}
        line={`rgba(${T.inkRgb},0.12)`}
      />
    </section>
  );
}
