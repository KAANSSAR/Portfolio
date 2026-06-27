'use client'

import { useState, useEffect } from 'react'

export function useCounter(target: number, inView: boolean, duration = 1200) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) {
      setCount(0)
      return
    }
    let start = 0
    const steps = 60
    const stepValue = target / steps
    const interval = duration / steps

    const timer = setInterval(() => {
      start += stepValue
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, interval)

    return () => clearInterval(timer)
  }, [inView, target, duration])

  return count
}
