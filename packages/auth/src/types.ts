export type UserRole = "client" | "service_provider" | "admin";

export interface SessionTokens {
  accessToken: string;
  refreshToken?: string;
}
