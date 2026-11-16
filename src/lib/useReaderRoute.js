'use client';
// Full-screen readers (Writing posts, Research notes) behave like pages:
// opening one adds a browser history entry (#writing/<id>, #research/<slug>),
// so the browser / phone Back button closes it and returns to the homepage
// exactly where you left off. While a reader is open the page behind it is
// locked, so scrolling the article never moves the site underneath.
import { useEffect, useRef, useCallback } from 'react';

const base = () => window.location.pathname + window.location.search;

/**
 * @param prefix   hash prefix, e.g. 'writing'
 * @param openKey  id of the open item, or null
 * @param setKey   (key|null) => void, opens/closes the reader
 * @param ready    true once the items are loaded (for opening a shared link)
 * @returns close() for the reader's own Back button
 */
export function useReaderRoute(prefix, openKey, setKey, ready = true) {
  const pushed = useRef(false);
  const setKeyRef = useRef(setKey);
  useEffect(() => { setKeyRef.current = setKey; });
  const re = new RegExp(`^#${prefix}/(.+)$`);
  const keyFromHash = () => {
    const m = window.location.hash.match(re);
    return m ? decodeURIComponent(m[1]) : null;
  };

  // Opening a reader adds a history entry.
  useEffect(() => {
    if (openKey == null) return;
    const hash = `#${prefix}/${encodeURIComponent(openKey)}`;
    if (window.location.hash !== hash) {
      window.history.pushState(window.history.state, '', base() + hash);
      pushed.current = true;
    }
  }, [openKey, prefix]);

  // Back / Forward: the URL decides what's open.
  useEffect(() => {
    const sync = () => setKeyRef.current(keyFromHash());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefix]);

  // A shared link (kanishka-sarkar.com/#writing/<id>) opens that item, with
  // the homepage put underneath it so Back still lands on the site.
  useEffect(() => {
    if (!ready) return;
    const key = keyFromHash();
    if (key == null) return;
    window.history.replaceState(window.history.state, '', base());
    window.history.pushState(window.history.state, '', base() + `#${prefix}/${encodeURIComponent(key)}`);
    pushed.current = true;
    setKeyRef.current(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, prefix]);

  return useCallback(() => {
    if (pushed.current && keyFromHash() != null) {
      pushed.current = false;
      window.history.back(); // popstate closes the reader
    } else {
      if (keyFromHash() != null) window.history.replaceState(window.history.state, '', base());
      setKeyRef.current(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefix]);
}

/** Locks the page behind a full-screen reader and restores the exact scroll position after. */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    const y = window.scrollY;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
      window.scrollTo(0, y);
    };
  }, [active]);
}
