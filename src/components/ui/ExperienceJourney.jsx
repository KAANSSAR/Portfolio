// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { createPortal } from 'react-dom';
import { useTheme } from '@/context/ThemeContext';

const STEP_Y = 2.2;
const PET_FRAME = 64, PET_SHEET = 256, PET_ROW_WALK = 2, PET_FRAMES = 4;
function buildCurvePoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    pts.push({ x: side * 1.9, y: i * STEP_Y, z: Math.sin(i * 0.9) * 0.6 });
  }
  return pts;
}

// Detail card for one timeline entry, opened by clicking its node or label.
function ExperienceDetail({ entries, index, onClose, onNav }) {
  const { T, isDark } = useTheme();
  const e = entries[index];
  const cardRef = useRef(null);
  useEffect(() => { cardRef.current?.focus({ preventScroll: true }); }, []);

  useEffect(() => {
    const onKey = ev => {
      if (ev.key === 'Escape') onClose();
      // Entries are stored newest-first, so "next" (later in time) is index - 1.
      if (ev.key === 'ArrowRight') onNav(-1);
      if (ev.key === 'ArrowLeft') onNav(1);
    };
    window.addEventListener('keydown', onKey);
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    document.body.dataset.fullscreenOverlay = '1';
    return () => {
      window.removeEventListener('keydown', onKey);
      root.style.overflow = prevOverflow;
      document.body.dataset.fullscreenOverlay = '';
    };
  }, [onClose, onNav]);

  if (!e) return null;
  // Number them oldest to newest: the degree is 1, the latest role is n.
  const pos = entries.length - index;
  const mono = "'DM Mono', monospace";
  const navBtn = (dir, label, disabled) => (
    <button
      onClick={() => !disabled && onNav(dir)}
      disabled={disabled}
      data-cursor-hover="true"
      style={{
        background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 999, padding: '7px 14px',
        fontFamily: mono, fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase',
        color: T.ink, opacity: disabled ? 0.3 : 1, cursor: disabled ? 'default' : 'pointer',
      }}
    >{label}</button>
  );

  return createPortal(
    <div
      onClick={onClose}
      className="exp-detail-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(40,30,15,0.25)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={e.title}
        onClick={ev => ev.stopPropagation()}
        className="exp-detail-card"
        style={{
          position: 'relative', width: '100%', maxWidth: 460, borderRadius: 20, padding: '30px 30px 24px',
          background: isDark ? 'rgba(22,22,22,0.92)' : 'rgba(255,255,255,0.94)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : T.line}`,
          boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.6)' : '0 24px 60px rgba(40,30,15,0.18)',
          color: T.ink, outline: 'none',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          data-cursor-hover="true"
          style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', border: `1px solid ${T.line}`, background: 'transparent', color: T.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div style={{ fontFamily: mono, fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 6, paddingRight: 36 }}>{e.tag}</div>
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: T.inkFaint, marginBottom: 14 }}>{e.year}</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.45rem', lineHeight: 1.25, marginBottom: 6 }}>{e.title}</div>
        <div style={{ fontFamily: mono, fontSize: '0.72rem', color: T.inkMuted, marginBottom: 18 }}>{e.company}</div>
        <p style={{ fontSize: '0.92rem', lineHeight: 1.7, color: T.inkMuted, margin: '0 0 24px' }}>{e.desc}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
          {navBtn(1, 'Prev', pos <= 1)}
          <span style={{ fontFamily: mono, fontSize: '0.6rem', color: T.inkFaint }}>{pos} / {entries.length}</span>
          {navBtn(-1, 'Next', pos >= entries.length)}
        </div>
      </div>
    </div>,
    // Portal into the themed root, not <body>: the root is its own stacking
    // context (isolation: isolate) and the custom cursor lives inside it, so a
    // popup on <body> would sit above the cursor no matter its z-index.
    document.getElementById('theme-root') || document.body
  );
}

function ExperienceJourney({ entries = [], accent = '#C4962A', bg = '#0A0908', titleColor = '#F5F0E8', metaColor = 'rgba(255,255,255,0.5)' }) {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const labelsRef = useRef(null);
  const astroRef = useRef(null);
  const speechRef = useRef(null);
  const legLRef = useRef(null);
  const legRRef = useRef(null);
  const armLRef = useRef(null);
  const armRRef = useRef(null);
  const stateRef = useRef({ progress: 0 });
  const hitsRef = useRef(null);
  const [openIdx, setOpenIdx] = useState(null);
  const closeDetail = useCallback(() => setOpenIdx(null), []);
  const navDetail = useCallback(dir => setOpenIdx(i => (i == null ? i : Math.max(0, Math.min(entries.length - 1, i + dir)))), [entries.length]);

  useEffect(() => {
    let raf, renderer, destroyed = false, cleanupFns = [];
    Promise.resolve(THREE).then(THREE => {
      if (destroyed || !canvasRef.current) return;
      const canvas = canvasRef.current;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      const scene = new THREE.Scene();
      const accentColor = new THREE.Color(accent);
      scene.fog = new THREE.FogExp2(new THREE.Color(bg).getHex(), 0.032);
      const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);

      const starCount = 500;
      const starGeom = new THREE.BufferGeometry();
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 36;
        starPos[i * 3 + 1] = Math.random() * -(entries.length * 4.8 + 20) + 6;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 26 - 8;
      }
      starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const stars = new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.4 }));
      scene.add(stars);

      const rig = new THREE.Group();
      scene.add(rig);
      // On a phone the camera's horizontal field of view is far narrower than
      // on desktop (fov is vertical, so a tall aspect ratio shrinks it), which
      // pushed the +/-1.9 nodes off both edges. Squeeze the thread inward
      // instead of changing the alternating left/right layout.
      const xSqueeze = () => (canvas.clientWidth < 700 ? 0.4 : 1);

      const rawPts = buildCurvePoints(entries.length).map(p => new THREE.Vector3(p.x, p.y, p.z));
      const curve = new THREE.CatmullRomCurve3(rawPts, false, 'catmullrom', 0.5);

      const TUBULAR_SEGMENTS = 320, RADIAL_SEGMENTS = 8;
      const tubeMeshes = [[0.012, 0.9, 1], [0.032, 0.16, 2], [0.06, 0.07, 3]].map(([radius, opacity, layer]) => {
        const geom = new THREE.TubeGeometry(curve, TUBULAR_SEGMENTS, radius, RADIAL_SEGMENTS, false);
        const mat = new THREE.MeshBasicMaterial({
          color: accentColor, transparent: true, opacity,
          blending: layer > 1 ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: layer === 1,
        });
        const mesh = new THREE.Mesh(geom, mat);
        geom.setDrawRange(0, 0);
        rig.add(mesh);
        return mesh;
      });

      const nodeGeom = new THREE.IcosahedronGeometry(0.17, 0);
      const haloGeom = new THREE.SphereGeometry(0.36, 12, 12);
      const nodes = rawPts.map(p => {
        const mesh = new THREE.Mesh(nodeGeom, new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.15 }));
        mesh.position.copy(p);
        rig.add(mesh);
        const halo = new THREE.Mesh(haloGeom, new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false }));
        halo.position.copy(p);
        rig.add(halo);
        return { mesh, halo };
      });

      function resize() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      window.addEventListener('resize', resize);
      cleanupFns.push(() => window.removeEventListener('resize', resize));
      resize();

      const PHRASES = ['Whee!', 'Onward!', 'Almost there...', 'Nice pace!', 'To infinity!', 'Keep going!', 'So far so good.', 'Weeeee~'];
      const NODE_PHRASES = ['Cool!', 'Wow!', 'Nice one!', 'Impressive!', 'Whoa!', 'Neat!'];
      let speechTimer, typeInterval, lastPhrase = null, isSpeaking = false;

      function typePhrase(phrase, onDone) {
        let i = 0;
        isSpeaking = true;
        if (speechRef.current) { speechRef.current.style.opacity = '1'; speechRef.current.textContent = ''; }
        clearInterval(typeInterval);
        typeInterval = setInterval(() => {
          i++;
          if (speechRef.current) speechRef.current.textContent = phrase.slice(0, i);
          if (i >= phrase.length) {
            clearInterval(typeInterval);
            setTimeout(() => {
              if (speechRef.current) speechRef.current.style.opacity = '0';
              isSpeaking = false;
              if (onDone) onDone();
            }, 1200);
          }
        }, 45);
      }
      function pickPhrase(pool) {
        let phrase = pool[Math.floor(Math.random() * pool.length)];
        if (pool.length > 1) { while (phrase === lastPhrase) phrase = pool[Math.floor(Math.random() * pool.length)]; }
        lastPhrase = phrase;
        return phrase;
      }
      function scheduleSpeech() {
        speechTimer = setTimeout(() => {
          typePhrase(pickPhrase(PHRASES), scheduleSpeech);
        }, 6000 + Math.random() * 4000);
      }
      scheduleSpeech();
      cleanupFns.push(() => { clearTimeout(speechTimer); clearInterval(typeInterval); });

      let lastReachedNode = null;
      function checkNodeReach(revIndex) {
        const reached = Math.ceil(revIndex);
        if (lastReachedNode === null) { lastReachedNode = reached; return; }
        if (reached !== lastReachedNode && reached >= 0 && reached < rawPts.length) {
          lastReachedNode = reached;
          if (!isSpeaking && Math.random() < 0.15) {
            clearTimeout(speechTimer);
            typePhrase(pickPhrase(NODE_PHRASES), scheduleSpeech);
          }
        }
      }

      let lastProgress = null, walkClock = 0, climbDir = 1;
      function animate(t) {
        raf = requestAnimationFrame(animate);
        const progress = stateRef.current.progress;
        const n = rawPts.length;
        const totalSpan = Math.max(1, (n - 1) * STEP_Y);
        const revIndex = (n - 1) * (1 - progress);
        checkNodeReach(revIndex);
        // On a phone the live node sat about 20% from the top, so it only
        // finished appearing once it was nearly off the screen. Raise the
        // camera so it lands just above the middle instead.
        const phone = canvas.clientWidth < 700;
        camera.position.set(0, phone ? -0.45 : -1.9, 6.5);
        camera.rotation.set(0, 0, 0);
        const xs = xSqueeze();
        rig.scale.x = xs;
        rig.position.y = -revIndex * STEP_Y;
        const curT = Math.max(0, Math.min(1, revIndex / (n - 1)));
        const curLocal = curve.getPoint(curT);
        const scrollDelta = lastProgress === null ? 0 : progress - lastProgress;
        const scrollSpeed = Math.abs(scrollDelta);
        // Remember which way we last scrolled so the astronaut turns round
        // when climbing back up the thread, and keeps that facing at rest.
        if (scrollSpeed > 0.00003) climbDir = scrollDelta < 0 ? -1 : 1;
        lastProgress = progress;
        const isWalking = scrollSpeed > 0.00003;
        if (isWalking) walkClock += scrollSpeed * 7000;
        if (astroRef.current) {
          const worldPos = new THREE.Vector3(curLocal.x * xs, curLocal.y + rig.position.y, curLocal.z + 0.9);
          const av = worldPos.project(camera);
          if (av.z > -1 && av.z < 1) {
            const ax = (av.x * 0.5 + 0.5) * canvas.clientWidth;
            const ay = (-av.y * 0.5 + 0.5) * canvas.clientHeight;
            const bob = Math.sin(t / 900) * 6;
            const walkFrame = Math.floor(walkClock) % PET_FRAMES;
            const displaySize = 40;
            const bgScale = displaySize / PET_FRAME;
            astroRef.current.style.backgroundSize = `${PET_SHEET * bgScale}px ${PET_SHEET * bgScale}px`;
            astroRef.current.style.backgroundPosition = `${-walkFrame * displaySize}px ${-(isWalking ? PET_ROW_WALK : 0) * displaySize}px`;
            const tangent = curve.getTangent(curT);
            const facing = (tangent.x >= 0 ? -1 : 1) * climbDir;
            astroRef.current.style.transform = `translate(${ax}px, ${ay + bob}px) translate(-50%,-50%) scaleX(${facing})`;
            astroRef.current.style.opacity = '1';
            if (speechRef.current) {
              speechRef.current.style.transform = `translate(${ax + 24}px, ${ay + bob - 44}px) translate(0,-100%)`;
            }
          } else {
            astroRef.current.style.opacity = '0';
          }
        }
        const indicesPerSegment = RADIAL_SEGMENTS * 6;
        const startSegment = Math.floor((1 - progress) * TUBULAR_SEGMENTS);
        const drawStart = startSegment * indicesPerSegment;
        const drawCount = Math.max(0, (TUBULAR_SEGMENTS - startSegment) * indicesPerSegment);
        tubeMeshes.forEach(m => m.geometry.setDrawRange(drawStart, drawCount));
        stars.position.y = Math.sin(t / 6000) * 0.25;
        const labelEls = labelsRef.current ? labelsRef.current.children : [];
        camera.updateMatrixWorld(true);
        nodes.forEach((nd, i) => {
          // a slower fade on phones so a node starts appearing lower down
          const diff = Math.min((phone ? 1.25 : 2) * Math.max(revIndex - i, 0), 1);
          const active = 1 - diff;
          nd.mesh.material.opacity = active;
          nd.halo.material.opacity = 0.3 * active;
          const pulse = 1 + Math.sin(t / 500 + i) * 0.06 * active;
          // The rig is squeezed on X for narrow screens, which would also
          // squash these spheres into ellipses, so divide it back out. The
          // extra factor just makes them less dominant on a small screen.
          const nodeScale = canvas.clientWidth < 700 ? 0.55 : 1;
          nd.mesh.scale.setScalar(pulse * nodeScale);
          nd.mesh.scale.x = (pulse * nodeScale) / xs;
          const haloS = (1 + active * 0.6 + Math.sin(t / 700 + i) * 0.1 * active) * nodeScale;
          nd.halo.scale.setScalar(haloS);
          nd.halo.scale.x = haloS / xs;

          const el = labelEls[i];
          if (!el) return;
          const v = new THREE.Vector3(rawPts[i].x * xs, rawPts[i].y + rig.position.y, rawPts[i].z).project(camera);
          const opacity = Math.max(0, Math.min(1, 2 - 2 * diff));
          // Clickable area over the node itself.
          const hit = hitsRef.current ? hitsRef.current.children[i] : null;
          const clickable = opacity > 0.5 && v.z <= 1 && v.z >= -1;
          if (hit) {
            const hx = (v.x * 0.5 + 0.5) * canvas.clientWidth;
            const hy = (-v.y * 0.5 + 0.5) * canvas.clientHeight;
            hit.style.transform = `translate(${hx}px, ${hy}px) translate(-50%, -50%)`;
            hit.style.pointerEvents = clickable ? 'auto' : 'none';
          }
          el.style.pointerEvents = clickable ? 'auto' : 'none';
          if (v.z > 1 || v.z < -1 || opacity <= 0.01) { el.style.opacity = 0; return; }
          const narrow = canvas.clientWidth < 700;
          const nudge = narrow ? 14 : 40;
          let x = (v.x * 0.5 + 0.5) * canvas.clientWidth + (i % 2 === 0 ? -nudge : nudge);
          let y = (-v.y * 0.5 + 0.5) * canvas.clientHeight + 30;
          // A fixed 300px clamp on a 390px screen pinned both sides to the
          // middle, which is what collapsed the left/right alternation.
          const labelW = narrow ? Math.min(300, canvas.clientWidth * 0.44) : 300;
          const labelH = narrow ? 120 : 140;
          const margin = narrow ? 10 : 24;
          if (i % 2 === 0) x = Math.max(labelW + margin, x);
          else x = Math.min(canvas.clientWidth - labelW - margin, x);
          y = Math.min(canvas.clientHeight - labelH - margin, y);
          const side = i % 2 === 0 ? '-100%' : '0%';
          el.style.transform = `translate(${x}px, ${y}px) translate(${side}, 0%)`;
          el.style.opacity = opacity;
        });

        renderer.render(scene, camera);
      }
      animate(0);
    });
    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      cleanupFns.forEach(fn => fn());
      if (renderer) renderer.dispose();
    };
  }, [entries, accent, bg]);

  useEffect(() => {
    let raf;
    function tick() {
      raf = requestAnimationFrame(tick);
      const wrap = wrapRef.current, stage = stageRef.current;
      if (!wrap || !stage) return;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      // Span the site frame (see --frame in globals.css), not the whole window,
      // so the journey stays centred on wide monitors.
      const pageW = document.documentElement.clientWidth;
      const frame = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--frame')) || pageW;
      const vw = Math.min(window.innerWidth, frame);
      const frameLeft = Math.max(0, (pageW - vw) / 2);
      const total = wrap.offsetHeight - vh;
      stateRef.current.progress = Math.max(0, Math.min(1, total > 0 ? (-rect.top) / total : 0));

      if (rect.top > 0) {
        stage.style.position = 'absolute';
        stage.style.top = '0px';
        stage.style.left = `${frameLeft - rect.left}px`;
        stage.style.width = `${vw}px`;
      } else if (rect.bottom < vh) {
        stage.style.position = 'absolute';
        stage.style.top = `${Math.max(0, wrap.offsetHeight - vh)}px`;
        stage.style.left = `${frameLeft - rect.left}px`;
        stage.style.width = `${vw}px`;
      } else {
        stage.style.position = 'fixed';
        stage.style.top = '0px';
        stage.style.left = `${frameLeft}px`;
        stage.style.width = `${vw}px`;
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative', height: `${Math.max(180, entries.length * 34)}vh` }}>
      <div ref={stageRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', overflow: 'hidden', background: 'transparent', zIndex: 5, pointerEvents: 'none' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        <div ref={astroRef} style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, pointerEvents: 'none', backgroundImage: "url('/images/astronaut-pet-sprite.png')", backgroundSize: '160px 160px', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.35))' }} />
        <div ref={speechRef} style={{ position: 'absolute', top: 0, left: 0, padding: '6px 10px', background: 'rgba(20,17,15,0.85)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: '#F5F0E8', whiteSpace: 'nowrap', pointerEvents: 'none', opacity: 0, transition: 'opacity 0.6s ease' }} />
        <div ref={hitsRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {entries.map((e, i) => (
            <button
              key={i}
              className="exp-node-hit"
              aria-label={`More about ${e.title}`}
              data-cursor-hover="true"
              onClick={() => setOpenIdx(i)}
              style={{ position: 'absolute', top: 0, left: 0, width: 72, height: 72, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', pointerEvents: 'none', padding: 0 }}
            />
          ))}
        </div>
        <div ref={labelsRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {entries.map((e, i) => (
            <div key={i} className="exp-label" data-cursor-hover="true" onClick={() => setOpenIdx(i)} style={{ cursor: 'pointer', position: 'absolute', top: 0, left: 0, width: 300, maxWidth: '40vw', fontFamily: "'DM Mono', monospace", willChange: 'transform, opacity' }}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: accent, marginBottom: 6 }}>{e.tag}</div>
              <div style={{ fontSize: '0.78rem', color: metaColor, marginBottom: 8 }}>{e.year}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.4rem', color: titleColor, lineHeight: 1.25, marginBottom: 4 }}>{e.title}</div>
              <div style={{ fontSize: '0.8rem', color: metaColor }}>{e.company}</div>
              <div className="exp-more" style={{ marginTop: 10, fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: titleColor, opacity: 0.6 }}>Details +</div>
            </div>
          ))}
        </div>
      </div>
      {openIdx != null && <ExperienceDetail entries={entries} index={openIdx} onClose={closeDetail} onNav={navDetail} />}
    </div>
  );
}

export default ExperienceJourney;
