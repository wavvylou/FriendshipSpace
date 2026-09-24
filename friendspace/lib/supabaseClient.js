'use client';

import { createBrowserClient } from '@supabase/ssr';

// One client per browser tab, safe to import anywhere in client components.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
