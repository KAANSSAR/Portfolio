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

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  const prefix = typeof form?.get('prefix') === 'string' ? (form!.get('prefix') as string) : 'uploads';
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file provided.' }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const safePrefix = prefix.replace(/[^a-z0-9/_-]/gi, '');
  const path = `${safePrefix}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;

  const { error } = await admin.storage.from('post-images').upload(path, bytes, {
    contentType: file.type || 'application/octet-stream',
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const { data: pub } = admin.storage.from('post-images').getPublicUrl(path);
  return NextResponse.json({ ok: true, url: pub.publicUrl });
}
