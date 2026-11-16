// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const FRAME = 64;
const SHEET = 256;
const ROW_IDLE = 0;
const ROW_WALK = 2;
const FRAME_COUNT = 4;

// Second sheet (2 rows x 4 frames, 64px each): fall, lie dazed, get up.
// 0 arms up (whoa), 1 legs out mid-fall, 2 sat on the floor, 3-4 dazed
// with stars, 5-6 crouching back up, 7 standing.
const FALL_SRC = '/images/astronaut-pet-fall.png';
const FALL_SHEET_W = 256, FALL_SHEET_H = 128;
// [frame, ms] sequences for each stage of the knock-down.
const FALL_SEQ = [[0, 130], [1, 120], [2, 180]];
const DAZED_MS = 1500;
const GETUP_SEQ = [[5, 170], [6, 150], [7, 120]];

function PetCompanion({ spriteSrc = '/images/astronaut-pet-sprite.png', fallSrc = FALL_SRC, size = 48 }) {
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

    // Knock-down state: 'normal' | 'fall' | 'dazed' | 'getup'
    let state = 'normal', stateT = 0;
    const pre = new Image(); pre.src = fallSrc;
    const FALL_PHRASES = ['Ow!', 'Hey!!', 'Rude.', 'I saw that.', '*sees stars*', 'Was that necessary?'];
    const GETUP_PHRASES = ["I'm okay!", 'Walk it off...', 'Nobody saw that.', 'Totally meant to do that.'];
    const onClick = e => {
      e.preventDefault();
      e.stopPropagation();
      if (state !== 'normal') return;
      state = 'fall'; stateT = 0;
      clearTimeout(speechTimer);
      typePhrase(pickPhrase(FALL_PHRASES), null);
    };
    el.addEventListener('click', onClick);

    // Which frame of a [frame, ms] sequence we're on after `t` ms.
    function seqFrame(seq, t) {
      let acc = 0;
      for (const [f, d] of seq) { acc += d; if (t < acc) return { f, done: false }; }
      return { f: seq[seq.length - 1][0], done: true };
    }
    const seqLen = seq => seq.reduce((a, [, d]) => a + d, 0);

    const scale = s / FRAME;
    const bgSize = SHEET * scale;

    const CHASE_SPEED = 1.7;
    const IDLE_DIST = 46;

    function tick(t) {
      raf = requestAnimationFrame(tick);
      const dt = lastT ? Math.min(48, t - lastT) : 16;
      lastT = t;

      // Knocked down: stay put and play the fall / dazed / get-up frames.
      if (state !== 'normal') {
        stateT += dt;
        let f = 2, hop = 0;
        if (state === 'fall') {
          const r = seqFrame(FALL_SEQ, stateT);
          f = r.f;
          // small hop up before landing
          const len = seqLen(FALL_SEQ);
          hop = -6 * Math.sin(Math.PI * Math.min(1, stateT / (len * 0.6)));
          if (r.done) { state = 'dazed'; stateT = 0; }
        } else if (state === 'dazed') {
          f = Math.floor(stateT / 220) % 2 === 0 ? 3 : 4;
          if (stateT >= DAZED_MS) { state = 'getup'; stateT = 0; typePhrase(pickPhrase(GETUP_PHRASES), null); }
        } else if (state === 'getup') {
          const r = seqFrame(GETUP_SEQ, stateT);
          f = r.f;
          if (r.done) { state = 'normal'; stateT = 0; frame = 0; frameTimer = 0; wasMoving = false; hasGreetedArrival = true; }
        }
        if (state !== 'normal') {
          el.style.backgroundImage = `url(${fallSrc})`;
          el.style.backgroundSize = `${FALL_SHEET_W * scale}px ${FALL_SHEET_H * scale}px`;
          el.style.backgroundPosition = `${-(f % 4) * s}px ${-Math.floor(f / 4) * s}px`;
          el.style.transform = `translate(${pos.x}px, ${pos.y + hop}px) scaleX(${facingLeft ? -1 : 1})`;
          if (speechRef.current) speechRef.current.style.transform = `translate(${pos.x + s * 0.6}px, ${pos.y - 6}px) translate(0,-100%)`;
          updateVisibility();
          return;
        }
        el.style.backgroundImage = `url(${spriteSrc})`;
        el.style.backgroundSize = `${bgSize}px ${bgSize}px`;
      }

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

      updateVisibility();
    }

    // Hidden (and not clickable) while the Experience section has its own
    // astronaut, or while a full-screen reader/editor is open.
    function updateVisibility() {
      const expHeading = document.getElementById('exp-heading');
      const projHeading = document.getElementById('projects-heading');
      let hidden = document.body.dataset.fullscreenOverlay === '1';
      if (expHeading && projHeading) {
        const mid = window.innerHeight * 0.5;
        const pastExp = expHeading.getBoundingClientRect().top < mid;
        const pastProj = projHeading.getBoundingClientRect().top < mid;
        hidden = hidden || (pastExp && !pastProj);
      }
      el.style.opacity = hidden ? '0' : '1';
      el.style.pointerEvents = hidden ? 'none' : 'auto';
      if (speechRef.current && hidden) speechRef.current.style.opacity = '0';
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

    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); el.removeEventListener('click', onClick); clearTimeout(speechTimer); clearInterval(typeInterval); };
  }, [s]);

  return (
    <>
      <div
        ref={elRef}
        data-cursor-hover="true"
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0, width: s, height: s,
          backgroundImage: `url(${spriteSrc})`,
          backgroundSize: `${SHEET * (s / FRAME)}px ${SHEET * (s / FRAME)}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          pointerEvents: 'auto',
          cursor: 'pointer',
          zIndex: 9999,
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))',
        }}
      />
      <div ref={speechRef} style={{ position: 'fixed', top: 0, left: 0, padding: '5px 9px', background: 'rgba(20,17,15,0.88)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: '#F5F0E8', whiteSpace: 'nowrap', pointerEvents: 'none', opacity: 0, transition: 'opacity 0.5s ease', zIndex: 9999 }} />
    </>
  );
}

export default PetCompanion;
