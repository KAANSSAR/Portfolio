'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NAV_LINKS, SITE_CONFIG } from '@/lib/data'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{
        padding: scrolled ? '1rem 3rem' : '1.6rem 3rem',
        background: scrolled ? 'rgba(245,240,232,0.93)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled
          ? '0.5px solid rgba(26,22,18,0.1)'
          : '0.5px solid transparent',
        transition: 'padding 0.4s ease, background 0.4s ease, border-color 0.4s ease',
      }}
    >
      <a
        href="#"
        className="font-serif font-bold text-[1.05rem] text-ink no-underline tracking-wide"
        data-cursor-hover
      >
        {SITE_CONFIG.initials}
      </a>

      <ul className="flex gap-10 list-none">
        {NAV_LINKS.map(link => (
          <li key={link.label}>
            <motion.a
              href={link.href}
              whileHover={{ y: -2, color: '#1A1612' }}
              transition={{ duration: 0.2 }}
              className="font-mono text-[0.72rem] tracking-[0.12em] uppercase no-underline"
              style={{ color: '#8A7F72' }}
              data-cursor-hover
            >
              {link.label}
            </motion.a>
          </li>
        ))}
      </ul>
    </motion.nav>
  )
}
