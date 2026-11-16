'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import emailjs from '@emailjs/browser';
import { useTheme } from '@/context/ThemeContext';
import { accent } from '@/lib/accent';
import { SITE, SOCIAL_LINKS } from '@/lib/data';

const HoldConfirm = dynamic(() => import('../ui/HoldConfirm'), { ssr: false });
const EyeFollowButton = dynamic(() => import('../ui/EyeFollowButton'), { ssr: false });

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_2cfl5kk';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_0i3eogg';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'bfloHtDDlu5GazDMn';

function spinOnHover(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  if (el.dataset.spinning === '1') return;
  el.dataset.spinning = '1';
  el.style.animation = 'globeSpinOnce 0.5s linear 1';
  const onEnd = () => {
    el.style.animation = 'none';
    delete el.dataset.spinning;
    el.removeEventListener('animationend', onEnd);
  };
  el.addEventListener('animationend', onEnd);
}

function formatRefreshCountdown(nextRefreshAt: number): string {
  const ms = Math.max(0, nextRefreshAt - Date.now());
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Contact() {
  const { T, isDark } = useTheme();
  // Cube.jsx sets window.__cubeNextRefreshAt once its ticker cache has a
  // timestamp, poll it rather than prop-drilling from a client-only,
  // dynamically-imported sibling component.
  const [refreshLabel, setRefreshLabel] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => {
      const next = (window as unknown as { __cubeNextRefreshAt?: number }).__cubeNextRefreshAt;
      setRefreshLabel(typeof next === 'number' ? formatRefreshCountdown(next) : null);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const onFakeSend = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    const name = (nameRef.current?.value || '').trim();
    const email = (emailRef.current?.value || '').trim();
    const subject = (subjectRef.current?.value || '').trim();
    const message = (messageRef.current?.value || '').trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !email || !subject || !message) {
      setSendError('Please fill in every field before sending.');
      return;
    }
    if (!emailValid) {
      setSendError("That email address doesn't look valid.");
      return;
    }
    setSendError(null);

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { name, email, subject, message, from_name: name, from_email: email }, EMAILJS_PUBLIC_KEY)
      .then(() => {
        setSent(true);
        setSendError(null);
        [nameRef, emailRef, subjectRef, messageRef].forEach((r) => {
          if (r.current) r.current.value = '';
        });
      })
      .catch(() => {
        setSendError('Something went wrong. Email me directly instead.');
      });
  };

  return (
    <section id="contact" style={{ padding: '4.5rem 4rem', color: T.ink }}>
      <div
        className="contact-panel"
        style={{
          maxWidth: 1200, margin: '0 auto', position: 'relative', borderRadius: 28, padding: 64,
          overflow: 'hidden', isolation: 'isolate',
          boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.4)' : '0 1px 2px rgba(40,30,15,0.06), 0 24px 60px rgba(40,30,15,0.12)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backdropFilter: isDark ? 'blur(18px) saturate(1.4) brightness(1.18)' : 'blur(18px) saturate(1.5)', WebkitBackdropFilter: isDark ? 'blur(18px) saturate(1.4) brightness(1.18)' : 'blur(18px) saturate(1.5)', background: isDark ? 'rgba(90,90,90,0.22)' : 'rgba(255,255,255,0.68)', zIndex: 0 }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: isDark ? 0.12 : 0.05, mixBlendMode: 'overlay', zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
          <filter id="contactNoise">
            <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#contactNoise)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 28, boxShadow: isDark ? 'inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)' : 'inset 0 1px 0 rgba(255,255,255,0.9)', border: `0.5px solid rgba(${T.inkRgb},${isDark ? 0.18 : 0.1})`, zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="resp-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, alignItems: 'center' }}>
            <div>
              <div className="sec-label" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48, color: `rgba(${T.inkRgb},0.4)` }}>
                <span style={{ color: accent('#FF8C42', isDark) }}>Contact</span>
                <span style={{ flex: 1, height: 1, maxWidth: 80, background: accent('#FF8C42', isDark), opacity: 0.4 }} />
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', fontSize: 'clamp(36px,4.5vw,64px)', margin: 0, color: T.ink }}>
                Let&apos;s talk
                <br />
                <em style={{ fontStyle: 'italic', color: T.gold }}>seriously.</em>
              </h2>
              <p style={{ fontSize: '0.97rem', lineHeight: 1.8, marginTop: 24, color: `rgba(${T.inkRgb},0.65)` }}>
                Whether it&apos;s trading, technology, or something I haven&apos;t thought of yet, I&apos;m always open to interesting conversations.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12, color: `rgba(${T.inkRgb},0.4)` }}>Email</div>
                <a
                  href={`mailto:${SITE.email}`}
                  data-cursor-hover="true"
                  style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.25rem', display: 'block', textDecoration: 'none', paddingBottom: 8, borderBottom: `0.5px solid rgba(${T.inkRgb},0.15)`, color: T.ink }}
                >
                  {SITE.email}
                </a>
              </div>
              <div className="contact-social-row" style={{ display: 'flex', gap: 20 }}>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-cursor-hover="true" onMouseEnter={spinOnHover} style={{ display: 'flex', color: accent('#FF5DA2', isDark), transition: 'color .2s', transformStyle: 'preserve-3d' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 01-1.38-.9 3.72 3.72 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56a5.88 5.88 0 00-2.13 1.39A5.88 5.88 0 00.63 4.15c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.3.79.71 1.46 1.39 2.13a5.88 5.88 0 002.13 1.39c.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.88 5.88 0 002.13-1.39 5.88 5.88 0 001.39-2.13c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.88 5.88 0 00-1.39-2.13A5.88 5.88 0 0019.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.41-10.4a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" /></svg>
                </a>
                <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" data-cursor-hover="true" onMouseEnter={spinOnHover} style={{ display: 'flex', color: accent('#A78BFA', isDark), transition: 'color .2s', transformStyle: 'preserve-3d' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.5 0 12.26c0 5.42 3.44 10.02 8.21 11.65.6.11.82-.27.82-.6 0-.29-.01-1.06-.02-2.08-3.34.74-4.04-1.64-4.04-1.64-.55-1.42-1.34-1.8-1.34-1.8-1.09-.76.08-.74.08-.74 1.21.09 1.84 1.26 1.84 1.26 1.08 1.86 2.83 1.33 3.52 1.02.11-.79.42-1.33.76-1.64-2.67-.31-5.47-1.36-5.47-6.03 0-1.33.46-2.42 1.23-3.28-.12-.31-.53-1.56.12-3.25 0 0 1-.33 3.3 1.25a11.3 11.3 0 016 0c2.29-1.58 3.29-1.25 3.29-1.25.66 1.69.24 2.94.12 3.25.77.86 1.23 1.95 1.23 3.28 0 4.68-2.8 5.72-5.48 6.02.43.38.81 1.13.81 2.28 0 1.65-.02 2.98-.02 3.39 0 .33.22.72.83.6C20.57 22.27 24 17.68 24 12.26 24 5.5 18.63 0 12 0z" /></svg>
                </a>
                <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" data-cursor-hover="true" onMouseEnter={spinOnHover} style={{ display: 'flex', color: accent('#4ECDC4', isDark), transition: 'color .2s', transformStyle: 'preserve-3d' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 11.02-4.12 2.06 2.06 0 01-.02 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" /></svg>
                </a>
              </div>
              <div className="contact-resume" style={{ marginLeft: -24 }}>
                <HoldConfirm href={SITE.resumeUrl} download borderColor={T.gold} bg="#0A0A0A" textColor="#FFFFFF">
                  Download résumé
                </HoldConfirm>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `0.5px solid rgba(${T.inkRgb},0.12)` }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(24px,3vw,36px)', margin: '0 0 32px', color: T.ink }}>
              Drop me a line <em style={{ fontStyle: 'italic', color: T.gold }}>directly.</em>
            </h3>
            <div className="contact-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, maxWidth: 640 }}>
              <input ref={nameRef} placeholder="Name" style={{ background: 'transparent', border: 'none', borderBottom: `0.5px solid rgba(${T.inkRgb},0.25)`, padding: '12px 0', color: T.ink, fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', outline: 'none' }} />
              <input ref={emailRef} placeholder="Email" style={{ background: 'transparent', border: 'none', borderBottom: `0.5px solid rgba(${T.inkRgb},0.25)`, padding: '12px 0', color: T.ink, fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', outline: 'none' }} />
              <input ref={subjectRef} placeholder="Subject" style={{ gridColumn: '1 / -1', background: 'transparent', border: 'none', borderBottom: `0.5px solid rgba(${T.inkRgb},0.25)`, padding: '12px 0', color: T.ink, fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', outline: 'none' }} />
              <textarea ref={messageRef} placeholder="Message" rows={3} style={{ gridColumn: '1 / -1', background: 'transparent', border: 'none', borderBottom: `0.5px solid rgba(${T.inkRgb},0.25)`, padding: '12px 0', color: T.ink, fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', outline: 'none', resize: 'none' }} />
              <div className="contact-send-row" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 20 }}>
                <EyeFollowButton onClick={onFakeSend} color="#FFFFFF" bg="#0A0A0A">
                  Send Message
                </EyeFollowButton>
                {sent && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: T.gold }}>✓ Message sent. I&apos;ll be in touch.</span>}
                {sendError && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#E06B5C' }}>{sendError}</span>}
              </div>
            </div>
          </div>

          <div className="contact-footer-row" style={{ marginTop: 64, paddingTop: 32, borderTop: `0.5px solid rgba(${T.inkRgb},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.15em', color: `rgba(${T.inkRgb},0.4)` }}>
              © 2026 {SITE.name}
            </span>
            {refreshLabel && (
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.08em', color: `rgba(${T.inkRgb},0.35)` }}>
                Stocks refresh in {refreshLabel}
              </span>
            )}
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.9rem', color: `rgba(${T.inkRgb},0.6)` }}>{SITE.location}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
