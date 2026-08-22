// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';

// --- ported from e-Nicko/webgl-digital-globe components/Globe.tsx ---
function convertToSpherePosition(lon, lat, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

async function loadGlobePoints(radius, landColorOverride, oceanColorOverride) {
  const res = await fetch('/data/globe-points.json');
  const data = await res.json();
  const landColor = landColorOverride || data.meta.landDotsColor || '#ffffff';
  const oceanColor = oceanColorOverride || data.meta.oceanDotsColor || '#ffffff25';
  const land = [], ocean = [];
  data.points.forEach(p => {
    const pos = convertToSpherePosition(p.lon, p.lat, radius);
    (p.type === 'land' ? land : ocean).push(pos);
  });
  return { land, ocean, landColor, oceanColor };
}

function hexToRgb01(hex) {
  let h = hex.replace('#', '');
  if (h.length === 8) h = h.slice(0, 6); // strip alpha suffix like ffffff25
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}
function hexAlpha(hex, fallback) {
  const h = hex.replace('#', '');
  if (h.length === 8) return parseInt(h.slice(6, 8), 16) / 255;
  return fallback;
}
// --- end ported ---

const MARKER_LOCATIONS = [
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, color: '#FF6B6B', colorLight: '#B33F3F' },
  { name: 'Jamnagar', lat: 22.4707, lon: 70.0577, color: '#FFE66D', colorLight: '#A88516' },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946, color: '#FF8C42', colorLight: '#B85A17' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, color: '#4ECDC4', colorLight: '#1F8A80' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, color: '#A78BFA', colorLight: '#6A4CD1' },
];

function makeLabelSprite(THREE, text, color) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 42;
  ctx.font = `800 ${fontSize}px 'DM Mono', monospace`;
  const w = Math.ceil(ctx.measureText(text).width) + 24;
  canvas.width = w; canvas.height = fontSize * 1.6;
  ctx.font = `800 ${fontSize}px 'DM Mono', monospace`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 12, canvas.height / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  const scale = 0.0022;
  sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);
  return sprite;
}

function OrbitDotGlobe({ autoRotate = true, rotationSpeed = 0.002, radius = 2, dotColor = '', oceanDotColor = '', lightMode = false }) {
  const containerRef = useRef(null);
  const numRotationSpeed = Number(rotationSpeed) || 0.002;
  const numRadius = Number(radius) || 2;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let renderer, scene, camera, group, raf, cancelled = false;
    let dragging = false, lastX = 0, lastY = 0, velX = 0, rotX = 0.15;

    Promise.resolve(THREE).then(THREE => {
      if (cancelled || !container) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.set(0, 0, 7);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      container.appendChild(renderer.domElement);

      group = new THREE.Group();
      group.rotation.x = rotX;
      scene.add(group);

      function resize() {
        const w = container.clientWidth, h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      window.addEventListener('resize', resize);

      loadGlobePoints(numRadius, dotColor, oceanDotColor).then(({ land, ocean, landColor, oceanColor }) => {
        if (cancelled) return;
        console.log('globe points loaded', land.length, ocean.length);
        const buildPoints = (arr, hex, size, fallbackAlpha) => {
          const geo = new THREE.BufferGeometry();
          const positions = new Float32Array(arr.length * 3);
          arr.forEach((p, i) => { positions[i * 3] = p[0]; positions[i * 3 + 1] = p[1]; positions[i * 3 + 2] = p[2]; });
          geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          const [r, g, b] = hexToRgb01(hex);
          const mat = new THREE.PointsMaterial({
            color: new THREE.Color(r, g, b),
            size, sizeAttenuation: true, transparent: true,
            opacity: hexAlpha(hex, fallbackAlpha), depthWrite: false,
          });
          return new THREE.Points(geo, mat);
        };
        group.add(buildPoints(land, landColor, 0.045, 0.9));
        group.add(buildPoints(ocean, oceanColor, 0.032, 0.35));

        const markerGroup = new THREE.Group();
        MARKER_LOCATIONS.forEach(loc => {
          const [x, y, z] = convertToSpherePosition(loc.lon, loc.lat, numRadius);
          const markerHex = lightMode ? loc.colorLight : loc.color;
          const [mr, mg, mb] = hexToRgb01(markerHex);
          const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.035, 12, 12),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(mr, mg, mb) })
          );
          core.position.set(x, y, z);
          const halo = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 12, 12),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(mr, mg, mb), transparent: true, opacity: 0.35, depthWrite: false })
          );
          halo.position.set(x, y, z);
          halo.userData.isMarkerHalo = true;
          const len = Math.hypot(x, y, z) || 1;
          const nx = x / len, ny = y / len, nz = z / len;
          const label = makeLabelSprite(THREE, loc.name, markerHex);
          label.position.set(x + nx * 0.06, y + ny * 0.06 - 0.16, z + nz * 0.06);
          markerGroup.add(core, halo, label);
        });
        group.add(markerGroup);
        window.__globeMarkers = markerGroup;
      });

      const onDown = e => { dragging = true; lastX = e.clientX; lastY = e.clientY; velX = 0; };
      const onMove = e => {
        if (!dragging) return;
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        group.rotation.y += dx * 0.008;
        rotX = Math.max(-1.2, Math.min(1.2, rotX + dy * 0.008));
        group.rotation.x = rotX;
        velX = dx * 0.008;
      };
      const onUp = () => { dragging = false; container.style.cursor = 'grab'; };
      container.style.pointerEvents = 'auto';
      container.style.touchAction = 'none';
      container.addEventListener('pointerdown', e => { onDown(e); container.style.cursor = 'grabbing'; });
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      container.style.cursor = 'grab';

      function animate() {
        raf = requestAnimationFrame(animate);
        if (!dragging) {
          if (autoRotate) group.rotation.y += numRotationSpeed;
          velX *= 0.94;
          group.rotation.y += velX;
        }
        const t = performance.now() * 0.002;
        const pulse = 1 + Math.sin(t) * 0.35;
        if (window.__globeMarkers) {
          window.__globeMarkers.children.forEach(m => {
            if (m.userData.isMarkerHalo) m.scale.setScalar(pulse);
          });
        }
        renderer.render(scene, camera);
      }
      animate();
      window.__globeDebug = { renderer, scene, camera, group };

      container.__cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        container.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        renderer.dispose();
        if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      };
    });

    return () => { cancelled = true; if (container.__cleanup) container.__cleanup(); };
  }, [autoRotate, numRotationSpeed, numRadius, dotColor, oceanDotColor, lightMode]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

export default OrbitDotGlobe;
