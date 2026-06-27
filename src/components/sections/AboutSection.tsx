'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useCounter } from '@/hooks/useCounter'
import { ABOUT_PARAGRAPHS, STATS } from '@/lib/data'
import { fadeUp, staggerContainer } from '@/lib/variants'
import type { StatItem } from '@/types'

function StatRow({ stat }: { stat: StatItem }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.5 })
  const count = useCounter(stat.numericValue ?? 0, inView)
  const display = stat.numericValue !== undefined ? `${count}${stat.suffix ?? ''}` : stat.value

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="flex items-baseline gap-6 py-7"
      style={{ borderBottom: '0.5px solid rgba(26,22,18,0.1)' }}
    >
      <div
        className="font-serif font-bold leading-none"
        style={{ fontSize: '2.8rem', color: '#1A1612', minWidth: 90 }}
      >
        {display}
      </div>
      <div className="font-sans text-[0.82rem] leading-[1.55] text-ink-faint">
        {stat.label}
      </div>
    </motion.div>
  )
}

export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.1, margin: '0px 0px -40px 0px' })

  return (
    <section id="about" className="max-w-[1200px] mx-auto px-12 py-36">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={staggerContainer}
      >
        <SectionLabel>About</SectionLabel>

        <div className="grid gap-24" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
          {/* Left — text */}
          <div>
            <SectionHeading line1="Building things" line2="that matter." />

            <div className="mt-10 space-y-5">
              {ABOUT_PARAGRAPHS.map((p, i) => (
                <motion.p
                  key={i}
                  variants={fadeUp}
                  className="text-[0.97rem] leading-[1.85] text-ink-muted"
                >
                  {p}
                </motion.p>
              ))}
            </div>

            {/* Skill tags */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-2">
              {['Python', 'TypeScript', 'React Native', 'Next.js', '.NET MAUI', 'Multi-Agent AI', 'Quant Finance'].map(skill => (
                <span
                  key={skill}
                  className="font-mono text-[0.6rem] tracking-[0.1em] uppercase px-3 py-1.5"
                  style={{
                    border: '0.5px solid rgba(26,22,18,0.2)',
                    borderRadius: 2,
                    color: '#4A433A',
                  }}
                >
                  {skill}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — stats */}
          <motion.div
            variants={staggerContainer}
            style={{ borderTop: '0.5px solid rgba(26,22,18,0.1)' }}
          >
            {STATS.map((stat, i) => (
              <StatRow key={i} stat={stat} />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
