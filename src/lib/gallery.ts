export interface GalleryItem {
  id: string
  src: string
  alt: string
  caption?: string
  category: 'travel' | 'gym' | 'events' | 'sketches' | 'racing' | 'other'
  span?: 'tall' | 'normal'
  objectPosition?: string // controls crop focus e.g. 'top', 'center', 'bottom'
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    src: '/gallery/USYD_PFP.jpg',
    alt: 'Kanishka Sarkar',
    caption: 'University of Sydney',
    category: 'events',
    span: 'tall',
    objectPosition: 'center top',
  },
  {
    id: '2',
    src: '/gallery/TCS-Group.jpg',
    alt: 'TCS Garage Team',
    caption: 'TCS Garage — 1 of 30 selected',
    category: 'events',
    span: 'normal',
    objectPosition: 'center center',
  },
  {
    id: '3',
    src: '/gallery/TCS-VR.jpg',
    alt: 'TCS VR Experience',
    caption: 'TCS Innovation Lab',
    category: 'events',
    span: 'normal',
    objectPosition: 'center center',
  },
  {
    id: '4',
    src: '/gallery/SXSW-Presentation.jpg',
    alt: 'Presenting at SXSW Sydney 2024',
    caption: 'Presenting Amptex at SXSW Sydney 2024',
    category: 'events',
    span: 'normal',
    objectPosition: 'center top',
  },
  {
    id: '5',
    src: '/gallery/SXSW-Group.jpg',
    alt: 'Enactus at SXSW Sydney',
    caption: 'Enactus USYD at SXSW Sydney 2024',
    category: 'events',
    span: 'normal',
    objectPosition: 'center center',
  },
  {
    id: '6',
    src: '/gallery/Enactus-Group.jpg',
    alt: 'Enactus Nationals 2024',
    caption: '1st Runner Up — Enactus Nationals 2024, Melbourne',
    category: 'events',
    span: 'normal',
    objectPosition: 'center center',
  },
  {
    id: '7',
    src: '/gallery/HanlonGroup.jpg',
    alt: 'Hanlon Industries Team',
    caption: 'Hanlon Industries — Consulting Engineering Internship',
    category: 'events',
    span: 'normal',
    objectPosition: 'center center',
  },
  {
    id: '8',
    src: '/gallery/Undergrad-Panel.jpg',
    alt: 'Engineering Undergraduate Panel',
    caption: 'Student Panelist — Faculty of Engineering Welcome Panel',
    category: 'events',
    span: 'tall',
    objectPosition: 'center center',
  },
  {
    id: '9',
    src: '/gallery/DeadliftComp.jpg',
    alt: 'Deadlift Competition',
    caption: 'Competition day',
    category: 'gym',
    span: 'tall',
    objectPosition: 'center center',
  },
  {
    id: '10',
    src: '/gallery/10kmRun.JPG',
    alt: '10km Run',
    caption: 'Training for the half marathon',
    category: 'gym',
    span: 'tall',
    objectPosition: 'center top',
  },
  {
    id: '11',
    src: '/gallery/LamineYamal-Sketch.png',
    alt: 'Lamine Yamal Sketch',
    caption: 'Lamine Yamal — charcoal sketch',
    category: 'sketches',
    span: 'normal',
    objectPosition: 'center top',
  },
  {
    id: '12',
    src: '/gallery/Levi.png',
    alt: 'Levi Sketch',
    caption: 'Levi — @art_by_kaanssar',
    category: 'sketches',
    span: 'tall',
    objectPosition: 'center top',
  },
  {
    id: '13',
    src: '/gallery/Nobara-sketch.png',
    alt: 'Nobara Sketch',
    caption: 'Nobara — @art_by_kaanssar',
    category: 'sketches',
    span: 'tall',  // change from 'normal' to 'tall' so the full drawing shows
    objectPosition: 'center center',
  },
  {
    id: '14',
    src: '/gallery/SukunaYuji.png',
    alt: 'Sukuna vs Yuji Sketch',
    caption: 'Sukuna vs Yuji — @art_by_kaanssar',
    category: 'sketches',
    span: 'tall',  // change from 'normal' to 'tall'
    objectPosition: 'center center',
  },
]

export const GALLERY_CATEGORIES = ['all', 'events', 'gym', 'sketches'] as const
export type GalleryCategory = typeof GALLERY_CATEGORIES[number]