import { CustomCursor } from '@/components/ui/CustomCursor'
import { Navbar } from '@/components/layout/Navbar'
import { MarqueeStrip } from '@/components/layout/MarqueeStrip'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { TimelineSection } from '@/components/sections/TimelineSection'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { ContactSection } from '@/components/sections/ContactSection'

function Divider() {
  return (
    <div
      style={{
        height: '0.5px',
        background: 'rgba(26,22,18,0.1)',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
      }}
    />
  )
}

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>
        <HeroSection />
        <MarqueeStrip />
        <Divider />
        <AboutSection />
        <Divider />
        <TimelineSection />
        <Divider />
        <ProjectsSection />
        <Divider />
        <GallerySection />
        <Divider />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
