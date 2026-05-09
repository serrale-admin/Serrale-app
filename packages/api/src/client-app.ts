import { api } from "./client";
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
  const response = await api.get<Category[]>("/api/categories");
  return response.data;
}

export async function getFeaturedCategories() {
  const response = await api.get<Category[]>("/api/categories?featured=true");
  return response.data;
}

export async function getProviders() {
  const response = await api.get<ProviderSummary[]>("/api/providers");
  return response.data;
}

export async function getRecommendedProviders() {
  const response = await api.get<ProviderSummary[]>("/api/providers/recommended");
  return response.data;
}

export async function getProviderById(providerId: string) {
  const response = await api.get<ProviderDetails>(`/api/providers/${providerId}`);
  return response.data;
}

export async function createProject(payload: ProjectPayload) {
  const response = await api.post<Project>("/api/projects", payload);
  return response.data;
}

export async function getMyProjects() {
  const response = await api.get<Project[]>("/api/projects/my");
  return response.data;
}

export async function getProjectById(projectId: string) {
  const response = await api.get<Project>(`/api/projects/${projectId}`);
  return response.data;
}

export async function updateProject(projectId: string, payload: Partial<ProjectPayload>) {
  const response = await api.patch<Project>(`/api/projects/${projectId}`, payload);
  return response.data;
}

export async function deleteProject(projectId: string) {
  await api.delete(`/api/projects/${projectId}`);
}

export async function getProjectProposals(projectId: string) {
  const response = await api.get<Proposal[]>(`/api/projects/${projectId}/proposals`);
  return response.data;
}

export async function getProposalById(proposalId: string) {
  const response = await api.get<Proposal>(`/api/proposals/${proposalId}`);
  return response.data;
}

export async function createConversation(participantId: string) {
  const response = await api.post<Conversation>("/api/messages/conversations", {
    participant_id: participantId
  });
  return response.data;
}

export async function getConversations() {
  const response = await api.get<Conversation[]>("/api/messages/conversations");
  return response.data;
}

export async function getUnreadNotificationsCount() {
  const response = await api.get<{ unread_count: number }>(
    "/api/notifications/unread-count"
  );
  return response.data.unread_count;
}

export async function getConversationMessages(conversationId: string) {
  const response = await api.get<Message[]>(
    `/api/messages/conversations/${conversationId}`
  );
  return response.data;
}

export async function sendConversationMessage(conversationId: string, content: string) {
  const response = await api.post<Message>(
    `/api/messages/conversations/${conversationId}/messages`,
    { content }
  );
  return response.data;
}

export async function getClientHome() {
  const response = await api.get<ClientHomeResponse>("/api/mobile/client/home");
  return response.data;
}
