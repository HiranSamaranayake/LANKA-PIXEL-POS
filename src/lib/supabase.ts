import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Allow session/local override if configured in the setup modal
const storageUrl = typeof window !== 'undefined' ? localStorage.getItem('lp_supabase_url') : null;
const storageKey = typeof window !== 'undefined' ? localStorage.getItem('lp_supabase_anon_key') : null;

const effectiveUrl = (storageUrl || envUrl || '').trim();
const effectiveKey = (storageKey || envAnonKey || '').trim();

// Check if credentials are valid non-placeholder values
export const isSupabaseConfigured = Boolean(
  effectiveUrl &&
    effectiveKey &&
    effectiveUrl.startsWith('https://') &&
    !effectiveUrl.includes('your-project') &&
    effectiveKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(effectiveUrl, effectiveKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('lp_supabase_url', url.trim());
  localStorage.setItem('lp_supabase_anon_key', key.trim());
  window.location.reload();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('lp_supabase_url');
  localStorage.removeItem('lp_supabase_anon_key');
  window.location.reload();
};
