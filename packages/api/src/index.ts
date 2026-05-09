export * from "./auth";
export * from "./client";
export * from "./client-app";
export * from "./provider-app";
export * from "./types";

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
};

export function unwrapEnvelope<T>(payload: ApiEnvelope<T>): T {
  if (!payload.success) {
    throw new Error(payload.error?.message || "Request failed");
  }

  return payload.data;
}
