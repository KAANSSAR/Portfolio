export interface TimelineItem {
  year: string
  tag: string
  title: string
  company: string
  desc: string
}

export interface Project {
  num: string
  name: string
  tech: string[]
  desc: string
  url?: string
}

export interface StatItem {
  value: string
  numericValue?: number
  suffix?: string
  label: string
}

export interface NavLink {
  label: string
  href: string
}

export interface SocialLink {
  label: string
  href: string
}
