import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Kanishka Sarkar — Software Engineer & Aspiring Quant Trader',
  description:
    'Final-year Software Engineering (Honours) student at the University of Sydney. Builder of Stratum, Later Lah, and multi-agent AI systems. Targeting Flow Traders HK.',
  openGraph: {
    title: 'Kanishka Sarkar',
    description: 'Software Engineer & Aspiring Quant Trader based in Sydney, AU.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
