"use client";

import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return browserClient;
}

export function buildStudioRealtimeChannelName(
  projectNumber: string,
  studioId: string
) {
  return `policy-lab:${projectNumber.trim().toUpperCase()}:${studioId}`;
}

export function removeRealtimeChannel(channel: RealtimeChannel | null) {
  if (!channel) return;

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  void supabase.removeChannel(channel);
}
