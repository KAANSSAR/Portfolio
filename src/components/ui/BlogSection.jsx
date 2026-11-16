// @ts-nocheck -- ported design-tool component; kept as loosely-typed JS on purpose.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { getSb } from '@/lib/supabaseClient';
import { noEmDash } from '@/lib/noEmDash';
// No client-side password here on purpose, the editor gate is checked
// server-side via /api/editor/login, which is the only place that ever
// sees BLOG_EDITOR_PASSWORD. See src/lib/editorSession.ts.

function TagPicker({ value, allTags, onChange, accentColor, line, ink, inkFaint }) {
  const [newTag, setNewTag] = useState('');
  const selected = value.split(',').map(t => t.trim()).filter(Boolean);
  const toggle = (t) => {
    const next = selected.includes(t) ? selected.filter(x => x !== t) : selected.concat(t);
    onChange(next.join(', '));
  };
  const addNew = () => {
    const t = newTag.trim();
    if (!t || selected.includes(t)) { setNewTag(''); return; }
    onChange(selected.concat(t).join(', '));
    setNewTag('');
  };
  const unseen = allTags.filter(t => !selected.includes(t));
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {selected.map(t => (
          <span key={t} onClick={() => toggle(t)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 3, border: `1px solid ${accentColor}`, background: accentColor, color: '#0A0A0A' }}>{t} ×</span>
        ))}
        {unseen.map(t => (
          <span key={t} onClick={() => toggle(t)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 3, border: `1px solid ${line}`, background: 'transparent', color: inkFaint }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="New tag" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNew()}
          style={{ flex: 1, padding: '8px 10px', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', border: `1px solid ${line}`, borderRadius: 6, background: 'transparent', color: ink, outline: 'none' }} />
        <button onClick={addNew} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${line}`, background: 'transparent', color: ink, fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', cursor: 'pointer' }}>Add</button>
      </div>
    </div>
  );
}

function PostCard({ p, accentColor, onClick, editMode }) {
  return (
    <div onClick={onClick} data-cursor-hover="true" style={{ flex: '0 0 300px', borderRadius: 10, overflow: 'hidden', border: editMode ? `1px dashed ${accentColor}` : '1px solid rgba(255,255,255,0.1)', background: '#141210', cursor: 'pointer' }}>
      <div style={{ background: accentColor, padding: '9px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.05em', color: '#0A0A0A' }}>{p.num ? `Note ${p.num}` : 'Post'}</span>
        <span style={{ display: 'flex', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(10,10,10,0.4)' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(10,10,10,0.4)' }} />
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(10,10,10,0.4)' }} />
        </span>
      </div>
      <div style={{ padding: '26px 20px 24px' }}>
        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.05rem', color: '#F2EEE6', marginBottom: 10, lineHeight: 1.25 }}>{p.title}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#8C8676', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.summary}</div>
      </div>
    </div>
  );
}

function PostCarousel({ items, accentColor, onOpen, editMode }) {
  const scrollRef = useRef(null);
  const scrollBy = dir => { if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 324, behavior: 'smooth' }); };
  return (
    <div style={{ position: 'relative' }}>
      <span onClick={() => scrollBy(-1)} data-cursor-hover="true" className="carousel-arrow" style={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 2, cursor: 'pointer', fontSize: '1.6rem', color: accentColor, background: '#141210', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>‹</span>
      <div ref={scrollRef} className="carousel-track" style={{ display: 'flex', gap: 24, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '4px 2px 12px', scrollbarWidth: 'none' }}>
        {items.map((p, i) => <div key={p.id || i} className="carousel-card" style={{ scrollSnapAlign: 'start' }}><PostCard p={p} accentColor={accentColor} onClick={() => onOpen(p)} editMode={editMode} /></div>)}
      </div>
      <span onClick={() => scrollBy(1)} data-cursor-hover="true" className="carousel-arrow" style={{ position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 2, cursor: 'pointer', fontSize: '1.6rem', color: accentColor, background: '#141210', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>›</span>
    </div>
  );
}

function BlogSection({
  category = 'blog',
  sectionLabel = 'Blog',
  heading = 'Notes & Writing',
  accentColor = '#FF6B6B',
  labelColor = accentColor,
  ink = '#0A0A0A',
  inkFaint = '#8C8C8C',
  inkMuted = '#4D4D4D',
  bg = '#FFFFFF',
  line = 'rgba(10,10,10,0.12)',
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(true);
  const [activePost, setActivePost] = useState(null);
  const [editing, setEditing] = useState(null); // post being edited, or {} for new
  useEffect(() => {
    document.body.dataset.fullscreenOverlay = (activePost || editing) ? '1' : '';
    return () => { document.body.dataset.fullscreenOverlay = ''; };
  }, [activePost, editing]);
  const [authed, setAuthed] = useState(false);
  const [pwPrompt, setPwPrompt] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const bodyRef = useRef(null);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', summary: '', tags: '', cover_image: '', num: '' });
  const [editMode, setEditMode] = useState(false);
  const [activeTag, setActiveTag] = useState(null);

  const fetchPosts = useCallback(() => {
    const sb = getSb();
    if (!sb) return;
    setLoading(true);
    sb.from('posts').select('*').eq('category', category).eq('published', true).order('created_at', { ascending: false })
      .then(({ data, error }) => { setLoading(false); if (!error && data) setPosts(noEmDash(data)); });
  }, [category]);
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || [])));
  const filteredPosts = activeTag ? posts.filter(p => (p.tags || []).includes(activeTag)) : posts;

  useEffect(() => { if (ready) fetchPosts(); }, [ready, fetchPosts]);

  // Restore editor auth state from the httpOnly session cookie (the cookie
  // itself is unreadable from JS, this just asks the server if it's valid).
  useEffect(() => {
    fetch('/api/editor/status').then(r => r.json()).then(d => setAuthed(!!d.authed)).catch(() => {});
  }, []);

  const openNew = () => {
    setForm({ title: '', subtitle: '', summary: '', tags: '', cover_image: '', num: category === 'quant' ? String(posts.length + 1).padStart(2, '0') : '' });
    setEditing({});
  };
  const openEdit = (p) => {
    setForm({ title: p.title || '', subtitle: p.subtitle || '', summary: p.summary || '', tags: (p.tags || []).join(', '), cover_image: p.cover_image || '', num: p.num || '' });
    setEditing(p);
    setTimeout(() => { if (bodyRef.current) bodyRef.current.innerHTML = p.body_html || ''; }, 0);
  };
  const submitPassword = () => {
    fetch('/api/editor/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwInput }),
    })
      .then(r => r.json())
      .then(d => { if (d.ok) { setAuthed(true); setPwPrompt(false); } setPwInput(''); })
      .catch(() => setPwInput(''));
  };
  const lockEditor = () => {
    setAuthed(false);
    fetch('/api/editor/logout', { method: 'POST' }).catch(() => {});
  };

  const uploadImage = (file, cb) => {
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('prefix', category);
    fetch('/api/editor/upload', { method: 'POST', body })
      .then(r => r.json())
      .then(d => { setUploading(false); if (d.ok) cb(d.url); })
      .catch(() => setUploading(false));
  };

  const savePost = () => {
    const payload = {
      category, title: form.title, subtitle: form.subtitle || null, summary: form.summary,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      cover_image: form.cover_image || null, num: form.num || null,
      body_html: bodyRef.current ? bodyRef.current.innerHTML : '', published: true,
    };
    const url = editing && editing.id ? `/api/editor/posts/${editing.id}` : '/api/editor/posts';
    const method = editing && editing.id ? 'PATCH' : 'POST';
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(r => r.json())
      .then(d => { if (d.ok) { setEditing(null); fetchPosts(); } })
      .catch(() => {});
  };

  const deletePost = (p) => {
    fetch(`/api/editor/posts/${p.id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(d => { if (d.ok) { setActivePost(null); fetchPosts(); } })
      .catch(() => {});
  };

  const exec = (cmd, val) => { document.execCommand(cmd, false, val); bodyRef.current && bodyRef.current.focus(); };
  const insertCode = () => {
    const code = prompt('Paste code:');
    if (!code) return;
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    exec('insertHTML', `<pre style="background:#0D0D0D;color:#E8E4DC;border-radius:8px;padding:16px 18px;font-family:'DM Mono',monospace;font-size:0.8rem;line-height:1.6;overflow-x:auto;white-space:pre;">${escaped}</pre><p><br></p>`);
  };

  return (
    <div>
      <div className="sec-label" style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, color: inkFaint }}>
        <span style={{ color: labelColor }}>{sectionLabel}</span>
        <span style={{ flex: 1, height: 1, maxWidth: 80, background: labelColor, opacity: 0.4 }} />
        <span onClick={() => authed && setEditMode(m => !m)} data-cursor-hover="true" style={{ cursor: authed ? 'pointer' : 'default', color: editMode ? labelColor : inkFaint, opacity: authed ? 1 : 0.4 }}>Edit</span>
        <span onClick={() => authed ? openNew() : setPwPrompt(true)} data-cursor-hover="true" style={{ cursor: 'pointer', color: authed ? labelColor : inkFaint, opacity: authed ? 1 : 0.4 }}>New</span>
        <span onClick={() => authed ? lockEditor() : setPwPrompt(true)} data-cursor-hover="true" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={authed ? 'Unlocked, click to lock' : 'Locked, click to unlock'}>
          {authed ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={labelColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 017.75-1.5" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0" /></svg>
          )}
        </span>
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', fontSize: 'clamp(32px,4vw,52px)', margin: '0 0 20px', color: ink }}>{heading}</h2>

      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          <span onClick={() => setActiveTag(null)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 3, border: `1px solid ${!activeTag ? accentColor : line}`, background: !activeTag ? accentColor : 'transparent', color: !activeTag ? '#0A0A0A' : inkFaint }}>All</span>
          {allTags.map(t => (
            <span key={t} onClick={() => setActiveTag(t)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 3, border: `1px solid ${activeTag === t ? accentColor : line}`, background: activeTag === t ? accentColor : 'transparent', color: activeTag === t ? '#0A0A0A' : inkFaint }}>{t}</span>
          ))}
        </div>
      )}

      {!loading && filteredPosts.length === 0 && (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: inkFaint, padding: '24px 0', borderTop: `0.5px solid ${line}` }}>{posts.length === 0 ? 'Coming soon.' : 'No posts with this tag.'}</div>
      )}

      {!loading && filteredPosts.length > 0 && <PostCarousel items={filteredPosts} accentColor={accentColor} editMode={editMode} onOpen={p => editMode ? openEdit(p) : setActivePost(p)} />}

      {pwPrompt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPwPrompt(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: bg, padding: 32, borderRadius: 12, width: 280 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: inkFaint, marginBottom: 12 }}>Editor password</div>
            <input type="password" value={pwInput} onChange={e => setPwInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitPassword()} autoFocus
              style={{ width: '100%', padding: '10px 12px', fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', border: `1px solid ${line}`, borderRadius: 6, background: 'transparent', color: ink, marginBottom: 12 }} />
            <button onClick={submitPassword} style={{ width: '100%', padding: '10px 0', borderRadius: 6, border: 'none', background: accentColor, color: '#0A0A0A', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Unlock</button>
          </div>
        </div>
      )}

      {activePost && !editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: bg, overflowY: 'auto' }}>
          <div className="reader-body" style={{ maxWidth: 780, margin: '0 auto', padding: '80px 32px 120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <span onClick={() => setActivePost(null)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: inkFaint }}>← Back</span>
              {authed && (
                <span style={{ display: 'flex', gap: 16 }}>
                  <span onClick={() => openEdit(activePost)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: accentColor }}>Edit</span>
                  <span onClick={() => deletePost(activePost)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#FF6B6B' }}>Delete</span>
                </span>
              )}
            </div>
            {activePost.tags && activePost.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {activePost.tags.map((t, ti) => <span key={ti} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', border: `0.5px solid ${accentColor}`, borderRadius: 2, color: accentColor }}>{t}</span>)}
              </div>
            )}
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(32px,5vw,56px)', lineHeight: 1.1, color: ink, margin: '0 0 12px' }}>{activePost.title}</h1>
            {activePost.subtitle && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', color: inkFaint, marginBottom: 32 }}>{activePost.subtitle}</div>}
            {activePost.cover_image && <img src={activePost.cover_image} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 40 }} />}
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.05rem', lineHeight: 1.75, color: ink }} dangerouslySetInnerHTML={{ __html: activePost.body_html || '' }} />
          </div>
        </div>
      )}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 350, background: bg, overflowY: 'auto' }}>
          <div className="reader-body" style={{ maxWidth: 780, margin: '0 auto', padding: '60px 32px 120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <span onClick={() => setEditing(null)} data-cursor-hover="true" style={{ cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: inkFaint }}>Cancel</span>
              <button onClick={savePost} style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: accentColor, color: '#0A0A0A', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Save & publish</button>
            </div>
            <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ width: '100%', border: 'none', borderBottom: `1px solid ${line}`, background: 'transparent', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '2rem', color: ink, padding: '8px 0', marginBottom: 16, outline: 'none' }} />
            {category === 'quant' && (
              <input placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                style={{ width: '100%', border: 'none', borderBottom: `1px solid ${line}`, background: 'transparent', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', color: inkMuted, padding: '8px 0', marginBottom: 16, outline: 'none' }} />
            )}
            <textarea placeholder="One-line summary" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={2}
              style={{ width: '100%', border: `1px solid ${line}`, borderRadius: 6, background: 'transparent', fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: ink, padding: '10px 12px', marginBottom: 16, outline: 'none', resize: 'vertical' }} />
            <TagPicker value={form.tags} allTags={allTags} onChange={t => setForm({ ...form, tags: t })} accentColor={accentColor} line={line} ink={ink} inkFaint={inkFaint} />
            <div style={{ marginBottom: 16 }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadImage(e.target.files[0], url => setForm(f => ({ ...f, cover_image: url })))} />
              <button onClick={() => fileRef.current.click()} style={{ padding: '8px 14px', borderRadius: 6, border: `1px solid ${line}`, background: 'transparent', color: ink, fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', cursor: 'pointer' }}>{uploading ? 'Uploading…' : form.cover_image ? 'Cover image ✓' : 'Upload cover image'}</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, borderBottom: `1px solid ${line}`, paddingBottom: 8 }}>
              <button onClick={() => exec('bold')} style={{ padding: '6px 10px', fontWeight: 700, border: `1px solid ${line}`, background: 'transparent', color: ink, cursor: 'pointer', borderRadius: 4 }}>B</button>
              <button onClick={() => exec('formatBlock', 'H2')} style={{ padding: '6px 10px', border: `1px solid ${line}`, background: 'transparent', color: ink, cursor: 'pointer', borderRadius: 4 }}>H2</button>
              <button onClick={() => { const url = prompt('Link URL:'); if (url) exec('createLink', url); }} style={{ padding: '6px 10px', border: `1px solid ${line}`, background: 'transparent', color: ink, cursor: 'pointer', borderRadius: 4 }}>Link</button>
              <button onClick={insertCode} style={{ padding: '6px 10px', border: `1px solid ${line}`, background: 'transparent', color: ink, cursor: 'pointer', borderRadius: 4, fontFamily: "'DM Mono', monospace" }}>{'</>'}</button>
              <button onClick={() => fileRef.current.click() || (fileRef.current.onchange = e => uploadImage(e.target.files[0], url => exec('insertImage', url)))} style={{ padding: '6px 10px', border: `1px solid ${line}`, background: 'transparent', color: ink, cursor: 'pointer', borderRadius: 4 }}>Image</button>
            </div>
            <div ref={bodyRef} contentEditable suppressContentEditableWarning style={{ minHeight: 300, fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', lineHeight: 1.7, color: ink, outline: 'none' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogSection;
