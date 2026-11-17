// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import { useTheme } from '@/context/ThemeContext';
import { accent } from '@/lib/accent';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const GREEK = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω';
const EGYPT = '𓀀𓁀𓂀𓃀𓄿𓅓𓆣𓇋𓈖𓉐𓊪𓋴𓌳𓍯𓎡𓏏𓐍𓁶𓆗';
const POOL = Array.from(GREEK + EGYPT); // Array.from keeps the hieroglyphs whole (split('') cut them in half)
const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FF8C42', '#5FD068', '#FF5DA2'];

function randChar() { return POOL[Math.floor(Math.random() * POOL.length)]; }
function randColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }

function GlitchText({ words = [], holdDuration = 2200, glitchDuration = 650, textStyle = {} }) {
  const { isDark } = useTheme();
  const [display, setDisplay] = useState(() => (words[0] || '').split('').map(c => ({ char: c, color: null })));
  const wordIndexRef = useRef(0);

  useEffect(() => {
    if (!words.length) return;
    let holdTimer, glitchInterval, glitchStart;
    function startGlitch() {
      const nextIndex = (wordIndexRef.current + 1) % words.length;
      const targetWord = words[nextIndex];
      glitchStart = performance.now();
      clearInterval(glitchInterval);
      glitchInterval = setInterval(() => {
        const elapsed = performance.now() - glitchStart;
        const progress = Math.min(1, elapsed / glitchDuration);
        const next = [];
        for (let i = 0; i < targetWord.length; i++) {
          next.push(progress >= 1 ? { char: targetWord[i], color: null } : { char: targetWord[i] === ' ' ? ' ' : randChar(), color: targetWord[i] === ' ' ? null : randColor() });
        }
        setDisplay(next);
        if (progress >= 1) {
          clearInterval(glitchInterval);
          wordIndexRef.current = nextIndex;
          holdTimer = setTimeout(startGlitch, holdDuration);
        }
      }, 110);
    }
    holdTimer = setTimeout(startGlitch, holdDuration);
    return () => { clearTimeout(holdTimer); clearInterval(glitchInterval); };
  }, [words, holdDuration, glitchDuration]);

  return (
    <span style={{ display: 'inline-flex', ...textStyle }}>
      {display.map((c, i) => (
        <span key={i} style={{ color: c.color ? accent(c.color, isDark) : textStyle.color, whiteSpace: 'pre' }}>{c.char}</span>
      ))}
    </span>
  );
}

export default GlitchText;
