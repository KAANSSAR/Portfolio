import { createClient, SupabaseClient } from '@supabase/supabase-js';

// SERVER ONLY. This uses the Supabase *service role* key, which bypasses
// Row Level Security entirely. Never import this file from a 'use client'
// component or expose SUPABASE_SERVICE_ROLE_KEY with a NEXT_PUBLIC_ prefix,
// doing either would ship it to the browser.
let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}
