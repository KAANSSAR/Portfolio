import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, safeCompare, EDITOR_COOKIE_NAME, EDITOR_COOKIE_MAX_AGE } from '@/lib/editorSession';

export async function POST(req: NextRequest) {
  const real = process.env.BLOG_EDITOR_PASSWORD;
  if (!real) {
    return NextResponse.json({ ok: false, error: 'Editor password is not configured on the server.' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!password || !safeCompare(password, real)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(EDITOR_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: EDITOR_COOKIE_MAX_AGE,
  });
  return res;
}
