// Site-wide rule: no em dashes. Content loaded from Supabase (blog posts,
// research overrides) is passed through this so anything typed in the
// editor is cleaned at render time too.
export function noEmDash(v) {
  if (typeof v === 'string') return v.replace(/\s*(\u2014|&mdash;|&#8212;)\s*/g, ', ');
  if (Array.isArray(v)) return v.map(noEmDash);
  if (v && typeof v === 'object') {
    const out = {};
    for (const k in v) out[k] = noEmDash(v[k]);
    return out;
  }
  return v;
}
