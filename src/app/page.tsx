import ThemeRoot from '@/components/ThemeRoot';
import PortfolioChrome from '@/components/PortfolioChrome';
import Hero from '@/components/sections/Hero';
import Marquee from '@/components/sections/Marquee';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Projects from '@/components/sections/Projects';
import QuantLab from '@/components/sections/QuantLab';
import Blog from '@/components/sections/Blog';
import Gallery from '@/components/sections/Gallery';
import Contact from '@/components/sections/Contact';

export default function Home() {
  return (
    <ThemeRoot>
      <PortfolioChrome />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <Marquee />
        <About />
        <Experience />
        <Projects />
        <QuantLab />
        <Blog />
        <Gallery />
        <Contact />
      </div>
    </ThemeRoot>
  );
}
