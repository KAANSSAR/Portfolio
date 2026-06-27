'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TIMELINE } from '@/lib/data'
import { staggerContainer, slideFromLeft, slideFromRight, EASE_OUT_EXPO } from '@/lib/variants'
import type { TimelineItem } from '@/types'

function TimelineRow({ item, index }: { item: TimelineItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.25, margin: '0px 0px -40px 0px' })
  // Alternate slide direction for visual interest
  const isEven = index % 2 === 0
  const variants = isEven ? slideFromLeft(0) : slideFromRight(0)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      className="grid gap-x-12"
      style={{ gridTemplateColumns: '140px 1fr' }}
    >
      {/* Year */}
      <div className="font-mono text-[0.72rem] text-ink-faint text-right pt-1 tracking-wider whitespace-nowrap pr-4">
        {item.year}
      </div>

      {/* Content */}
      <motion.div
        whileHover={{ x: 6 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative pb-12 pl-16"
      >
        {/* Dot */}
        <motion.div
          whileHover={{ scale: 1.5, backgroundColor: '#C4962A', borderColor: '#C4962A' }}
          transition={{ duration: 0.25 }}
          className="absolute rounded-full"
          style={{
            left: -4,
            top: 6,
            width: 8,
            height: 8,
            background: '#F5F0E8',
            border: '1.5px solid #8A7F72',
          }}
        />

        <div className="font-mono text-[0.62rem] tracking-[0.15em] uppercase text-gold mb-1.5">
          {item.tag}
        </div>
        <div className="font-serif text-[1.25rem] font-medium text-ink mb-1 leading-snug">
          {item.title}
        </div>
        <div className="text-[0.8rem] text-ink-faint mb-3">{item.company}</div>
        <div className="text-[0.88rem] leading-[1.75] text-ink-muted max-w-lg">{item.desc}</div>
      </motion.div>
    </motion.div>
  )
}

export function TimelineSection() {
  const ref = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { amount: 0.2 })

  // Scroll-driven gold line draw
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end center'],
  })
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="experience" className="max-w-[1200px] mx-auto px-12 py-36">
      {/* Header */}
      <motion.div
        ref={headerRef}
        initial="hidden"
        animate={headerInView ? 'visible' : 'hidden'}
        variants={staggerContainer}
      >
        <SectionLabel>Experience</SectionLabel>
        <div className="mb-20">
          <SectionHeading line1="Where I've" line2="been." />
        </div>
      </motion.div>

      {/* Timeline body */}
      <div ref={ref} className="relative">
        {/* Static grey track */}
        <div
          className="absolute"
          style={{
            left: 140,
            top: 0,
            bottom: 0,
            width: '0.5px',
            background: 'rgba(26,22,18,0.1)',
          }}
        />
        {/* Animated gold fill */}
        <motion.div
          style={{
            position: 'absolute',
            left: 140,
            top: 0,
            width: '0.5px',
            transformOrigin: 'top',
            scaleY: lineScaleY,
            background: '#C4962A',
          }}
          className="absolute"
        />

        {TIMELINE.map((item, i) => (
          <TimelineRow key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}
