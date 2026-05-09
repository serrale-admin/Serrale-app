import { api } from "./client";
import { ApiEnvelope, unwrapEnvelope } from "./utils";
import type {
  PortfolioItem,
  ProviderBootstrap,
  ProviderDashboard,
  ProviderDetails,
  ProviderService,
} from "./types";

// Core Provider APIs
export async function getProviderBootstrap() {
  const response = await api.get<ApiEnvelope<ProviderBootstrap>>("/api/provider/bootstrap");
  return unwrapEnvelope(response.data);
}

export async function getProviderDashboard() {
  const response = await api.get<ApiEnvelope<ProviderDashboard>>("/api/provider/dashboard");
  return unwrapEnvelope(response.data);
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

export async function uploadPortfolioImage(itemId: string, formData: FormData) {
  const response = await api.post<ApiEnvelope<{ media_url: string }>>(`/api/provider/portfolio/${itemId}/image`, formData);
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
