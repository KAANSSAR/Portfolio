'use client'

import { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [onDark, setOnDark] = useState(false)
  const pos = useRef({ mx: 0, my: 0, rx: 0, ry: 0 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current.mx = e.clientX
      pos.current.my = e.clientY

      // Check if cursor is over a dark background element
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (el) {
        let node: Element | null = el
        let isDark = false
        while (node) {
          const bg = window.getComputedStyle(node).backgroundColor
          // Check for dark ink background rgb(26,22,18)
          if (bg === 'rgb(26, 22, 18)') {
            isDark = true
            break
          }
          node = node.parentElement
        }
        setOnDark(isDark)
      }
    }

    const tick = () => {
      const { mx, my } = pos.current
      pos.current.rx += (mx - pos.current.rx) * 0.1
      pos.current.ry += (my - pos.current.ry) * 0.1

      if (dotRef.current) {
        dotRef.current.style.left = `${mx}px`
        dotRef.current.style.top = `${my}px`
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${pos.current.rx}px`
        ringRef.current.style.top = `${pos.current.ry}px`
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    document.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(tick)

    const interactives = document.querySelectorAll('a, button, [data-cursor-hover]')
    const enter = () => setHovering(true)
    const leave = () => setHovering(false)
    interactives.forEach(el => {
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
    })

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', enter)
        el.removeEventListener('mouseleave', leave)
      })
    }
  }, [])

  const dotColor = onDark ? '#F5F0E8' : '#1A1612'
  const ringColor = hovering ? '#C4962A' : onDark ? 'rgba(245,240,232,0.5)' : 'rgba(26,22,18,0.35)'

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
          transition: 'background 0.2s ease',
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          width: hovering ? 60 : 36,
          height: hovering ? 60 : 36,
          borderColor: ringColor,
          background: hovering ? 'rgba(196,150,42,0.06)' : 'transparent',
          transition: 'width 0.35s ease, height 0.35s ease, border-color 0.2s ease, background 0.35s ease',
        }}
      />
    </>
  )
}