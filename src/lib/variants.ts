import type { Variants } from 'framer-motion'

export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: [0.4, 0, 1, 1] },
  },
}

export const fadeUpChild = (i: number): Variants => ({
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.3, delay: i * 0.04 },
  },
})

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
}

export const clipReveal: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
  visible: {
    clipPath: 'inset(0 0 0% 0)',
    opacity: 1,
    transition: { duration: 0.85, ease: EASE_OUT_EXPO },
  },
  exit: {
    clipPath: 'inset(0 0 100% 0)',
    opacity: 0,
    transition: { duration: 0.4 },
  },
}

export const slideFromLeft = (i = 0): Variants => ({
  hidden: { opacity: 0, x: -48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    x: -24,
    transition: { duration: 0.3 },
  },
})

export const slideFromRight = (i = 0): Variants => ({
  hidden: { opacity: 0, x: 48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    x: 24,
    transition: { duration: 0.3 },
  },
})

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.65, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.3 },
  },
}
