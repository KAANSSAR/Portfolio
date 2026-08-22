# Kanishka Sarkar — Portfolio

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your own values — see below
npm run dev                        # http://localhost:3000
```

`npm run build && npm run start` for a production build. This project has
**no forced static export** and no hosting-specific config, so it deploys
cleanly to Vercel as-is; if you go with GitHub Pages instead, add
`output: 'export'` to `next.config.ts` first (everything here is a client
component, so a static export should work, but hasn't been tested).

## Env vars (`.env.local`)

See `.env.local.example` for the full list with comments.

1. **Supabase public** (`NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY`) — used for
   reads only (published posts, quant-lab notes). Make sure your Supabase RLS
   policies only grant public `SELECT`, not `INSERT`/`UPDATE`/`DELETE` — see
   "Editor auth model" below for why that matters even with this fix in place.
2. **`BLOG_EDITOR_PASSWORD`** (server-only) — gates the in-page editor.
   Checked entirely server-side; never sent to the browser. Leave unset to
   disable the editor entirely — published content still renders.
3. **`BLOG_SESSION_SECRET`** (server-only) — signs the editor's session
   cookie. Generate with `openssl rand -hex 32`.
4. **`SUPABASE_SERVICE_ROLE_KEY`** (server-only) — from Supabase's Project
   Settings → API. Bypasses RLS entirely; only ever touched inside
   `src/app/api/editor/*` route handlers, after the session cookie is
   verified. **Rotate this immediately if it's ever exposed** (committed,
   pasted into a chat, etc.) — Supabase dashboard → Settings → API → roll key.
5. **EmailJS** (`NEXT_PUBLIC_EMAILJS_*`) — the Contact form. Defaults in code
   fall back to the IDs baked into the original mockup (a real, already-
   configured EmailJS account), so the form works out of the box without
   setting anything. Override if you want your own.

## Editor auth model

The original mockup checked the editor password with a plaintext client-side
string compare — meaning the password shipped in the JS bundle to every
visitor, and (separately) writes went straight from the browser to Supabase
using the anon key, gated only by that UI check, not by anything Supabase
itself enforced. Both are fixed here:

- `POST /api/editor/login` checks the password against `BLOG_EDITOR_PASSWORD`
  server-side and, on success, sets an httpOnly, signed session cookie
  (`src/lib/editorSession.ts`, HMAC-SHA256, 8h expiry). The password itself
  never reaches client JS.
- All writes (`posts` insert/update/delete, `quant_overrides` upsert, image
  uploads to Storage) go through `src/app/api/editor/*` route handlers, which
  verify that cookie (`src/lib/requireEditor.ts`) before touching Supabase —
  and they use the **service role key** server-side
  (`src/lib/supabaseAdmin.ts`), not the anon key, so they don't depend on
  your RLS policy allowing writes at all.
- Reads (`fetchPosts`, quant-lab overrides on load) still go straight from
  the browser via the anon key, which is the normal, intended pattern.

**One thing I can't do for you:** if your Supabase project's RLS currently
allows the anon key to `INSERT`/`UPDATE`/`DELETE` on `posts` or
`quant_overrides` (it must have, for the original design to have worked at
all), that hole still exists independently of this app's code — anyone with
browser devtools and your anon key could still write directly. Go into the
Supabase dashboard and either enable RLS with a policy that only allows
`SELECT` for the `anon` role, or drop write-granting policies for `anon`
entirely, so this app's server routes become the only way in.


## Structure

```
src/app/                 layout.tsx (fonts, metadata), page.tsx (composes all sections)
src/components/          global chrome: cursor, nav, theme toggle, 3D logo, chaos-grid bg
src/components/sections/ one file per page section (Hero, About, Experience, ...)
src/components/ui/       17 components ported ~as-is from the design handoff (see below)
src/context/             ThemeContext (dark/light tokens + view-transition toggle)
src/lib/data.ts          all site copy — timeline, projects, gallery, tracks, stats, etc.
public/                  images, audio, video, resume.pdf, research chart images
```

### About `src/components/ui/`

These 17 files (`ChaosGrid`, `Cube`, `ExperienceJourney`, `OrbitDotGlobe`,
`FlowingMenu`, `QuantLabSection`, `BlogSection`, etc.) are ported close to
verbatim from the design handoff — the interaction logic was already good
React, so it wasn't worth rewriting. Changes made during porting:

- Stripped the design-tool's runtime exports (`window.X = X`) in favor of
  normal `export default`
- Fixed relative asset paths to match this project's `public/` layout
- Swapped CDN-script-loaded Supabase/KaTeX for the npm packages already in
  `package.json`
- Moved secrets (Supabase key, editor password, EmailJS IDs) to env vars
- Given loose `.d.ts` shims (`ComponentType<any>`) rather than full prop
  types, and excluded from ESLint — they're vendored, not hand-written app
  code, so `// @ts-nocheck` sits at the top of each file on purpose

Everything else in `src/` (sections, layout, theme, cursor, data) is
written fresh against these components.

## What's simplified vs. the original design

- **Scroll**: the original hijacked the scrollbar entirely (custom rAF lerp,
  mouse-wheel intercepted) for a heavier "smooth scroll" feel. This build
  uses native smooth scrolling (`scrollIntoView`/`scrollTo` with
  `behavior: 'smooth'`) for nav clicks instead — less custom physics, more
  robust and accessible, same end result.
- **Custom cursor**: only replaces the native cursor on devices with a fine
  pointer (`pointer: fine`) — on touch devices the native cursor (i.e. none)
  is left alone, since `cursor: none` everywhere breaks mobile usability and
  the original design didn't account for touch.
- **Stock-refresh footer label**: the original contact footer showed a
  "Stocks refresh in Xh Ym" countdown tied to `window.__cubeNextRefreshAt`,
  which is set by a stock-data mechanism that wasn't present anywhere in the
  handoff bundle. Dropped rather than guessed at.
- A handful of vestigial handlers in the original (`onDockMove`/`onDockLeave`,
  gallery-strip drag, the divider-drag split-view) weren't wired to any
  visible markup in `Portfolio Rebuild.dc.html` and look like leftovers from
  an earlier design iteration — not ported.

## Research/Quant Lab content — confirmed

`QuantLabSection.jsx` is the source of truth (matches what's live, has the
latest edits) — that's what's wired into the page. The separate TypeScript
package in the original `uploads/` folder (`research-notes-package/`,
`research-content-update/` — typed content, `SlideDeck.tsx`, `Equation.tsx`,
a `/research/[slug]` route) was earlier reference material, not confirmed
newer, and isn't merged in. Its structure is worth revisiting later if you
want standalone shareable URLs per research note — the pattern's still
sitting there if useful — but its content shouldn't override
`QuantLabSection.jsx`.

## Not yet resolved

- **Supabase RLS on the `anon` role** — see "Editor auth model" above. This
  needs to be tightened on the Supabase dashboard side; I don't have
  credentials to do it myself, and confirmed I was never given a service or
  secret key in this conversation — only the publishable/anon key that was
  already in the design files (`sb_publishable_...`, safe to keep public).
  If a service key really was shared somewhere else, rotate it regardless of
  where, as a precaution.
