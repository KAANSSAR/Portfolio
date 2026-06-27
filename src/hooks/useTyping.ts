'use client'

import { useState, useEffect } from 'react'

export function useTyping(words: string[], typeSpeed = 52, deleteSpeed = 26, pauseMs = 1900) {
  const [text, setText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[wordIdx]
    let timer: ReturnType<typeof setTimeout>

    if (!deleting) {
      if (charIdx < word.length) {
        timer = setTimeout(() => {
          setText(word.slice(0, charIdx + 1))
          setCharIdx(c => c + 1)
        }, typeSpeed)
      } else {
        timer = setTimeout(() => setDeleting(true), pauseMs)
      }
    } else {
      if (charIdx > 0) {
        timer = setTimeout(() => {
          setText(word.slice(0, charIdx - 1))
          setCharIdx(c => c - 1)
        }, deleteSpeed)
      } else {
        setDeleting(false)
        setWordIdx(i => (i + 1) % words.length)
      }
    }

    return () => clearTimeout(timer)
  }, [charIdx, deleting, wordIdx, words, typeSpeed, deleteSpeed, pauseMs])

  return text
}
