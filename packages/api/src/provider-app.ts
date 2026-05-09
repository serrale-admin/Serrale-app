import { api } from "./client";
import { ApiEnvelope, unwrapEnvelope, unwrapMaybeEnvelope } from "./utils";
import type {
  PortfolioItem,
  ProviderBootstrap,
  ProviderDashboard,
  ProviderDetails,
  ProviderService,
} from "./types";

export function normalizeProviderBootstrap(raw: any): ProviderBootstrap {
  const profile = raw.profile || {};

  const user = raw.user || {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    full_name: profile.full_name || profile.name || "Provider",
    avatar_url: profile.avatar_url || null
  };

  return {
    user,
    profile: {
      ...profile,
      full_name: profile.full_name || profile.name || "Provider",
      is_verified: Boolean(
        profile.is_verified ||
        profile.verified_identity ||
        raw.verification?.verified_identity
      ),
      verification_status:
        profile.verification_status ||
        raw.verification?.verification_status ||
        "not_requested",
      completeness_score:
        profile.completeness_score ||
        raw.completeness?.score ||
        0
    },
    completeness: raw.completeness || {
      score: profile.completeness_score || 0,
      state: profile.completeness_state || "INCOMPLETE"
    },
    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    catalog: Array.isArray(raw.catalog) ? raw.catalog : [],
    portfolio: Array.isArray(raw.portfolio) ? raw.portfolio : [],
    services: Array.isArray(raw.services) ? raw.services : [],
    verification: raw.verification || {
      verification_status: profile.verification_status || "not_requested",
      verified_identity: Boolean(profile.verified_identity),
      requests: []
    },
    settings: raw.settings || {}
  };
}

// Core Provider APIs
export async function getProviderBootstrap() {
  const response = await api.get<ApiEnvelope<any> | any>("/api/provider/bootstrap");
  const raw = unwrapMaybeEnvelope(response.data);
  return normalizeProviderBootstrap(raw);
}

export async function getProviderDashboard() {
  const response = await api.get<ApiEnvelope<any>>("/api/provider/dashboard");
  const raw = unwrapEnvelope(response.data);
  
  // Normalize response to be resilient to backend structure variations
  return {
    provider_name: raw.provider_name || raw.profile?.full_name || raw.profile?.name || "Provider",
    profile_completion: raw.profile_completion || raw.completeness?.score || raw.readiness?.score || raw.profile?.completeness_score || 0,
    verification_status: raw.verification_status || raw.verification?.verification_status || raw.profile?.verification_status || "not_started",
    skills_count: raw.skills_count || raw.skills?.length || raw.skills?.count || 0,
    portfolio_count: raw.portfolio_count || raw.portfolio?.length || raw.portfolio?.count || 0,
    services_count: raw.services_count || raw.services?.length || raw.services?.count || 0,
    next_actions: raw.next_actions || raw.readiness?.next_actions || []
  } as ProviderDashboard;
}

// Profile & Avatar
export async function getProviderProfile() {
  const response = await api.get<ApiEnvelope<ProviderDetails>>("/api/provider/profile");
  return unwrapEnvelope(response.data);
}

export async function updateProviderProfile(payload: Partial<ProviderDetails>) {
  const response = await api.patch<ApiEnvelope<ProviderDetails>>("/api/provider/profile", payload);
  return unwrapEnvelope(response.data);
}

export async function updateProviderAvatar(formData: FormData) {
  const response = await api.post<ApiEnvelope<{ avatar_url: string }>>("/api/provider/avatar", formData);
  return unwrapEnvelope(response.data);
}

// Skills
export async function getProviderSkills() {
  const response = await api.get<ApiEnvelope<any[]>>("/api/provider/skills");
  return unwrapEnvelope(response.data);
}

export async function addProviderSkill(skillId: string) {
  const response = await api.post<ApiEnvelope<any>>("/api/provider/skills", { skill_id: skillId });
  return unwrapEnvelope(response.data);
}

export async function deleteProviderSkill(id: string) {
  await api.delete(`/api/provider/skills/${id}`);
}

// Portfolio
export async function getProviderPortfolio() {
  const response = await api.get<ApiEnvelope<PortfolioItem[]>>("/api/provider/portfolio");
  return unwrapEnvelope(response.data);
}

export async function createPortfolioItem(payload: Partial<PortfolioItem>) {
  const response = await api.post<ApiEnvelope<PortfolioItem>>("/api/provider/portfolio", payload);
  return unwrapEnvelope(response.data);
}

export async function updatePortfolioItem(itemId: string, payload: Partial<PortfolioItem>) {
  const response = await api.patch<ApiEnvelope<PortfolioItem>>(`/api/provider/portfolio/${itemId}`, payload);
  return unwrapEnvelope(response.data);
}

export async function deletePortfolioItem(itemId: string) {
  await api.delete(`/api/provider/portfolio/${itemId}`);
}

export async function uploadPortfolioImage(formData: FormData) {
  const response = await api.post<ApiEnvelope<{ media_url?: string; image_url?: string; url?: string }>>(
    "/api/provider/portfolio/image",
    formData
  );
  return unwrapEnvelope(response.data);
}

// Services
export async function getProviderServices() {
  const response = await api.get<ApiEnvelope<ProviderService[]>>("/api/provider/services");
  return unwrapEnvelope(response.data);
}

export async function createProviderService(payload: Partial<ProviderService>) {
  const response = await api.post<ApiEnvelope<ProviderService>>("/api/provider/services", payload);
  return unwrapEnvelope(response.data);
}

export async function updateProviderService(serviceId: string, payload: Partial<ProviderService>) {
  const response = await api.patch<ApiEnvelope<ProviderService>>(`/api/provider/services/${serviceId}`, payload);
  return unwrapEnvelope(response.data);
}

export async function deleteProviderService(serviceId: string) {
  await api.delete(`/api/provider/services/${serviceId}`);
}

// Verification
export async function getVerificationStatus() {
  const response = await api.get<ApiEnvelope<any>>("/api/provider/verification");
  return unwrapEnvelope(response.data);
}

export async function requestVerification(payload: any) {
  const response = await api.post<ApiEnvelope<any>>("/api/provider/verification", payload);
  return unwrapEnvelope(response.data);
}

// Settings
export async function getProviderSettings() {
  const response = await api.get<ApiEnvelope<any>>("/api/provider/settings");
  return unwrapEnvelope(response.data);
}

export async function updateProviderSettings(payload: any) {
  const response = await api.patch<ApiEnvelope<any>>("/api/provider/settings", payload);
  return unwrapEnvelope(response.data);
}

// Jobs
export async function getOpenJobs(params?: {
  limit?: number;
  search?: string;
  category?: string;
  location?: string;
  experience?: string;
  budgetMin?: number;
  budgetMax?: number;
  matchesFor?: string;
}) {
  const response = await api.get<ApiEnvelope<any[]> | any[]>("/api/jobs", {
    params: {
      status: "open",
      ...params
    }
  });

  return unwrapMaybeEnvelope<any[]>(response.data);
}

export async function getHotJobs(limit = 5) {
  const response = await api.get<ApiEnvelope<any[]> | any[]>("/api/jobs", {
    params: {
      status: "open",
      limit,
      budgetMin: 10000
    }
  });

  return unwrapMaybeEnvelope<any[]>(response.data);
}

export async function getSavedJobs() {
  const response = await api.get<ApiEnvelope<any[]> | any[]>("/api/jobs", {
    params: {
      saved: true,
      status: "open"
    }
  });

  return unwrapMaybeEnvelope<any[]>(response.data);
}

export async function getJobById(jobId: string) {
  const response = await api.get<ApiEnvelope<any> | any>(`/api/jobs/${jobId}`);
  return unwrapMaybeEnvelope<any>(response.data);
}

export async function toggleSaveJob(jobId: string, save: boolean) {
  const response = await api.post<ApiEnvelope<{ success: boolean }> | { success: boolean }>(
    "/api/jobs/save",
    { jobId, save }
  );

  return unwrapMaybeEnvelope(response.data);
}
