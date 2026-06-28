import type { ServiceRequest } from '../types';
import { delay } from './client';

export interface CreatedRequest extends ServiceRequest {
  id: string;
  status: 'new';
  createdAt: string;
}

let counter = 1;

/** Creates a service request (maps to service_requests insert in the spec). */
export function createServiceRequest(input: ServiceRequest): Promise<CreatedRequest> {
  const created: CreatedRequest = {
    ...input,
    id: 'req-' + counter++,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  return delay(created, 600);
}
