import { createClient } from "@supabase/supabase-js";

// Read Supabase environment variables via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("https://") &&
  supabaseAnonKey.length > 20 &&
  !supabaseUrl.includes("your-project-id") &&
  !supabaseAnonKey.includes("your_supabase_publishable")
);

if (!isSupabaseConfigured) {
  console.warn(
    "[EduConnect AI] Supabase credentials missing or invalid in .env. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are defined."
  );
}

// Create and export the official Supabase JavaScript client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export { supabaseUrl, supabaseAnonKey };

