# Kanishka Sarkar — Portfolio

Built with **Next.js 14 · TypeScript · Tailwind CSS · Framer Motion**

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel (one click)

```bash
npm install -g vercel
vercel
```

Or push to GitHub and connect the repo at [vercel.com](https://vercel.com) — it auto-detects Next.js.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Page assembly
│   └── globals.css         # Global styles + Tailwind
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── MarqueeStrip.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── TimelineSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   └── ContactSection.tsx
│   └── ui/
│       ├── CustomCursor.tsx
│       ├── ResumeBtn.tsx
│       ├── SectionLabel.tsx
│       └── SectionHeading.tsx
│
├── hooks/
│   ├── useTyping.ts        # Typewriter animation
│   ├── useCounter.ts       # Animated number counter
│   └── useMagneticCursor.ts
│
├── lib/
│   ├── data.ts             # ALL content lives here — edit this
│   ├── variants.ts         # Shared Framer Motion variants
│   └── utils.ts            # cn() utility
│
└── types/
    └── index.ts            # TypeScript interfaces
```

## Customisation

**All content** is in `src/lib/data.ts` — change your name, roles, timeline entries, projects, email, resume URL, and social links there. Nothing else needs touching.

**Resume** — drop your PDF into `public/resume.pdf` (it's already wired up to the download button).

**Colours** — edit `tailwind.config.ts` and the CSS variables in `globals.css`.

---

## Animation Features

| Feature | Implementation |
|---|---|
| Bidirectional scroll reveals | `useInView` with `animate={inView ? 'visible' : 'hidden'}` |
| Timeline gold line draw | `useScroll` + `useTransform` → `scaleY` |
| 3D project card tilt | `useMotionValue` + `useSpring` → `rotateX/Y` |
| Animated stat counters | Custom `useCounter` hook, resets on scroll out |
| Parallax hero lettermark | `useScroll` + `useTransform` → `y` |
| Word-by-word name reveal | Clipped `motion.span` with staggered delay |
| Magnetic cursor | RAF-based smooth lerp, custom `useMagneticCursor` |
| Typing animation | Custom `useTyping` hook |
| Marquee strip | `animate={{ x }}` with `repeat: Infinity` |
| Sliding resume button | `animate={{ x }}` fill sweep |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion 11
- **Fonts**: Playfair Display · DM Sans · DM Mono (Google Fonts)
