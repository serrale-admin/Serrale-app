import { useQuery } from "@tanstack/react-query";
import {
  getClientHome,
  getFeaturedCategories,
  getMyProjects,
  getRecommendedProviders,
  getUnreadNotificationsCount,
  fetchMe,
  type ClientHomeResponse
} from "@serrale/api";

const fallbackCategories = [
  { id: "design", name: "Design", icon: "🎨", subtitle: "Branding, UI/UX" },
  { id: "development", name: "Development", icon: "💻", subtitle: "Web & mobile" },
  { id: "home-services", name: "Home Services", icon: "🧰", subtitle: "Repair, cleaning" },
  { id: "marketing", name: "Marketing", icon: "📣", subtitle: "Content, ads" }
];

export function useClientHomeData() {
  return useQuery({
    queryKey: ["client-home"],
    queryFn: async (): Promise<ClientHomeResponse> => {
      try {
        return await getClientHome();
      } catch {
        const [me, categories, providers, projects, unreadCount] = await Promise.all([
          fetchMe(),
          getFeaturedCategories().catch(() => []),
          getRecommendedProviders().catch(() => []),
          getMyProjects().catch(() => []),
          getUnreadNotificationsCount().catch(() => 0)
        ]);

        return {
          user: {
            id: me.user.id,
            full_name: me.user.full_name,
            avatar_url: me.user.avatar_url
          },
          unread_notifications_count: unreadCount,
          featured_categories:
            categories.length > 0
              ? categories.map((entry) => ({
                  id: entry.id,
                  name: entry.name,
                  icon: entry.icon ?? "⭐",
                  subtitle: "Explore services"
                }))
              : fallbackCategories,
          recommended_providers: providers.map((provider) => ({
            id: provider.id,
            full_name: provider.full_name,
            avatar_url: provider.avatar_url,
            specialty: provider.title ?? "Trusted professional",
            rating: provider.rating ?? 4.9,
            review_count: provider.review_count ?? 0,
            is_verified: provider.is_verified
          })),
          recent_project: projects[0]
            ? {
                id: projects[0].id,
                title: projects[0].title,
                category: "UI/UX Design",
                status: projects[0].status,
                proposal_count: 3
              }
            : undefined
        };
      }
    }
  });
}
