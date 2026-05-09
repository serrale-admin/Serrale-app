export interface DbAuthUser {
  id: string;
  email: string;
}

export interface DbProfile {
  id: string;
  user_id: string;
  role: "client" | "service_provider" | "admin";
  full_name: string;
  avatar_url?: string;
  completion_percentage: number;
  is_verified: boolean;
}

export interface DbClient {
  id: string;
  profile_id: string;
}

export interface DbServiceProvider {
  id: string;
  profile_id: string;
  is_available: boolean;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
}

export interface DbProject {
  id: string;
  client_id: string;
  category_id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
}

export interface DbProposal {
  id: string;
  project_id: string;
  service_provider_id: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
}
