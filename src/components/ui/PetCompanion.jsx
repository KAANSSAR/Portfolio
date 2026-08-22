// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const FRAME = 64;
const SHEET = 256;
const ROW_IDLE = 0;
const ROW_WALK = 2;
const FRAME_COUNT = 4;

function PetCompanion({ spriteSrc = '/images/astronaut-pet-sprite.png', size = 48 }) {
  const s = Number(size) || 48;
  const elRef = useRef(null);
  const speechRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let raf;
    const mouse = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
    const pos = { x: mouse.x, y: mouse.y };
    let frame = 0, frameTimer = 0, lastT = 0, facingLeft = false, moving = false;

    const onMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMove);

    const scale = s / FRAME;
    const bgSize = SHEET * scale;

    const CHASE_SPEED = 1.7;
    const IDLE_DIST = 46;

    function tick(t) {
      raf = requestAnimationFrame(tick);
      const dt = lastT ? Math.min(48, t - lastT) : 16;
      lastT = t;

      const dx = mouse.x - pos.x, dy = mouse.y - pos.y;
      const dist = Math.hypot(dx, dy);
      moving = dist > IDLE_DIST;
      if (moving) {
        const step = CHASE_SPEED * (dt / 16.67);
        const ratio = Math.min(1, step / dist);
        pos.x += dx * ratio;
        pos.y += dy * ratio;
        if (Math.abs(dx) > 1) facingLeft = dx < 0;
      }

      frameTimer += dt;
      const frameDur = moving ? 110 : 260;
      if (frameTimer >= frameDur) { frameTimer = 0; frame = (frame + 1) % FRAME_COUNT; }

      const row = moving ? ROW_WALK : ROW_IDLE;
      const bgX = -frame * s;
      const bgY = -row * s;
      el.style.backgroundPosition = `${bgX}px ${bgY}px`;
      el.style.transform = `translate(${pos.x}px, ${pos.y}px) scaleX(${facingLeft ? -1 : 1})`;
      if (speechRef.current) speechRef.current.style.transform = `translate(${pos.x + s * 0.6}px, ${pos.y - 6}px) translate(0,-100%)`;

      if (moving && !wasMoving) {
        hasGreetedArrival = false;
        clearTimeout(speechTimer);
        const phrase = pickPhrase(CHASE_PHRASES);
        typePhrase(phrase, scheduleChaseSpeech);
      }
      if (!moving && wasMoving && !hasGreetedArrival) {
        hasGreetedArrival = true;
        clearTimeout(speechTimer);
        clearInterval(typeInterval);
        const phrase = pickPhrase(ARRIVAL_PHRASES);
        typePhrase(phrase, null);
      }
      wasMoving = moving;

      const expHeading = document.getElementById('exp-heading');
      const projHeading = document.getElementById('projects-heading');
      if (expHeading && projHeading) {
        const mid = window.innerHeight * 0.5;
        const pastExp = expHeading.getBoundingClientRect().top < mid;
        const pastProj = projHeading.getBoundingClientRect().top < mid;
        const inExperience = pastExp && !pastProj;
        const overlayOpen = document.body.dataset.fullscreenOverlay === '1';
        el.style.opacity = (inExperience || overlayOpen) ? '0' : '1';
        if (speechRef.current) speechRef.current.style.opacity = (inExperience || overlayOpen) ? '0' : speechRef.current.style.opacity;
      }
    }
    raf = requestAnimationFrame(tick);

    let wasMoving = false, hasGreetedArrival = false, speechTimer, typeInterval, lastPhrase = null;
    const CHASE_PHRASES = ['Hey, wait up!', 'Not fair!', 'Ugh, so fast!', '*huff huff*', 'Come back here!', 'Slow down!!', 'Are we there yet?', 'This is exhausting.'];
    const ARRIVAL_PHRASES = ['Oh, finally!', 'About time!', 'Made it!', 'Phew, caught you!', 'There you are!'];

    function pickPhrase(pool) {
      let phrase = pool[Math.floor(Math.random() * pool.length)];
      if (pool.length > 1) { while (phrase === lastPhrase) phrase = pool[Math.floor(Math.random() * pool.length)]; }
      lastPhrase = phrase;
      return phrase;
    }

    function typePhrase(phrase, onDone) {
      let i = 0;
      if (speechRef.current) { speechRef.current.style.opacity = '1'; speechRef.current.textContent = ''; }
      clearInterval(typeInterval);
      typeInterval = setInterval(() => {
        i++;
        if (speechRef.current) speechRef.current.textContent = phrase.slice(0, i);
        if (i >= phrase.length) {
          clearInterval(typeInterval);
          setTimeout(() => {
            if (speechRef.current) speechRef.current.style.opacity = '0';
            if (onDone) onDone();
          }, 1200);
        }
      }, 45);
    }
    function scheduleChaseSpeech() {
      clearTimeout(speechTimer);
      speechTimer = setTimeout(() => {
        const phrase = pickPhrase(CHASE_PHRASES);
        typePhrase(phrase, scheduleChaseSpeech);
      }, 5000 + Math.random() * 8000);
    }

    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); clearTimeout(speechTimer); clearInterval(typeInterval); };
  }, [s]);

  return (
    <>
      <div
        ref={elRef}
        style={{
          position: 'fixed', top: 0, left: 0, width: s, height: s,
          backgroundImage: `url(${spriteSrc})`,
          backgroundSize: `${SHEET * (s / FRAME)}px ${SHEET * (s / FRAME)}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          pointerEvents: 'none',
          zIndex: 9999,
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))',
        }}
      />
      <div ref={speechRef} style={{ position: 'fixed', top: 0, left: 0, padding: '5px 9px', background: 'rgba(20,17,15,0.88)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: '#F5F0E8', whiteSpace: 'nowrap', pointerEvents: 'none', opacity: 0, transition: 'opacity 0.5s ease', zIndex: 9999 }} />
    </>
  );
}

export default PetCompanion;
