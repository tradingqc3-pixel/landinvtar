import { createClient } from '@supabase/supabase-js';

/**
 * Standard Vite environment variable extraction.
 * VITE_ prefix is required for client-side exposure.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail-fast with clear messaging if configuration is missing
if (!supabaseUrl || !supabaseAnonKey) {
  const missing = !supabaseUrl ? 'VITE_SUPABASE_URL' : 'VITE_SUPABASE_ANON_KEY';
  console.error(`[Supabase] Initialization failed: ${missing} is not defined in .env`);
}

/**
 * Single instance of Supabase client.
 * Fallback values are provided but VITE environment variables take precedence.
 */
export const supabase = createClient(
  supabaseUrl || 'https://sodzuknsemsqaiakevjp.supabase.co',
  supabaseAnonKey || ''
);

/**
 * Helper to check if the current request was blocked by the browser.
 */
export const isNetworkError = (error: any) => {
  return error instanceof TypeError && error.message === 'Failed to fetch';
};

export default supabase;
