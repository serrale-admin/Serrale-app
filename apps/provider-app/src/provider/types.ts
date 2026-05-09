export interface ProviderJob {
  id: string;
  title: string;
  client: string;
  clientVerified: boolean;
  category: "Design" | "Photography" | "Development" | "Other";
  catColor: string;
  catBg: string;
  budgetMin: number;
  budgetMax: number;
  location: string;
  posted: string;
  match: number;
  description: string;
  skills: string[];
  timeline: string;
  proposals: number;
}

export interface ProviderProposal {
  id: string;
  project: string;
  client: string;
  status: "Submitted" | "Viewed" | "Shortlisted" | "Interview" | "Won" | "Rejected";
  update: string;
  submitted: string;
  budget: string;
  linkedJobId?: string;
}

export interface ProviderConversation {
  id: string;
  name: string;
  project: string;
  last: string;
  time: string;
  unread: number;
  initials: string;
  bg: string;
  fg: string;
}

export interface ProviderChatMessage {
  id: number;
  from: "me" | "them";
  text: string;
  time: string;
}

export interface ProviderProfile {
  name: string;
  firstName: string;
  specialty: string;
  rating: number;
  reviews: number;
  jobsCompleted: number;
  successRate: number;
  earnings: string;
  location: string;
  profileCompletion: number;
}

export interface ProviderPortfolioItem {
  id: string;
  title: string;
  service: string;
  result: string;
  period: string;
  summary: string;
}
