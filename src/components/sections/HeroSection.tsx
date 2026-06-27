'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTyping } from '@/hooks/useTyping'
import { SITE_CONFIG } from '@/lib/data'
import { EASE_OUT_EXPO } from '@/lib/variants'

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const typedText = useTyping(SITE_CONFIG.roles)

  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 700], [0, 140])
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const contentY = useTransform(scrollY, [0, 400], [0, -60])

  const nameWords = ['Kanishka', 'Sarkar']

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      style={{ padding: '0 3rem 5rem' }}
    >
      {/* Parallax background lettermark */}
      <motion.div
        style={{ y: bgY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none font-serif font-black leading-none z-0"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        css-var="true"
      >
        <span
          style={{
            fontSize: 'clamp(180px, 36vw, 500px)',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(26,22,18,0.045)',
          }}
        >
          KS
        </span>
      </motion.div>

      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.5,
        }}
      />

      {/* Main content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-[2]"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
          className="flex items-center gap-4 mb-6 font-mono text-[0.7rem] tracking-[0.2em] uppercase"
          style={{ color: '#C4962A' }}
        >
          <span className="block w-10 h-px bg-gold" />
          {SITE_CONFIG.location} · {SITE_CONFIG.university}
        </motion.div>

        {/* Name — word by word reveal */}
        <h1
          className="font-serif font-black leading-[0.9] tracking-[-0.025em] mb-9"
          style={{ fontSize: 'clamp(56px, 10vw, 140px)' }}
        >
          {nameWords.map((word, i) => (
            <div key={word} className="overflow-hidden block">
              <motion.span
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.5 + i * 0.2,
                  ease: EASE_OUT_EXPO,
                }}
                style={{
                  display: 'block',
                  color: i === 1 ? '#4A433A' : '#1A1612',
                  fontStyle: i === 1 ? 'italic' : 'normal',
                }}
              >
                {word}
              </motion.span>
            </div>
          ))}
        </h1>

        {/* Typing row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="flex items-center gap-6 mb-12"
        >
          <span className="font-mono text-[0.68rem] tracking-[0.15em] uppercase text-ink-faint">
            Currently —
          </span>
          <span
            className="font-serif italic"
            style={{
              fontSize: 'clamp(15px, 1.8vw, 22px)',
              color: '#9B4C2E',
              minWidth: 260,
            }}
          >
            {typedText}
            <span
              className="inline-block align-text-bottom ml-0.5"
              style={{
                width: 2,
                height: '1.1em',
                background: '#9B4C2E',
                animation: 'blink 0.8s step-end infinite',
              }}
            />
          </span>
        </motion.div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.7, ease: EASE_OUT_EXPO }}
          className="flex items-center gap-8"
        >
          <a
            href="#about"
            data-cursor-hover
            className="font-mono text-[0.72rem] tracking-[0.15em] uppercase text-ink border-b border-ink/30 pb-0.5 no-underline hover:border-ink transition-colors duration-200"
          >
            Explore
          </a>
          <a
            href="#contact"
            data-cursor-hover
            className="font-mono text-[0.72rem] tracking-[0.15em] uppercase text-ink-faint no-underline hover:text-ink transition-colors duration-200"
          >
            Get in touch →
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 0.6 }}
        className="absolute bottom-10 right-12 flex flex-col items-center gap-2 z-[2]"
        style={{ color: '#8A7F72' }}
      >
        <motion.div
          animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.7, 1],
          }}
          style={{
            width: 1,
            height: 60,
            background: 'linear-gradient(to bottom, transparent, #8A7F72)',
            transformOrigin: 'top',
          }}
        />
        <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl' }}>
          Scroll
        </span>
      </motion.div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
