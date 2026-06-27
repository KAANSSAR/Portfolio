'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ResumeBtn } from '@/components/ui/ResumeBtn'
import { ContactForm } from '@/components/sections/ContactForm'
import { SITE_CONFIG, SOCIAL_LINKS } from '@/lib/data'
import { fadeUp, staggerContainer } from '@/lib/variants'

export function ContactSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.2 })

  return (
    <section id="contact" style={{ background: '#1A1612', color: '#F5F0E8', padding: '9rem 3rem' }}>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="max-w-[1200px] mx-auto"
      >
        {/* Top row — heading + links */}
        <div className="grid gap-24" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'center' }}>
          <div>
            <SectionLabel light>Contact</SectionLabel>
            <SectionHeading line1="Let's talk" line2="seriously." light />
            <motion.p
              variants={fadeUp}
              className="text-[0.97rem] leading-[1.8] mt-6"
              style={{ color: 'rgba(245,240,232,0.55)' }}
            >
              Whether it&apos;s trading, technology, or something I haven&apos;t thought of yet — I&apos;m
              always open to interesting conversations.
            </motion.p>
          </div>

          <motion.div variants={staggerContainer} className="flex flex-col gap-8">
            <motion.div variants={fadeUp}>
              <div className="font-mono text-[0.62rem] tracking-[0.18em] uppercase mb-3" style={{ color: 'rgba(245,240,232,0.3)' }}>
                Email
              </div>
              <motion.a
                href={`mailto:${SITE_CONFIG.email}`}
                whileHover={{ x: 6, color: '#F5F0E8' }}
                transition={{ duration: 0.2 }}
                className="font-serif italic block no-underline pb-2"
                style={{ fontSize: '1.25rem', color: '#E8C97A', borderBottom: '0.5px solid rgba(245,240,232,0.12)' }}
                data-cursor-hover
              >
                {SITE_CONFIG.email}
              </motion.a>
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-6 flex-wrap">
              {SOCIAL_LINKS.map(link => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2, color: '#F5F0E8' }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-[0.7rem] tracking-[0.12em] uppercase no-underline"
                  style={{ color: 'rgba(245,240,232,0.4)' }}
                  data-cursor-hover
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="font-mono text-[0.62rem] tracking-[0.18em] uppercase mb-4" style={{ color: 'rgba(245,240,232,0.3)' }}>
                Resume
              </div>
              <ResumeBtn dark />
            </motion.div>
          </motion.div>
        </div>

        {/* Contact form below */}
        <ContactForm />
      </motion.div>
    </section>
  )
}