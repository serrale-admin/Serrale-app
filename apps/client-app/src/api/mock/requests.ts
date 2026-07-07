import type { ServiceRequest } from '../../types';
import type { CreatedRequest } from '../shared';
import type { ContactEventType } from '../serrale/requests';
import { delay } from './client';

interface ContactEventInput {
  providerId: string;
  eventType: ContactEventType;
  sourceFlow?: string;
  searchQuery?: string;
  userArea?: string;
}

/**
 * Creates a service request (mock for POST /leads/request). Mirrors the real
 * honest shape `{ ok, duplicate, idempotentReplay }`. Replays the same
 * idempotency key to simulate the backend's idempotent replay.
 */
const seenKeys = new Set<string>();
export function createServiceRequest(input: ServiceRequest, idempotencyKey?: string): Promise<CreatedRequest> {
  void input;
  const replay = !!idempotencyKey && seenKeys.has(idempotencyKey);
  if (idempotencyKey) seenKeys.add(idempotencyKey);
  return delay({ ok: true, duplicate: replay, idempotentReplay: replay }, 600);
}

/** Records a provider contact event (mock for POST /providers/:id/contact-events). */
export function logProviderContact(_input: ContactEventInput): Promise<{ recorded: boolean }> {
  return delay({ recorded: true }, 120);
}
