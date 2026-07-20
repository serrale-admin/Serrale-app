import type { ServiceRequest } from '../../types';
import type { CreatedRequest } from '../shared';
import type { ContactEventType } from '../serrale/requests';
import type { CustomerActivityDetail, CustomerActivityItem } from '../serrale/activity';
import { delay } from './client';

interface ContactEventInput {
  providerId: string;
  eventType: ContactEventType;
  sourceFlow?: string;
  searchQuery?: string;
  userArea?: string;
}

const seenKeys = new Set<string>();
export function createServiceRequest(input: ServiceRequest, idempotencyKey?: string): Promise<CreatedRequest> {
  void input;
  const replay = !!idempotencyKey && seenKeys.has(idempotencyKey);
  if (idempotencyKey) seenKeys.add(idempotencyKey);
  return delay(
    {
      ok: true,
      duplicate: replay,
      idempotentReplay: replay,
      id: '11111111-1111-1111-1111-111111111111',
      status: 'new',
      created_at: new Date().toISOString(),
      kind: 'request',
    },
    600,
  );
}

export function logProviderContact(_input: ContactEventInput): Promise<{ recorded: boolean }> {
  return delay({ recorded: true }, 120);
}

export function reportProvider(
  _providerId: string,
  _input: { reason: string; details?: string }
): Promise<{ recorded: boolean; id?: string }> {
  return delay({ recorded: true, id: '22222222-2222-2222-2222-222222222222' }, 200);
}

const MOCK_ACTIVITY: CustomerActivityItem[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    type: 'request',
    title: 'Need a plumber',
    category: 'plumber',
    location: 'Bole',
    engagement: 'temporary',
    timing: 'today',
    status: 'new',
    display_status: 'submitted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function fetchMyActivity(): Promise<{ items: CustomerActivityItem[]; total: number }> {
  return delay({ items: MOCK_ACTIVITY, total: MOCK_ACTIVITY.length }, 200);
}

export function fetchActivityDetail(
  type: 'request' | 'job',
  id: string,
): Promise<CustomerActivityDetail> {
  const base = MOCK_ACTIVITY.find((i) => i.id === id && i.type === type) ?? MOCK_ACTIVITY[0];
  return delay(
    {
      ...base,
      note: null,
      description: null,
      timeline: [
        {
          id: 'evt-1',
          from_status: null,
          to_status: 'new',
          display_status: 'submitted',
          actor_type: 'customer',
          note: 'created',
          created_at: base.created_at,
        },
      ],
    },
    200,
  );
}
