import { NextRequest, NextResponse } from 'next/server';
import { requireEditor } from '@/lib/requireEditor';
import { basicAuth, redirectUri } from '@/lib/spotify';

const page = (title: string, body: string) =>
  new NextResponse(
    `<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="font-family:system-ui;max-width:640px;margin:60px auto;padding:0 20px;line-height:1.6;background:#0A0A0A;color:#F2EEE6">
<h1 style="font-size:22px">${title}</h1>${body}</body>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );

// Step 2: Spotify sends you back here. The refresh token is shown once so you
// can paste it into Vercel as SPOTIFY_REFRESH_TOKEN. It is never stored here.
export async function GET(req: NextRequest) {
  const denied = requireEditor(req);
  if (denied) return page('Not authorised', '<p>Log in to the blog editor first.</p>');

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');
  if (error) return page('Spotify said no', `<p>${error}</p>`);
  if (!code || !state || state !== req.cookies.get('spotify_state')?.value) {
    return page('Something went wrong', '<p>The login expired or did not match. Open /api/spotify/login again.</p>');
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: basicAuth(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri(req.nextUrl.origin) }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok || !data.refresh_token) {
    return page('Token exchange failed', `<p>${data.error_description || data.error || res.status}</p>`);
  }

  const out = page(
    'Spotify connected',
    `<p>Copy this into Vercel as <code>SPOTIFY_REFRESH_TOKEN</code> (Settings, Environment Variables), then redeploy.</p>
<textarea readonly style="width:100%;height:120px;background:#111;color:#E6C66B;border:1px solid #333;padding:10px;font:13px monospace" onclick="this.select()">${data.refresh_token}</textarea>
<p style="color:#8C8676">Spotify makes this expire six months from today. When the list disappears from the site, repeat these steps.</p>`,
  );
  out.cookies.delete('spotify_state');
  return out;
}
