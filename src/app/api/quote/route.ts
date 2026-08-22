import { NextRequest, NextResponse } from 'next/server';

// Proxies Cube.jsx's stock/crypto ticker fetches so the Twelve Data API key
// stays server-only. All the caching (localStorage, 2h TTL) and client-side
// rate-limiting (1 call/9s) logic in Cube.jsx is unchanged — this route just
// stands in for the direct api.twelvedata.com call it used to make.
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol');
  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol' }, { status: 400 });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Twelve Data API key not configured on the server.' }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Upstream fetch failed.' }, { status: 502 });
  }
}
