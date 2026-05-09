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
    if (!payload.success || payload.data === undefined) {
      throw new Error(payload.error?.message || "Request failed");
    }
    return payload.data;
  }
  
  return payload as unknown as T;
}

export function unwrapMaybeEnvelope<T>(payload: ApiEnvelope<T> | T): T {
  const maybe = payload as any;

  if (maybe && typeof maybe === "object" && "success" in maybe) {
    return unwrapEnvelope(maybe);
  }

  return payload as T;
}
