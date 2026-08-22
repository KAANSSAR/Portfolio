import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, EDITOR_COOKIE_NAME } from './editorSession';

/** Returns a 401 response if the request has no valid editor session, or null if it's authorized. */
export function requireEditor(req: NextRequest): NextResponse | null {
  const token = req.cookies.get(EDITOR_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ ok: false, error: 'Not authorized.' }, { status: 401 });
  }
  return null;
}
