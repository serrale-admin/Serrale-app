import { api } from "./client";
import { ApiEnvelope, unwrapEnvelope } from "./index";
import type { MeResponse, MobileSessionPayload, MobileSessionResponse } from "./types";

export async function createMobileSession(payload: MobileSessionPayload) {
  const response = await api.post<ApiEnvelope<MobileSessionResponse>>("/api/auth/mobile-session", payload);
  return unwrapEnvelope(response.data);
}

export async function logoutMobileSession() {
  await api.post("/api/auth/logout");
}

export async function fetchMe() {
  const response = await api.get<ApiEnvelope<MeResponse>>("/api/me");
  return unwrapEnvelope(response.data);
}
