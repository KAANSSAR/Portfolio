import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SB_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Module-level singleton — every caller (QuantLabSection, BlogSection, ...)
// shares this one instance instead of each creating its own, which is what
// was triggering Supabase's "Multiple GoTrueClient instances" warning.
let _client: SupabaseClient | null = null;

export function getSb(): SupabaseClient | null {
  if (_client) return _client;
  if (!SB_URL || !SB_ANON_KEY) return null;
  _client = createClient(SB_URL, SB_ANON_KEY);
  return _client;
}
