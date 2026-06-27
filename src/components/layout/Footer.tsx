import { SITE_CONFIG } from '@/lib/data'

export function Footer() {
  return (
    <footer
      className="flex items-center justify-between px-12 py-8"
      style={{ borderTop: '0.5px solid rgba(26,22,18,0.1)' }}
    >
      <span className="font-mono text-[0.62rem] tracking-widest text-ink-faint">
        © {new Date().getFullYear()} {SITE_CONFIG.name}
      </span>
      <span className="font-serif italic text-[0.9rem] text-ink-muted">
        {SITE_CONFIG.location}
      </span>
    </footer>
  )
}
