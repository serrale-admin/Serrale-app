export const dbMappingNotes = {
  authUsers: "auth.users",
  profiles: "profiles / users",
  clients: "clients",
  serviceProviders: "service_providers",
  categories: "categories",
  projects: "projects",
  proposals: "proposals",
  providerProfiles: "provider_profiles",
  providerServices: "provider_services",
  portfolioItems: "portfolio_items",
  messages: "messages / conversations",
  notifications: "notifications",
  payments: "payments / chapa_transactions"
} as const;

export type DbMappingKey = keyof typeof dbMappingNotes;
