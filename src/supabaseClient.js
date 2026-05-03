import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[tilt] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — app will render in offline-only mode.')
}

export const supabase = createClient(SUPABASE_URL ?? 'https://placeholder.supabase.co', SUPABASE_ANON_KEY ?? 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
