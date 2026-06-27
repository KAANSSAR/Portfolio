import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        'cream-dark': '#EDE7D9',
        paper: '#FDFAF4',
        ink: '#1A1612',
        'ink-muted': '#4A433A',
        'ink-faint': '#8A7F72',
        gold: '#C4962A',
        'gold-light': '#E8C97A',
        rust: '#9B4C2E',
        sage: '#5A6B52',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': 'clamp(56px, 10vw, 140px)',
        'display-lg': 'clamp(36px, 5vw, 72px)',
        'display-md': 'clamp(28px, 3.5vw, 48px)',
      },
    },
  },
  plugins: [],
}

export default config
