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
  // Defensive check: if the backend sends the data directly (unwrapped)
  // we check for the 'success' key. If it's missing, it's likely already unwrapped.
  if (payload && typeof payload === "object" && "success" in payload) {
    if (!payload.success) {
      throw new Error(payload.error?.message || "Request failed");
    }
    return payload.data;
  }
  
  return payload as unknown as T;
}
