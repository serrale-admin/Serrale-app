import type { UserRole } from "@serrale/auth";

export interface ApiUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
}

export interface UserProfileStatus {
  id: string;
  completion_percentage: number;
  is_verified: boolean;
  is_available?: boolean;
}

export interface UserPermissions {
  can_post_project: boolean;
  can_apply_to_jobs: boolean;
  can_message: boolean;
}

export interface UserOnboarding {
  required_steps: string[];
  completed_steps: string[];
  next_step?: string;
}

export interface MeResponse {
  user: ApiUser;
  profile: UserProfileStatus;
  permissions: UserPermissions;
  onboarding: UserOnboarding;
}

export interface MobileSessionPayload {
  email: string;
  password: string;
  intent?: "login" | "signup";
}

export interface MobileSessionResponse {
  access_token: string;
  refresh_token?: string;
  role?: UserRole;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface ProviderSummary {
  id: string;
  full_name: string;
  avatar_url?: string;
  title?: string;
  rating?: number;
  review_count?: number;
  is_verified: boolean;
  categories?: string[];
  hourly_rate?: number;
}

export interface ProviderDetails extends ProviderSummary {
  bio?: string;
  portfolio_items?: PortfolioItem[];
  services?: ProviderService[];
}

export interface ProjectPayload {
  title: string;
  description: string;
  category_id: string;
  budget?: number;
  deadline?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  budget?: number;
  category_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface Proposal {
  id: string;
  project_id: string;
  provider_id: string;
  amount?: number;
  cover_letter?: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  last_message_preview?: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  budget?: number;
  status: "open" | "closed";
  posted_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  media_url?: string;
}

export interface ProviderService {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

export interface ProviderStats {
  completed_jobs: number;
  active_proposals: number;
  response_rate: number;
}

export interface FeaturedCategory {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
}

export interface RecommendedHomeProvider {
  id: string;
  full_name: string;
  avatar_url?: string;
  specialty: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
}

export interface RecentClientProject {
  id: string;
  title: string;
  category: string;
  status: string;
  proposal_count: number;
}

export interface ClientHomeResponse {
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  unread_notifications_count: number;
  featured_categories: FeaturedCategory[];
  recommended_providers: RecommendedHomeProvider[];
  recent_project?: RecentClientProject;
}

export interface ProviderDashboard {
  provider_name: string;
  profile_completion: number;
  verification_status: "not_started" | "pending" | "verified" | "rejected";
  skills_count: number;
  portfolio_count: number;
  services_count: number;
  next_actions: string[];
}

export interface ProviderBootstrap {
  user: ApiUser;
  profile: ProviderDetails;
  skills: any[];
  portfolio: PortfolioItem[];
  services: ProviderService[];
  settings: any;
}
