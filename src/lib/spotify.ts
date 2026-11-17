// Server-only helpers for the "On repeat" list in the About section.
// Needs SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN.
// Spotify refresh tokens for development-mode apps expire six months after
// the first login, so /api/spotify/login has to be run again twice a year.

export const SPOTIFY_SCOPES = 'user-top-read';

export function spotifyConfigured() {
  return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

export function basicAuth() {
  return 'Basic ' + Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
}

export function redirectUri(origin: string) {
  return `${origin}/api/spotify/callback`;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/** Swaps the long-lived refresh token for a short-lived access token, cached in memory. */
export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!spotifyConfigured() || !refresh) throw new Error('Spotify is not configured.');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: basicAuth(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(`Token refresh failed: ${data.error_description || data.error || res.status}`);
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return cachedToken.value;
}
