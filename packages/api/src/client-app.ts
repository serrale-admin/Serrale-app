import { api } from "./client";
import { ApiEnvelope, unwrapEnvelope } from "./utils";
import type {
  Category,
  ClientHomeResponse,
  Conversation,
  Message,
  Project,
  ProjectPayload,
  Proposal,
  ProviderDetails,
  ProviderSummary
} from "./types";

export async function getCategories() {
  const response = await api.get<ApiEnvelope<Category[]>>("/api/categories");
  return unwrapEnvelope(response.data);
}

export async function getFeaturedCategories() {
  const response = await api.get<ApiEnvelope<Category[]>>("/api/categories?featured=true");
  return unwrapEnvelope(response.data);
}

export async function getProviders() {
  const response = await api.get<ApiEnvelope<ProviderSummary[]>>("/api/providers");
  return unwrapEnvelope(response.data);
}

export async function getRecommendedProviders() {
  const response = await api.get<ApiEnvelope<ProviderSummary[]>>("/api/providers/recommended");
  return unwrapEnvelope(response.data);
}

export async function getProviderById(providerId: string) {
  const response = await api.get<ApiEnvelope<ProviderDetails>>(`/api/providers/${providerId}`);
  return unwrapEnvelope(response.data);
}

export async function createProject(payload: ProjectPayload) {
  const response = await api.post<ApiEnvelope<Project>>("/api/projects", payload);
  return unwrapEnvelope(response.data);
}

export async function getMyProjects() {
  const response = await api.get<ApiEnvelope<Project[]>>("/api/projects/my");
  return unwrapEnvelope(response.data);
}

export async function getProjectById(projectId: string) {
  const response = await api.get<ApiEnvelope<Project>>(`/api/projects/${projectId}`);
  return unwrapEnvelope(response.data);
}

export async function updateProject(projectId: string, payload: Partial<ProjectPayload>) {
  const response = await api.patch<ApiEnvelope<Project>>(`/api/projects/${projectId}`, payload);
  return unwrapEnvelope(response.data);
}

export async function deleteProject(projectId: string) {
  await api.delete(`/api/projects/${projectId}`);
}

export async function getProjectProposals(projectId: string) {
  const response = await api.get<ApiEnvelope<Proposal[]>>(`/api/projects/${projectId}/proposals`);
  return unwrapEnvelope(response.data);
}

export async function getProposalById(proposalId: string) {
  const response = await api.get<ApiEnvelope<Proposal>>(`/api/proposals/${proposalId}`);
  return unwrapEnvelope(response.data);
}

export async function createConversation(participantId: string) {
  const response = await api.post<ApiEnvelope<Conversation>>("/api/messages/conversations", {
    participant_id: participantId
  });
  return unwrapEnvelope(response.data);
}

export async function getConversations() {
  const response = await api.get<ApiEnvelope<Conversation[]>>("/api/messages/conversations");
  return unwrapEnvelope(response.data);
}

export async function getUnreadNotificationsCount() {
  const response = await api.get<ApiEnvelope<{ unread_count: number }>>(
    "/api/notifications/unread-count"
  );
  return unwrapEnvelope(response.data).unread_count;
}

export async function getConversationMessages(conversationId: string) {
  const response = await api.get<ApiEnvelope<Message[]>>(
    `/api/messages/conversations/${conversationId}`
  );
  return unwrapEnvelope(response.data);
}

export async function sendConversationMessage(conversationId: string, content: string) {
  const response = await api.post<ApiEnvelope<Message>>(
    `/api/messages/conversations/${conversationId}/messages`,
    { content }
  );
  return unwrapEnvelope(response.data);
}

export async function getClientHome() {
  const response = await api.get<ApiEnvelope<ClientHomeResponse>>("/api/mobile/client/home");
  return unwrapEnvelope(response.data);
}
