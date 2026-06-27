'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SITE_CONFIG } from '@/lib/data'

interface ResumeBtnProps {
  dark?: boolean
}

export function ResumeBtn({ dark = false }: ResumeBtnProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={SITE_CONFIG.resumeUrl}
      download
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor-hover
      className="inline-flex items-center relative overflow-hidden"
      style={{
        height: 52,
        border: `0.5px solid ${dark ? 'rgba(245,240,232,0.25)' : 'rgba(26,22,18,0.3)'}`,
        borderRadius: 2,
        textDecoration: 'none',
      }}
    >
      {/* Sliding fill */}
      <motion.div
        animate={{ x: hovered ? 0 : '-100%' }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        className="absolute inset-0 bg-gold pointer-events-none"
        style={{ right: 52 }}
      />
      {/* Label */}
      <span
        className="relative z-10 font-mono text-[0.72rem] tracking-[0.15em] uppercase whitespace-nowrap px-8"
        style={{
          color: hovered ? '#1A1612' : dark ? '#F5F0E8' : '#1A1612',
          transition: 'color 0.35s ease',
        }}
      >
        Download CV
      </span>
      {/* Icon box */}
      <motion.div
        animate={{ y: hovered ? 3 : 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gold flex items-center justify-center flex-shrink-0"
        style={{ width: 52, height: 52, fontSize: '1.1rem' }}
      >
        ↓
      </motion.div>
    </a>
  )
}
