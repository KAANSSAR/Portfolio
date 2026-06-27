'use client'

import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/variants'
import { cn } from '@/lib/utils'

interface SectionLabelProps {
  children: React.ReactNode
  light?: boolean
  className?: string
}

export function SectionLabel({ children, light = false, className }: SectionLabelProps) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'font-mono text-[0.68rem] tracking-[0.22em] uppercase flex items-center gap-4 mb-12',
        light ? 'text-cream/35' : 'text-ink-faint',
        className
      )}
    >
      {children}
      <span
        className={cn(
          'flex-1 h-px max-w-[80px]',
          light ? 'bg-cream/15' : 'bg-ink/15'
        )}
      />
    </motion.div>
  )
}
