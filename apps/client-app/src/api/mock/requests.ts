import type { ServiceRequest } from '../../types';
import type { CreatedRequest } from '../shared';
import { delay } from './client';

interface ProviderLeadInput {
  providerId: string;
  verifyToken?: string;
  fullName?: string;
  phone?: string;
}

let counter = 1;

/** Creates a service request (mock for POST /leads/request). `verifyToken` ignored here. */
export function createServiceRequest(input: ServiceRequest, _verifyToken?: string): Promise<CreatedRequest> {
  void input;
  return delay({ id: 'req-' + counter++, status: 'new', createdAt: new Date().toISOString() }, 600);
}

/** Logs a provider contact lead (mock for POST /leads/provider). Best-effort, non-blocking. */
export function createProviderLead(_input: ProviderLeadInput): Promise<{ ok: true }> {
  return delay({ ok: true }, 150);
}
