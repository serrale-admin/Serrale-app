import { getSupabaseConfig } from "@serrale/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) {
    return client;
  }

  const config = getSupabaseConfig();

  if (!config) {
    throw new Error(
      "Supabase config missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  client = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  return client;
}
