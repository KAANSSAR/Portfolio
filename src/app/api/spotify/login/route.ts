import { NextRequest, NextResponse } from 'next/server';
import { requireEditor } from '@/lib/requireEditor';
import { SPOTIFY_SCOPES, redirectUri, spotifyConfigured } from '@/lib/spotify';

// Step 1 of the one-time Spotify connection. Only works while you're logged
// in as the blog editor, so nobody else can connect their account.
export async function GET(req: NextRequest) {
  const denied = requireEditor(req);
  if (denied) return new NextResponse('Log in to the blog editor on the site first, then open this page again.', { status: 401 });
  if (!spotifyConfigured()) return new NextResponse('Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to the environment first.', { status: 503 });

  const state = crypto.randomUUID();
  const url = new URL('https://accounts.spotify.com/authorize');
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: SPOTIFY_SCOPES,
    redirect_uri: redirectUri(req.nextUrl.origin),
    state,
  }).toString();
  const res = NextResponse.redirect(url);
  res.cookies.set('spotify_state', state, { httpOnly: true, secure: req.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 600 });
  return res;
}
