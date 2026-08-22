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
  if (!payload || typeof payload.slug !== 'string' || payload.data == null) {
    return NextResponse.json({ ok: false, error: 'Expected { slug, data }.' }, { status: 400 });
  }

  const { error } = await admin.from('quant_overrides').upsert({ slug: payload.slug, data: payload.data });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
