import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, EDITOR_COOKIE_NAME } from '@/lib/editorSession';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(EDITOR_COOKIE_NAME)?.value;
  return NextResponse.json({ authed: verifySessionToken(token) });
}
