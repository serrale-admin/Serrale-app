import { api } from "./client";
import type {
  Job,
  PortfolioItem,
  ProjectPayload,
  Proposal,
  ProviderDetails,
  ProviderService,
  ProviderStats
} from "./types";

export async function getJobs() {
  const response = await api.get<Job[]>("/api/jobs");
  return response.data;
}

export async function getRecommendedJobs() {
  const response = await api.get<Job[]>("/api/jobs/recommended");
  return response.data;
}

export async function getJobById(jobId: string) {
  const response = await api.get<Job>(`/api/jobs/${jobId}`);
  return response.data;
}

export async function sendProposal(jobId: string, payload: Partial<ProjectPayload>) {
  const response = await api.post<Proposal>(`/api/jobs/${jobId}/proposals`, payload);
  return response.data;
}

export async function getMyProposals() {
  const response = await api.get<Proposal[]>("/api/proposals/my");
  return response.data;
}

export async function getProviderProposalById(proposalId: string) {
  const response = await api.get<Proposal>(`/api/proposals/${proposalId}`);
  return response.data;
}

export async function updateProposal(proposalId: string, payload: Partial<Proposal>) {
  const response = await api.patch<Proposal>(`/api/proposals/${proposalId}`, payload);
  return response.data;
}

export async function deleteProposal(proposalId: string) {
  await api.delete(`/api/proposals/${proposalId}`);
}

export async function getProviderProfile() {
  const response = await api.get<ProviderDetails>("/api/provider/profile");
  return response.data;
}

export async function updateProviderProfile(payload: Partial<ProviderDetails>) {
  const response = await api.patch<ProviderDetails>("/api/provider/profile", payload);
  return response.data;
}

export async function getPortfolio() {
  const response = await api.get<PortfolioItem[]>("/api/provider/portfolio");
  return response.data;
}

export async function createPortfolioItem(payload: Partial<PortfolioItem>) {
  const response = await api.post<PortfolioItem>("/api/provider/portfolio", payload);
  return response.data;
}

export async function updatePortfolioItem(itemId: string, payload: Partial<PortfolioItem>) {
  const response = await api.patch<PortfolioItem>(
    `/api/provider/portfolio/${itemId}`,
    payload
  );
  return response.data;
}

export async function deletePortfolioItem(itemId: string) {
  await api.delete(`/api/provider/portfolio/${itemId}`);
}

export async function getProviderServices() {
  const response = await api.get<ProviderService[]>("/api/provider/services");
  return response.data;
}

export async function createProviderService(payload: Partial<ProviderService>) {
  const response = await api.post<ProviderService>("/api/provider/services", payload);
  return response.data;
}

export async function updateProviderService(
  serviceId: string,
  payload: Partial<ProviderService>
) {
  const response = await api.patch<ProviderService>(
    `/api/provider/services/${serviceId}`,
    payload
  );
  return response.data;
}

export async function deleteProviderService(serviceId: string) {
  await api.delete(`/api/provider/services/${serviceId}`);
}

export async function getProviderStats() {
  const response = await api.get<ProviderStats>("/api/provider/stats");
  return response.data;
}

export async function updateAvailability(isAvailable: boolean) {
  const response = await api.patch<{ is_available: boolean }>(
    "/api/provider/availability",
    { is_available: isAvailable }
  );
  return response.data;
}
