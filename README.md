# Kanishka Sarkar | Portfolio

A personal portfolio built as a single, heavily animated scroll experience rather than a template. Final-year Software Engineering (Honours) student at the University of Sydney, focused on agentic AI systems and quantitative finance.

Built with Next.js 15, TypeScript, Tailwind CSS, Three.js, Framer Motion, and GSAP.

---

## About

This site showcases my work across three areas:

- **Software engineering**: a production agentic AI system built during a TCS Garage internship, a cross-platform .NET MAUI system for Hanlon Industries, and CattleScanner, a computer-vision measurement tool (91.3% mAP@50) built for SOFT3888.
- **Quantitative finance**: Stratum (an NSE500 market analytics engine), an Options Pricing Engine (Black-Scholes, Binomial Trees, Monte Carlo), and Cardinal, a Bloomberg-terminal-style equity research platform with a multi-agent AI analyst team.
- **Research & writing**: long-form notes on tail risk, Hawkes process order flow, autodiff Greeks, and American put early-exercise boundaries, (and more coming soon) written up with LaTeX and interactive charts.

Full details, timeline, and case studies are on the site itself.

## Features

The interesting part of this repo isn't really the portfolio content. It's the amount of custom interaction packed into what looks like a simple page:

- **Interactive hero**: a canvas signature built from actual glyph-pixel sampling that assembles from particles, next to a draggable 3D WebGL globe (Three.js) pinned with real coordinates for five cities
- **A Rubik's cube that never stops spinning**: full 3D CSS-transform cube, each face showing a live stock/crypto ticker, cached and rate-limited against a real market data API
- **A tiny astronaut** that chases your cursor around the page, with typed-out one-liners, and hands off to its own scroll-driven version through the Experience timeline
- **Scroll-driven 3D career timeline**: a self-drawing thread with camera movement tied to scroll position, not just fade-in-on-scroll
- **Per-project animated "data views"**: each project in the Projects section reveals a different generative background on hover (currency rain, matrix code rain, a scanning-box effect, glitch animations) tied to what that project actually does
- **A real, working blog and research-notes system**: Supabase-backed, with a password-gated in-page editor, LaTeX equation rendering, and code blocks
- **Full dark/light theme system**: swapped via the View Transitions API for a circular reveal animation, not just a class toggle
- **A glassmorphic contact form**: EmailJS-backed, with an eye-tracking send button and a hold-to-confirm résumé download

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 15 (App Router), TypeScript, Turbopack |
| **Styling** | Tailwind CSS |
| **Animation** | Framer Motion, GSAP, raw Three.js (WebGL) |
| **Backend** | Supabase (Postgres + Storage), Next.js Route Handlers |
| **Other** | EmailJS, KaTeX, Twelve Data (market data) |

## Getting Started

### Prerequisites

- Node.js 18.18+
- npm

### Installation

```bash
git clone https://github.com/KAANSSAR/Portfolio.git
cd Portfolio
npm install
```

### Environment variables

```bash
cp .env.local.example .env.local
```

The site runs and looks complete with `.env.local` left blank. Nothing crashes, the design and content are fully there. What each variable unlocks:

| Variable | Unlocks |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Blog posts and research notes loading from the database |
| `BLOG_EDITOR_PASSWORD` / `BLOG_SESSION_SECRET` / `SUPABASE_SERVICE_ROLE_KEY` | The in-page content editor (server-side gated, see comments in `.env.local.example`) |
| `TWELVE_DATA_API_KEY` | Live prices on the cube's ticker faces (falls back to static state without it) |
| `NEXT_PUBLIC_EMAILJS_*` | The contact form, already defaults to a working configuration |

### Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm run start   # production build
```

## Project Structure

```
src/app/                 Routes, layout, and API route handlers (src/app/api/)
src/components/          Global chrome: cursor, nav, theme toggle, 3D logo
src/components/sections/ One file per page section (Hero, About, Experience, ...)
src/components/ui/       Interactive widgets (globe, cube, carousels, editors)
src/context/             Theme state
src/lib/                 Content, Supabase clients, auth helpers
public/                  Images, audio, video, résumé, research chart assets
```

## Contact

- **Email**: kanishka.sarkar@sydney.edu.au
- **LinkedIn**: [linkedin.com/in/kanishka-sarkar](https://linkedin.com/in/kanishka-sarkar)
- **GitHub**: [@KAANSSAR](https://github.com/KAANSSAR)

---

© 2026 Kanishka Sarkar. Site design and code are free to reference for learning; personal content (résumé, photos, write-ups) is not licensed for reuse.
