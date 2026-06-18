import { createClient } from "@supabase/supabase-js";

let client;

export function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!process.env.SUPABASE_URL || !key) return null;
  if (!client) {
    client = createClient(process.env.SUPABASE_URL, key, {
      auth: { persistSession: false }
    });
  }
  return client;
}
