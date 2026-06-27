interface TimelineItem {
  year: string
  tag: string
  title: string
  company: string
  desc: string
}

interface Project {
  num: string
  name: string
  tech: string[]
  desc: string
  url?: string
}

interface StatItem {
  value: string
  numericValue?: number
  suffix?: string
  label: string
}

interface NavLink {
  label: string
  href: string
}

interface SocialLink {
  label: string
  href: string
}
export const SITE_CONFIG = {
  name: 'Kanishka Sarkar',
  initials: 'KS',
  location: 'Sydney, AU',
  university: 'University of Sydney',
  email: 'kanishko.sarkar@gmail.com',
  phone: '+61 490 931 099',
  resumeUrl: '/resume.pdf',
  roles: [
    'Software Engineer (Honours)',
    'Keen interest in the Financial Markets',
    'Building Stratum & Options Pricing Engines',
    'Currently training for a Half Marathon',
    'ML & Agentic AI Engineer',
  ],
}

export const NAV_LINKS: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Life', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/KAANSSAR' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/kanishka-sarkar' },
  { label: 'Art @art_by_kaanssar', href: 'https://instagram.com/art_by_kaanssar' },
]

export const MARQUEE_ITEMS: string[] = [
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
]

export const ABOUT_PARAGRAPHS: string[] = [
  "I'm a final-year Software Engineering (Honours) student at the University of Sydney, on track for First Class Honours — living at the intersection of technology, markets, and ideas.",
  "My work spans production-grade agentic AI systems at TCS Garage — selected 1 of 30 from ~10,000 applicants — to a cross-platform MAUI production tracking system embedded at Hanlon Industries. I'm currently building Stratum, a quantitative market analytics engine for NSE500 equities, and an Options Pricing Engine implementing Black-Scholes, Binomial Trees, and Monte Carlo simulations.",
  "Outside of code: training for a half marathon, sketching (@art_by_kaanssar), playing poker, and studying market microstructure for a career in quantitative trading.",
]

export const STATS: StatItem[] = [
  { value: '1', numericValue: 1, suffix: ' of 30', label: 'Selected from ~10,000 TCS Garage applicants globally' },
  { value: '91', numericValue: 91, suffix: '%', label: 'mAP@50 on YOLO cattle measurement model (SOFT3888)' },
  { value: '200', numericValue: 200, suffix: '+', label: 'First-year engineering students mentored per semester' },
  { value: '500+', numericValue: 500, suffix: '+', label: 'Securities tracked in Stratum NSE500 momentum engine' },
  { value: '2022',numericValue: 2022, label: 'USYD International Student Award recipient' },
]

export const TIMELINE: TimelineItem[] = [
  {
    year: 'Mar 2026 — Now',
    tag: 'Student Representation',
    title: 'Final Year Student Representative — Software Engineering',
    company: 'Faculty of Engineering · University of Sydney',
    desc: 'Elected representative for the final-year Software Engineering cohort, advocating for student interests on curriculum and program quality.',
  },
  {
    year: '2025 — Now',
    tag: 'Honours Thesis',
    title: 'AI-Powered Academic Decision Support',
    company: 'University of Sydney · Dr. Nicholas Tse',
    desc: 'Multi-agent CLI system for USYD/UNSW degree navigation. Exploring agentic AI pipelines for complex academic planning workflows.',
  },
  {
    year: 'Nov 2024 — Now',
    tag: 'Mentorship',
    title: 'Engineering Lead Mentor',
    company: 'ENGO Peer Mentoring Program · University of Sydney',
    desc: 'Supervising peer mentors providing academic guidance and transition support to 200+ first-year engineering students every semester.',
  },
  {
    year: 'Jul 2025 — Jul 2026',
    tag: 'Student Society',
    title: 'Sponsorship Team Member',
    company: 'Sydney UAV Engineering (SUAVE)',
    desc: 'Securing industry partnerships and sponsorships for UAV engineering projects within the SUAVE student society.',
  },
  {
    year: 'Dec 2025 — Feb 2026',
    tag: 'ML/Agentic AI Internship · 1 of 30 from ~10,000',
    title: 'ML/Agentic AI Consultant Intern',
    company: 'Tata Consultancy Services (TCS) · Garage Team · BFSI Client',
    desc: 'Delivered a full-stack agentic AI solution with a chat interface, ground-truth admin dashboard, and an internal agent library adopted across TCS teams. Built to mitigate hallucinations in enterprise knowledge applications using LangChain, LangGraph, RAG, and parallel agent orchestration.',
  },
  {
    year: 'Jun — Aug 2025',
    tag: 'Consulting Engineering Internship',
    title: 'Consulting Engineer Intern',
    company: 'Hanlon Industries',
    desc: 'Served as Client Liaison between stakeholders and engineering team, leading requirement gathering and development prioritisation, while building and optimising a cross-platform .NET MAUI production tracking system with Azure SQL.',
  },
  {
    year: 'Aug — Nov 2025',
    tag: 'Capstone Project',
    title: 'Lead AI Trainer & GUI Developer — CattleScanner',
    company: 'SOFT3888 · Client: SOLES USYD',
    desc: 'Primary YOLO v8 model trainer and lead GUI developer on an automated cattle hip height measurement system using DepthAI and OpenCV. Achieved 91.3% mAP@50 and sub-5cm accuracy through iterative model validation.',
  },
  {
    year: 'Mar — Nov 2025',
    tag: 'Faculty Governance',
    title: 'Student Representative — Education Committee',
    company: 'Faculty of Engineering · University of Sydney (AY2025)',
    desc: '1 of 6 elected representatives on the Faculty governance body overseeing academic strategy and curriculum development for AY2025.',
  },
  {
    year: 'Mar — Sep 2025',
    tag: 'Student Society',
    title: 'International Representative',
    company: 'Sydney Computing Society (SYNCS)',
    desc: 'Represented international students through workshops, helpdesks, and hackathons. Contributed to organising SYNCSHACK 2025, NSW\'s largest hackathon with 300+ participants.',
  },
  {
    year: 'Mar 2024 — Jul 2025',
    tag: 'Student Society · 1st Runner Up Nationals 2024',
    title: 'Executive Committee — VP Events & VP External Affairs',
    company: 'Enactus Sydney',
    desc: 'Held two executive roles across the tenure — VP Events then VP External Affairs. Won 1st Runner Up at Enactus Nationals 2024 in Melbourne (July 2024) and presented Amptex at SXSW Sydney 2024.',
  },
  {
    year: '2022',
    tag: 'University',
    title: 'B.Eng (Hons) — Software Engineering',
    company: 'University of Sydney · USYD International Student Award · Graduating Dec 2026',
    desc: 'Coursework spanning AI/ML, systems, cybersecurity, networks, databases, OOP, and quantitative methods. Recipient of the USYD International Student Award.',
  },
]

export const PROJECTS: Project[] = [
  {
    num: '01',
    name: 'Stratum',
    tech: ['Python', 'Pandas', 'Parquet', 'NumPy', 'YAML'],
    desc: 'NSE500 Quantitative Market Analytics Engine. Computes return rankings and detects momentum to isolate multi-day trend signals. Modular, YAML-driven architecture with columnar time-series storage enabling reproducible backtesting across 500+ securities.',
    url: 'https://github.com/KAANSSAR/Stratum',
  },
  {
    num: '02',
    name: 'Options Pricing Engine',
    tech: ['Python', 'Black-Scholes', 'Binomial Tree', 'Monte Carlo', 'Streamlit'],
    desc: 'Quantitative options pricing engine implementing three core models — Black-Scholes analytical solution, Binomial Tree discrete approximation, and Monte Carlo simulation — with an interactive Streamlit dashboard for real-time parameter exploration.',
    url: 'https://github.com/KAANSSAR/Options-Pricing-Engine',
  },
  {
    num: '03',
    name: 'Agentic AI — TCS Enterprise',
    tech: ['Python', 'LangChain', 'LangGraph', 'RAG', 'OpenAI', 'Claude API'],
    desc: 'Production-grade agentic AI system to mitigate hallucinations in enterprise knowledge applications. Orchestrates parallel agents against a curated ground-truth database, embedding automated quality gates into the AI pipeline. Internal agent library adopted across TCS teams.',
  },
  {
    num: '04',
    name: 'CattleScanner',
    tech: ['YOLO v8', 'DepthAI', 'OpenCV', 'Python', 'PyQt5'],
    desc: 'Automated cattle hip height measurement system using DepthAI depth cameras. Led YOLO v8 model training (91.3% mAP@50, sub-5cm accuracy) and built the full PyQt5 GUI as lead GUI developer in a 5-person capstone team for client SOLES USYD.',
    url: 'https://github.com/KAANSSAR/CattleScanner',
  },
  {
    num: '05',
    name: 'Shivam Brass — Site Redesign',
    tech: ['PHP', 'HTML/CSS', 'JavaScript', 'XAMPP', 'localStorage API'],
    desc: 'Ground-up commercial site redesign delivering 3 net-new functionalities across 32 product categories. Built a localStorage cart wired via PHP mail handlers and eliminated ~300KB of legacy JS by replacing a jQuery-dependent slider with a native CSS implementation.',
  },
  {
    num: '06',
    name: 'Job Management App Refactor',
    tech: ['.NET MAUI', 'C#', 'REST APIs', 'Azure SQL'],
    desc: "Optimised Hanlon Industries' cross-platform MAUI application by implementing instance tracking automation and refactoring production tracking systems. Served as Client Liaison between stakeholders and the engineering team throughout.",
  },
]