'use client'

import { motion } from 'framer-motion'
import { MARQUEE_ITEMS } from '@/lib/data'

export function MarqueeStrip() {
  // Triple the items so the loop is seamless
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div className="bg-ink overflow-hidden py-[0.9rem]">
      <motion.div
        animate={{ x: [0, '-33.33%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="flex whitespace-nowrap"
      >
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="font-mono text-[0.63rem] tracking-[0.2em] uppercase text-cream/40 px-8">
              {item}
            </span>
            <span className="text-gold/60 text-xs">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
