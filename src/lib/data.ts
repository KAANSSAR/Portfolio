// Central content hub, all site copy lives here.
// Ported from Portfolio Rebuild.dc.html's SITE / NAV_LINKS / ABOUT_PARAGRAPHS / etc.

export const SITE = {
  name: 'Kanishka Sarkar',
  initials: 'KS',
  location: 'Sydney, AU',
  university: 'University of Sydney',
  email: 'kanishka.sarkar@sydney.edu.au',
  resumeUrl: '/Kanishka_Sarkar_Resume.pdf',
  roles: [
    'Software Engineer (Honours)',
    'Focused on the Asian markets',
    'Half marathon finisher',
    'ML & Agentic AI Engineer',
  ],
};

export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Quant Lab', href: '#quant-lab' },
  { label: 'Blog', href: '#blog' },
  { label: 'Life', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

export const MARQUEE_ITEMS = [
  'Software Engineering',
  'Quantitative Finance',
  'Multi-Agent AI',
  'Agentic AI Systems',
  'TCS Garage',
  'NSE500 Analytics',
  'University of Sydney',
  'Options Pricing',
  'Stratum',
  'Half Marathon',
  'Computer Vision',
];

export const ABOUT_PARAGRAPHS = [
  "I'm a final-year Software Engineering (Honours) student at the University of Sydney. I like building things where technology and markets meet. I'm particularly interested in the Asian markets at the moment, but I also keep track of the European and American markets.",
  "I've built production agentic AI systems at TCS Garage and a cross-platform production tracking system for Hanlon Industries. On the markets side, I built Stratum, a momentum engine for the NSE 500, an Options Pricing Engine with Black-Scholes, binomial trees and Monte Carlo, and Cardinal, an equity research terminal with valuation, signals, backtests and four AI analysts. My honours thesis, now submitted and presented, is a planning engine that repairs engineering degree plans at USYD and UTS and checks that every plan it gives follows the rules.",
  "Outside of code: sketching (@art_by_kaanssar), football, padel and long-distance running.",
];

export const SKILLS = ['Python', 'TypeScript', 'React Native', 'Next.js', '.NET MAUI', 'Multi-Agent AI', 'Quant Finance'];

export const GLITCH_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FF8C42', '#5FD068', '#FF5DA2'];

export const SHORT_ROLES = [
  'Software Engineer',
  'Aspiring Trader',
  'Building Full-Stack Products',
  'Exploring Agents & AI',
  'Music, Books, Sport & Sketching',
];

export type Stat = { value: string; numericValue?: number; suffix?: string; noSeparator?: boolean; decimals?: number; label: string };
export const STATS: Stat[] = [
  { value: '91', numericValue: 91, suffix: '%', label: 'mAP@50 on YOLO cattle measurement model (SOFT3888)' },
  { value: '200', numericValue: 200, suffix: '+', label: 'First-year engineering students mentored per semester' },
  { value: '500+', numericValue: 500, suffix: '+', label: 'Securities tracked in Stratum NSE500 momentum engine' },
  { value: '93.8%', numericValue: 93.8, suffix: '%', decimals: 1, label: 'Of degree-plan repairs proved to be the shortest possible (Honours thesis)' },
  { value: '4', numericValue: 4, suffix: '', label: 'Agentic AI analysts across 3 markets: US, India, Europe (Cardinal)' },
  { value: '2022', numericValue: 2022, noSeparator: true, label: 'USYD International Student Award recipient' },
];

export type TimelineEntry = { year: string; tag: string; title: string; company: string; desc: string };
export const TIMELINE: TimelineEntry[] = [
  { year: 'Mar 2026 – Now', tag: 'Student Representation', title: 'Final Year Student Representative, Software Engineering', company: 'Faculty of Engineering · University of Sydney', desc: 'Elected representative for the final-year Software Engineering cohort, advocating for student interests on curriculum and program quality.' },
  { year: '2025 – Now', tag: 'Honours Thesis', title: 'AI-Powered Academic Decision Support', company: 'University of Sydney · Dr. Nicholas Tse', desc: 'Multi-agent CLI system for USYD/UNSW degree navigation. Exploring agentic AI pipelines for complex academic planning workflows.' },
  { year: 'Nov 2024 – Now', tag: 'Mentorship', title: 'Engineering Lead Mentor', company: 'ENGO Peer Mentoring Program · University of Sydney', desc: 'Supervising peer mentors providing academic guidance and transition support to 200+ first-year engineering students every semester.' },
  { year: 'Jul 2025 – Jul 2026', tag: 'Student Society', title: 'Sponsorship Team Member', company: 'Sydney UAV Engineering (SUAVE)', desc: 'Securing industry partnerships and sponsorships for UAV engineering projects within the SUAVE student society.' },
  { year: 'Dec 2025 – Feb 2026', tag: 'ML/Agentic AI Internship', title: 'ML/Agentic AI Consultant Intern', company: 'Tata Consultancy Services (TCS) · Garage Team · BFSI Client', desc: 'Delivered a full-stack agentic AI solution with a chat interface, ground-truth admin dashboard, and an internal agent library adopted across TCS teams. Built to mitigate hallucinations in enterprise knowledge applications using LangChain, LangGraph, RAG, and parallel agent orchestration.' },
  { year: 'Jun – Aug 2025', tag: 'Consulting Engineering Internship', title: 'Consulting Engineer Intern', company: 'Hanlon Industries', desc: 'Served as Client Liaison between stakeholders and engineering team, leading requirement gathering and development prioritisation, while building and optimising a cross-platform .NET MAUI production tracking system with Azure SQL.' },
  { year: 'Aug – Nov 2025', tag: 'Capstone Project', title: 'Lead AI Trainer & GUI Developer, CattleScanner', company: 'SOFT3888 · Client: SOLES USYD', desc: 'Primary YOLO v8 model trainer and lead GUI developer on an automated cattle hip height measurement system using DepthAI and OpenCV. Achieved 91.3% mAP@50 and sub-5cm accuracy through iterative model validation.' },
  { year: 'Mar – Nov 2025', tag: 'Faculty Governance', title: 'Student Representative, Education Committee', company: 'Faculty of Engineering · University of Sydney (AY2025)', desc: '1 of 6 elected representatives on the Faculty governance body overseeing academic strategy and curriculum development for AY2025.' },
  { year: 'Mar – Sep 2025', tag: 'Student Society', title: 'International Representative', company: 'Sydney Computing Society (SYNCS)', desc: "Represented international students through workshops, helpdesks, and hackathons. Contributed to organising SYNCSHACK 2025, NSW's largest hackathon with 300+ participants." },
  { year: 'Mar 2024 – Jul 2025', tag: 'Student Society · 1st Runner Up Nationals 2024', title: 'Executive Committee: VP Events & VP External Affairs', company: 'Enactus Sydney', desc: 'Held two executive roles across the tenure: VP Events then VP External Affairs. Won 1st Runner Up at Enactus Nationals 2024 in Melbourne (July 2024) and presented Amptex at SXSW Sydney 2024.' },
  { year: '2022', tag: 'University', title: 'B.Eng (Hons), Software Engineering', company: 'University of Sydney · USYD International Student Award · Graduating Dec 2026', desc: 'Coursework spanning AI/ML, systems, cybersecurity, networks, databases, OOP, and quantitative methods. Recipient of the USYD International Student Award.' },
];

export type Project = { num: string; name: string; tech: string[]; desc: string; url?: string };
export const PROJECTS: Project[] = [
  { num: '01', name: 'Cardinal', tech: ['Python', 'FastAPI', 'React', 'TypeScript', 'Gemini AI'], desc: 'Bloomberg-terminal-style equity analysis platform: DCF valuation, quant signals, backtesting, and a multi-agent AI research team.', url: 'https://github.com/KAANSSAR/Cardinal' },
  { num: '02', name: 'Stratum', tech: ['Python', 'Pandas', 'Parquet', 'NumPy', 'YAML'], desc: 'NSE500 Quantitative Market Analytics Engine.', url: 'https://github.com/KAANSSAR/Stratum' },
  { num: '03', name: 'Options Pricing Engine', tech: ['Python', 'Black-Scholes', 'Binomial Tree', 'Monte Carlo', 'Streamlit'], desc: 'Quantitative options pricing engine with an interactive Streamlit dashboard.', url: 'https://github.com/KAANSSAR/Options-Pricing-Engine' },
  { num: '04', name: 'Agentic AI · TCS Enterprise', tech: ['Python', 'LangChain', 'LangGraph', 'RAG', 'OpenAI', 'Claude API'], desc: 'Production-grade agentic AI system to mitigate hallucinations in enterprise knowledge applications.', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7428125043488006144/' },
  { num: '05', name: 'CattleScanner', tech: ['YOLO v8', 'DepthAI', 'OpenCV', 'Python', 'PyQt5'], desc: 'Automated cattle hip height measurement system using DepthAI depth cameras.', url: 'https://github.com/KAANSSAR/CattleScanner' },
  { num: '06', name: 'Honours Thesis', tech: ['Python', 'CP-SAT', 'Ollama', 'Qwen3'], desc: 'Deterministic degree-planning engine for USYD and UTS engineering degrees. Rebuilds a plan after a failed unit, verified clean on 1,497 of 1,497 single-failure repairs, with a thin language-model layer for questions.', url: 'https://github.com/KAANSSAR/honours-thesis' },
  { num: '07', name: 'Shivam Brass · Client Work', tech: ['PHP', 'HTML/CSS', 'JavaScript', 'XAMPP', 'localStorage API'], desc: 'Ground-up commercial site redesign delivering 3 net-new functionalities across 32 product categories.', url: 'https://www.shivambrass.com/' },
  { num: '08', name: 'Job Management App Refactor', tech: ['.NET MAUI', 'C#', 'REST APIs', 'Azure SQL'], desc: "Optimised Hanlon Industries' cross-platform MAUI application by implementing instance tracking automation.", url: 'https://www.linkedin.com/feed/update/urn:li:activity:7358800791308021782/' },
];

export type GalleryCategory = 'events' | 'gym' | 'sketches';
export type GalleryItem = { id: string; src: string; alt: string; caption: string; category: GalleryCategory; tall?: boolean; pos?: string };
export const GALLERY: GalleryItem[] = [
  { id: '1', src: '/images/USYD_PFP.jpg', alt: 'Kanishka Sarkar', caption: 'University of Sydney', category: 'events', tall: true, pos: 'center top' },
  { id: '2', src: '/images/TCS-Group.jpg', alt: 'TCS Garage Team', caption: 'TCS Garage · 1 of 30 selected', category: 'events', pos: 'center center' },
  { id: '3', src: '/images/TCS-VR.jpg', alt: 'TCS VR Experience', caption: 'TCS Innovation Lab', category: 'events', pos: 'center center' },
  { id: '4', src: '/images/SXSW-Presentation.jpg', alt: 'Presenting at SXSW Sydney 2024', caption: 'Presenting Amptex at SXSW Sydney 2024', category: 'events', pos: 'center top' },
  { id: '5', src: '/images/SXSW-Group.jpg', alt: 'Enactus at SXSW Sydney', caption: 'Enactus USYD at SXSW Sydney 2024', category: 'events', pos: 'center center' },
  { id: '6', src: '/images/Enactus-Group.jpg', alt: 'Enactus Nationals 2024', caption: '1st Runner Up · Enactus Nationals 2024, Melbourne', category: 'events', pos: 'center center' },
  { id: '7', src: '/images/HanlonGroup.jpg', alt: 'Hanlon Industries Team', caption: 'Hanlon Industries · Consulting Engineering Internship', category: 'events', pos: 'center center' },
  { id: '8', src: '/images/Undergrad-Panel.jpg', alt: 'Engineering Undergraduate Panel', caption: 'Student Panelist · Faculty Welcome Panel', category: 'events', tall: true, pos: 'center center' },
  { id: '9', src: '/images/DeadliftComp.jpg', alt: 'Deadlift Competition', caption: 'Competition day', category: 'gym', tall: true, pos: 'center center' },
  { id: '10', src: '/images/10kmRun.JPG', alt: '10km Run', caption: 'Training for the half marathon', category: 'gym', tall: true, pos: 'center top' },
  { id: '11', src: '/images/LamineYamal-Sketch.png', alt: 'Lamine Yamal Sketch', caption: 'Lamine Yamal · charcoal sketch', category: 'sketches', pos: 'center top' },
  { id: '12', src: '/images/Levi.png', alt: 'Levi Sketch', caption: 'Levi · @art_by_kaanssar', category: 'sketches', tall: true, pos: 'center top' },
  { id: '13', src: '/images/Nobara-sketch.png', alt: 'Nobara Sketch', caption: 'Nobara · @art_by_kaanssar', category: 'sketches', tall: true, pos: 'center center' },
  { id: '14', src: '/images/SukunaYuji.png', alt: 'Sukuna vs Yuji Sketch', caption: 'Sukuna vs Yuji · @art_by_kaanssar', category: 'sketches', tall: true, pos: 'center center' },
];
export const CATEGORY_LIST: Array<'all' | GalleryCategory> = ['all', 'events', 'gym', 'sketches'];

export type Track = { title: string; artist: string; src: string; art: string };
export const TRACKS: Track[] = [
  { title: 'Anchor', artist: 'Novo Amor', src: '/audio/novo-amor-anchor.mp3', art: '/audio/art-novo-amor-anchor.png' },
  { title: 'Lovers Rock', artist: 'TV Girl', src: '/audio/tv-girl-lovers-rock.mp3', art: '/audio/art-tv-girl-lovers-rock.png' },
  { title: 'The Adults Are Talking', artist: 'The Strokes', src: '/audio/the-strokes-the-adults-are-talking.mp3', art: '/audio/art-strokes-adults-talking.png' },
  { title: 'Glimpse of Us', artist: 'Joji', src: '/audio/joji-glimpse-of-us.mp3', art: '/audio/art-joji-glimpse-of-us.png' },
  { title: 'Birds of a Feather', artist: 'Billie Eilish', src: '/audio/billie-eilish-birds-of-a-feather.mp3', art: '/audio/art-billie-birds-of-a-feather.png' },
  { title: 'Loser', artist: 'Tame Impala', src: '/audio/tame-impala-loser.mp3', art: '/audio/art-tame-impala-loser.png' },
];

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/art_by_kaanssar',
  github: 'https://github.com/KAANSSAR',
  linkedin: 'https://linkedin.com/in/kanishka-sarkar',
};

export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">' +
      '<defs><pattern id="s" width="16" height="16" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">' +
      '<rect width="16" height="16" fill="#1F1B17"/><rect width="8" height="16" fill="#262019"/></pattern></defs>' +
      '<rect width="600" height="400" fill="url(#s)"/>' +
      '<text x="300" y="205" font-family="DM Mono, monospace" font-size="14" letter-spacing="2" fill="#8A7F72" text-anchor="middle">PROJECT SCREENSHOT</text>' +
      '</svg>'
  );

// Theme tokens, ported 1:1 from the LIGHT / DARK constants in the design file.
export type ThemeTokens = {
  bg: string; panel: string; darkPanel: string; ink: string; inkRgb: string;
  inkMuted: string; inkFaint: string; gold: string; goldLight: string; rust: string;
  line: string; dockBg: string; glassBg1: string; glassEdge: string; glassBorder: string;
  glassNoiseOpacity: number;
};
export const THEME: { light: ThemeTokens; dark: ThemeTokens } = {
  light: {
    bg: '#F6F4EF', panel: '#FBFAF7', darkPanel: '#0A0A0A', ink: '#121110', inkRgb: '18,17,16',
    inkMuted: '#45423D', inkFaint: '#6E6A63', gold: '#121110', goldLight: '#F6F4EF', rust: '#121110',
    line: 'rgba(18,17,16,0.12)', dockBg: 'rgba(251,250,247,0.75)', glassBg1: 'rgba(255,255,255,0.55)',
    glassEdge: 'rgba(255,255,255,0.95)', glassBorder: 'rgba(18,17,16,0.08)', glassNoiseOpacity: 0.03,
  },
  dark: {
    bg: '#0A0A0A', panel: '#0A0A0A', darkPanel: '#000000', ink: '#FFFFFF', inkRgb: '255,255,255',
    inkMuted: '#CCCCCC', inkFaint: '#888888', gold: '#FFFFFF', goldLight: '#0A0A0A', rust: '#FFFFFF',
    line: 'rgba(255,255,255,0.14)', dockBg: 'rgba(10,10,10,0.7)', glassBg1: 'rgba(120,120,120,0.22)',
    glassEdge: 'rgba(255,255,255,0.4)', glassBorder: 'rgba(255,255,255,0.22)', glassNoiseOpacity: 0.12,
  },
};
