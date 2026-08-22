import { NextRequest, NextResponse } from 'next/server';
import { requireEditor } from '@/lib/requireEditor';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const denied = requireEditor(req);
  if (denied) return denied;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Supabase admin client is not configured on the server.' }, { status: 503 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid body.' }, { status: 400 });
  }

  const { data, error } = await admin.from('posts').insert(payload).select().single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, post: data });
}
