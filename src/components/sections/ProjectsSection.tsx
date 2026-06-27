'use client'

import { useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PROJECTS } from '@/lib/data'
import { staggerContainer, fadeUp, EASE_OUT_EXPO } from '@/lib/variants'
import type { Project } from '@/types'

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.15, margin: '0px 0px -30px 0px' })

  // 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-80, 80], [5, -5]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [-80, 80], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  })

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  function onMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.7,
            delay: (index % 3) * 0.1,
            ease: EASE_OUT_EXPO,
          },
        },
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 800,
      }}
      className="relative overflow-hidden group"
      data-cursor-hover
    >
      {/* Bottom border sweep on hover */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="absolute bottom-0 left-0 right-0 bg-gold"
        style={{ height: 2, transformOrigin: 'left' }}
      />

      {/* Background hover tint */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-0 bg-paper pointer-events-none"
      />

      <div className="relative p-10">
        <div className="font-mono text-[0.62rem] text-ink-faint tracking-widest mb-8">
          {project.num} / 06
        </div>

        {/* Arrow */}
        <motion.div
          whileHover={{ x: 4, y: -4, color: '#C4962A' }}
          transition={{ duration: 0.25 }}
          className="absolute top-10 right-10 text-lg text-ink-faint"
        >
          ↗
        </motion.div>

        <div
          className="font-serif font-bold text-ink leading-tight mb-4"
          style={{ fontSize: '1.35rem' }}
        >
          {project.name}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tech.map(t => (
            <span
              key={t}
              className="font-mono text-[0.58rem] tracking-wider uppercase px-2 py-1 text-ink-muted"
              style={{ border: '0.5px solid rgba(26,22,18,0.18)', borderRadius: 2 }}
            >
              {t}
            </span>
          ))}
        </div>

        <p className="text-[0.86rem] leading-[1.75] text-ink-muted">{project.desc}</p>

        {project.url && (
          <motion.a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ x: 4 }}
            className="inline-flex items-center gap-2 mt-6 font-mono text-[0.65rem] tracking-widest uppercase text-gold no-underline"
            data-cursor-hover
          >
            View project <span>→</span>
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}

export function ProjectsSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { amount: 0.2 })

  return (
    <section id="projects" className="py-36 overflow-hidden">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-12">
        <motion.div
          ref={headerRef}
          initial="hidden"
          animate={headerInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          <SectionLabel>Projects</SectionLabel>
          <SectionHeading line1="What I've built." line2="" />
        </motion.div>
      </div>

      {/* Grid — full width, no side padding */}
      <div
        className="mt-16 grid"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'rgba(26,22,18,0.1)',
          borderTop: '0.5px solid rgba(26,22,18,0.1)',
          borderBottom: '0.5px solid rgba(26,22,18,0.1)',
        }}
      >
        {PROJECTS.map((p, i) => (
          <div key={i} style={{ background: '#F5F0E8' }}>
            <ProjectCard project={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  )
}
