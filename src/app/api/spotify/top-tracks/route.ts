import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/spotify';

const RANGES = new Set(['short_term', 'medium_term', 'long_term']);
const DAY = 60 * 60 * 24;

type Track = { name: string; artist: string; image: string | null; url: string };
const memo = new Map<string, { at: number; tracks: Track[] }>();

// Public, cached once a day per time range, so visitors never hit Spotify's
// quota directly. Returns { tracks: [] } when Spotify is not set up, and the
// section on the page simply hides.
export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get('range') || 'short_term';
  if (!RANGES.has(range)) return NextResponse.json({ error: 'Bad range' }, { status: 400 });

  const hit = memo.get(range);
  if (hit && Date.now() - hit.at < DAY * 1000) return respond(hit.tracks);

  try {
    const token = await getAccessToken();
    const res = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${range}&limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Spotify ${res.status}`);
    const data = await res.json();
    const tracks: Track[] = (data.items || []).map((t: any) => ({
      name: t.name,
      artist: (t.artists || []).map((a: any) => a.name).join(', '),
      image: t.album?.images?.slice(-2)[0]?.url || t.album?.images?.[0]?.url || null,
      url: t.external_urls?.spotify,
    }));
    memo.set(range, { at: Date.now(), tracks });
    return respond(tracks);
  } catch {
    // keep serving yesterday's list if Spotify is down or the token expired
    if (hit) return respond(hit.tracks);
    return NextResponse.json({ tracks: [] }, { headers: { 'Cache-Control': 's-maxage=300' } });
  }
}

function respond(tracks: Track[]) {
  return NextResponse.json({ tracks }, { headers: { 'Cache-Control': `public, s-maxage=${DAY}, stale-while-revalidate=${DAY}` } });
}
