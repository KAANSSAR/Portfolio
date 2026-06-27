'use client'

import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/variants'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  line1: string
  line2: string
  light?: boolean
  accentColor?: string
  className?: string
}

export function SectionHeading({
  line1,
  line2,
  light = false,
  accentColor,
  className,
}: SectionHeadingProps) {
  return (
    <motion.h2
      variants={fadeUp}
      className={cn(
        'font-serif font-bold leading-[1.05] tracking-[-0.02em]',
        'text-[clamp(36px,4.5vw,64px)]',
        light ? 'text-cream' : 'text-ink',
        className
      )}
    >
      {line1}
      {line2 && (
        <>
          <br />
          <em
            className="italic"
            style={{ color: accentColor ?? (light ? 'var(--gold-light, #E8C97A)' : 'var(--ink-muted, #4A433A)') }}
          >
            {line2}
          </em>
        </>
      )}
    </motion.h2>
  )
}