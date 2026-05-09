import { providerColors } from "../theme";
import type { ProviderJob } from "../types";

function timeAgo(date?: string) {
  if (!date) return "Recently";

  const diffMs = Date.now() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return `${Math.floor(diffDays / 30)} months ago`;
}

export function mapBackendJobToProviderJob(job: any): ProviderJob {
  const rawCategory = job.category || job.industry || "Other";

  const skills =
    Array.isArray(job.skills)
      ? job.skills
      : Array.isArray(job.job_skills)
        ? job.job_skills.map((x: any) => x.skills?.name).filter(Boolean)
        : [];

  const normalizedCategory =
    rawCategory.toLowerCase().includes("design")
      ? "Design"
      : rawCategory.toLowerCase().includes("photo")
        ? "Photography"
        : rawCategory.toLowerCase().includes("development") ||
          rawCategory.toLowerCase().includes("tech")
          ? "Development"
          : "Other";

  return {
    id: job.id,
    title: job.title || "Untitled project",
    client: job.client?.full_name || job.client_name || "SERRALE Client",
    clientVerified: Boolean(job.client?.verified_identity || job.client_verified),
    category: normalizedCategory,
    catColor: providerColors.blue,
    catBg: providerColors.sky,
    budgetMin: Number(job.budget_min || job.budget || 0),
    budgetMax: Number(job.budget_max || job.budget || 0),
    location: [job.city, job.country].filter(Boolean).join(", ") || "Ethiopia",
    posted: timeAgo(job.created_at || job.posted_at),
    match: Number(job.match_score || job.match || 72),
    description: job.description || "",
    skills,
    timeline: job.duration || job.timeline || "Flexible",
    proposals: Number(job.proposals_count || job.proposals?.[0]?.count || 0)
  };
}
