import { api } from "./client";
import type { MeResponse, MobileSessionPayload, MobileSessionResponse } from "./types";

export async function createMobileSession(payload: MobileSessionPayload) {
  const response = await api.post<MobileSessionResponse>("/api/auth/mobile-session", payload);
  return response.data;
}

export async function logoutMobileSession() {
  await api.post("/api/auth/logout");
}

export async function fetchMe() {
  const response = await api.get<MeResponse>("/api/me");
  return response.data;
}
