'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { GALLERY_ITEMS, GALLERY_CATEGORIES } from '@/lib/gallery'
import type { GalleryCategory } from '@/lib/gallery'
import { staggerContainer, fadeUp, EASE_OUT_EXPO } from '@/lib/variants'

function GalleryCard({ item, index }: { item: any; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.15, margin: '0px 0px -40px 0px' })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 32, scale: 0.97 },
        visible: {
          opacity: 1, y: 0, scale: 1,
          transition: { duration: 0.7, delay: (index % 3) * 0.08, ease: EASE_OUT_EXPO },
        },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden ${item.span === 'tall' ? 'row-span-2' : 'row-span-1'}`}
      style={{ minHeight: item.span === 'tall' ? 480 : 240, borderRadius: 2 }}
      data-cursor-hover
    >
      {/* Actual image using regular img tag */}
      <motion.img
        src={item.src}
        alt={item.alt}
        animate={{ scale: hovered ? 1.04 : 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: item.objectPosition ?? 'center center',
        }}
      />

      {/* Hover overlay */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0 flex flex-col justify-end p-5"
        style={{ background: 'linear-gradient(to top, rgba(26,22,18,0.75) 0%, transparent 60%)' }}
      >
        {item.caption && (
          <motion.p
            animate={{ y: hovered ? 0 : 8, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="font-sans text-[0.82rem] leading-snug"
            style={{ color: '#F5F0E8' }}
          >
            {item.caption}
          </motion.p>
        )}
        <motion.span
          animate={{ y: hovered ? 0 : 8, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="font-mono text-[0.6rem] tracking-[0.15em] uppercase mt-1"
          style={{ color: '#C4962A' }}
        >
          {item.category}
        </motion.span>
      </motion.div>
    </motion.div>
  )
}

export function GallerySection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { amount: 0.2 })
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all')

  const filtered = activeCategory === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory)

  return (
    <section id="gallery" className="py-36">
      <div className="max-w-[1200px] mx-auto px-12">
        <motion.div ref={headerRef} initial="hidden" animate={headerInView ? 'visible' : 'hidden'} variants={staggerContainer}>
          <SectionLabel>Life</SectionLabel>
          <motion.h2 variants={fadeUp} className="font-serif font-bold leading-[1.05] tracking-[-0.02em]" style={{ fontSize: 'clamp(36px,4.5vw,64px)', color: '#1A1612' }}>
            Beyond the <em className="italic" style={{ color: '#4A433A' }}>code.</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 text-[0.95rem] leading-[1.8] max-w-lg" style={{ color: '#8A7F72' }}>
            Travel, sport, sketching, racing weekends, and everything in between.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mt-8">
            {GALLERY_CATEGORIES.map(cat => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="font-mono text-[0.65rem] tracking-[0.15em] uppercase px-4 py-2"
                style={{
                  borderRadius: 2,
                  border: '0.5px solid',
                  borderColor: activeCategory === cat ? '#C4962A' : 'rgba(26,22,18,0.2)',
                  background: activeCategory === cat ? '#C4962A' : 'transparent',
                  color: activeCategory === cat ? '#F5F0E8' : '#8A7F72',
                  transition: 'all 0.2s ease',
                }}
                data-cursor-hover
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-3 mt-12"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '240px', gridAutoFlow: 'dense' }}
        >
          {filtered.map((item, i) => (
            <GalleryCard key={item.id} item={item} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
