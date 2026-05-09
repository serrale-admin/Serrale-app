import { getSupabaseClient } from "@serrale/auth";
import { api } from "./client";
import { ApiEnvelope, unwrapEnvelope } from "./utils";
import type { MeResponse, MobileSessionPayload, MobileSessionResponse } from "./types";

export async function createMobileSession(payload: MobileSessionPayload) {
  try {
    // Attempt backend login first
    const response = await api.post<ApiEnvelope<MobileSessionResponse>>("/api/auth/mobile-session", payload);
    return unwrapEnvelope(response.data);
  } catch (error) {
    console.warn("Backend mobile-session not found or failed, falling back to direct Supabase auth.");
    
    // Fallback to direct Supabase Auth
    const supabase = getSupabaseClient();
    const { data, error: sbError } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (sbError) throw sbError;
    if (!data.session) throw new Error("No session returned from Supabase");

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      role: data.user?.user_metadata?.role || "service_provider", // Defaulting to provider for this app context if metadata is missing
    };
  }
}

export async function logoutMobileSession() {
  await api.post("/api/auth/logout");
}

export async function fetchMe() {
  const response = await api.get<ApiEnvelope<MeResponse>>("/api/me");
  return unwrapEnvelope(response.data);
}
