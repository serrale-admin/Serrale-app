import { createServiceRequest, logProviderContact, reportProvider } from '../requests';
import { http } from '../../../lib/http';
import type { ServiceRequest } from '../../../types';

jest.mock('../../../lib/http', () => ({
  http: jest.fn(),
  __esModule: true,
}));

jest.mock('../../../store/appStore', () => ({
  useAppStore: {
    getState: () => ({ user: { name: 'SERRALE user', phone: '+251912345678' } }),
  },
  __esModule: true,
}));

const mockHttp = http as jest.MockedFunction<typeof http>;

const INPUT: ServiceRequest = {
  categoryId: 'plumbers',
  area: 'Bole',
  description: 'Leaking sink under the kitchen counter.',
  engagement: '',
  when: 'Today',
  budget: 'Under 1,000 ETB',
  preferredContact: 'Call',
};

beforeEach(() => {
  mockHttp.mockReset();
});

describe('createServiceRequest — authenticated + idempotent (M-1)', () => {
  it('POSTs with the provided Idempotency-Key header and NO verify_token', async () => {
    mockHttp.mockResolvedValue({ ok: true, duplicate: false } as never);
    await createServiceRequest(INPUT, 'key-123');

    const [path, opts] = mockHttp.mock.calls[0];
    expect(path).toBe('/public-directory/leads/request');
    expect(opts?.method).toBe('POST');
    expect(opts?.headers).toEqual({ 'Idempotency-Key': 'key-123' });
    const body = opts?.body as Record<string, unknown>;
    expect(body.verify_token).toBeUndefined();
    // No explicit token: the session Bearer is auto-attached by the http layer.
    expect(opts?.token).toBeUndefined();
    expect(body).toMatchObject({
      phone: '+251912345678',
      serviceNeed: INPUT.description,
      serviceCategory: 'plumbers',
      location: 'Bole',
      timing: 'today',
      note: 'Budget: Under 1,000 ETB · Preferred contact: Call',
    });
  });

  it('maps the timing options to the backend enum', async () => {
    mockHttp.mockResolvedValue({ ok: true, duplicate: false } as never);
    await createServiceRequest({ ...INPUT, when: 'Emergency' }, 'k0');
    await createServiceRequest({ ...INPUT, when: 'This week' }, 'k1');
    await createServiceRequest({ ...INPUT, when: 'Flexible' }, 'k2');
    expect((mockHttp.mock.calls[0][1]?.body as Record<string, unknown>).timing).toBe('emergency');
    expect((mockHttp.mock.calls[1][1]?.body as Record<string, unknown>).timing).toBe('this_week');
    expect((mockHttp.mock.calls[2][1]?.body as Record<string, unknown>).timing).toBe('flexible');
  });

  it('maps engagement to engagementType, distinct from timing — omitted when not specified', async () => {
    mockHttp.mockResolvedValue({ ok: true, duplicate: false } as never);
    await createServiceRequest({ ...INPUT, engagement: 'Temporary' }, 'e0');
    await createServiceRequest({ ...INPUT, engagement: 'Permanent' }, 'e1');
    await createServiceRequest({ ...INPUT, engagement: '' }, 'e2');
    expect((mockHttp.mock.calls[0][1]?.body as Record<string, unknown>).engagementType).toBe('temporary');
    expect((mockHttp.mock.calls[1][1]?.body as Record<string, unknown>).engagementType).toBe('permanent');
    expect((mockHttp.mock.calls[2][1]?.body as Record<string, unknown>).engagementType).toBeUndefined();
    // timing is unaffected by engagement — the two dimensions stay independent.
    expect((mockHttp.mock.calls[0][1]?.body as Record<string, unknown>).timing).toBe('today');
  });

  it('always sends a non-empty serviceNeed — falls back to categoryId when description is blank', async () => {
    mockHttp.mockResolvedValue({ ok: true, duplicate: false } as never);
    await createServiceRequest({ ...INPUT, description: '   ' }, 'empty-desc');
    const body = mockHttp.mock.calls[0][1]?.body as Record<string, unknown>;
    expect(body.serviceNeed).toBe('plumbers');
    expect(body.serviceCategory).toBe('plumbers');
  });

  it('returns backend identity fields when present (additive)', async () => {
    mockHttp.mockResolvedValue({
      ok: true,
      duplicate: false,
      id: '11111111-1111-1111-1111-111111111111',
      status: 'new',
      created_at: '2026-07-16T00:00:00.000Z',
      kind: 'request',
    } as never);
    const created = await createServiceRequest(INPUT, 'key-123');
    expect(created).toEqual({
      ok: true,
      duplicate: false,
      idempotentReplay: false,
      id: '11111111-1111-1111-1111-111111111111',
      status: 'new',
      created_at: '2026-07-16T00:00:00.000Z',
      kind: 'request',
    });
  });

  it('returns the base shape when backend omits identity fields', async () => {
    mockHttp.mockResolvedValue({ ok: true, duplicate: false } as never);
    const created = await createServiceRequest(INPUT, 'key-123');
    expect(created).toEqual({ ok: true, duplicate: false, idempotentReplay: false });
    expect(created.id).toBeUndefined();
  });

  it('surfaces duplicate and idempotent_replay flags', async () => {
    mockHttp.mockResolvedValue({ ok: true, duplicate: true, idempotent_replay: true } as never);
    const created = await createServiceRequest(INPUT, 'key-123');
    expect(created.duplicate).toBe(true);
    expect(created.idempotentReplay).toBe(true);
  });

  it('generates a key when none is provided', async () => {
    mockHttp.mockResolvedValue({ ok: true, duplicate: false } as never);
    await createServiceRequest(INPUT);
    const headers = mockHttp.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBeTruthy();
  });
});

describe('logProviderContact — public contact-events endpoint (M-2/M-6)', () => {
  it('POSTs the event with source_platform mobile_app and no verify token', async () => {
    mockHttp.mockResolvedValue({ recorded: true } as never);
    const res = await logProviderContact({
      providerId: 'prov-1',
      eventType: 'phone_click',
      sourceFlow: 'contact_sheet',
      userArea: 'Bole',
    });

    const [path, opts] = mockHttp.mock.calls[0];
    expect(path).toBe('/public-directory/providers/prov-1/contact-events');
    expect(opts?.method).toBe('POST');
    expect(opts?.token).toBeUndefined();
    expect(opts?.body).toMatchObject({
      event_type: 'phone_click',
      source_platform: 'mobile_app',
      source_flow: 'contact_sheet',
      user_area: 'Bole',
    });
    expect((opts?.body as Record<string, unknown>).verify_token).toBeUndefined();
    expect(res).toEqual({ recorded: true });
  });

  it('NEVER rejects — a failed log resolves { recorded: false } (fire-and-forget)', async () => {
    mockHttp.mockRejectedValue(new Error('network down'));
    await expect(
      logProviderContact({ providerId: 'prov-1', eventType: 'whatsapp_click' }),
    ).resolves.toEqual({ recorded: false });
  });

  it('supports profile_view for detail-screen opens', async () => {
    mockHttp.mockResolvedValue({ recorded: true } as never);
    await logProviderContact({ providerId: 'prov-9', eventType: 'profile_view', sourceFlow: 'provider_detail' });
    expect((mockHttp.mock.calls[0][1]?.body as Record<string, unknown>).event_type).toBe('profile_view');
  });
});

describe('reportProvider — POST /providers/:id/reports', () => {
  it('POSTs reason + mobile_app platform', async () => {
    mockHttp.mockResolvedValue({ recorded: true, id: 'rep-1' } as never);
    const res = await reportProvider('prov-1', { reason: 'scam', details: 'Asked for upfront fee' });

    const [path, opts] = mockHttp.mock.calls[0];
    expect(path).toBe('/public-directory/providers/prov-1/reports');
    expect(opts?.method).toBe('POST');
    expect(opts?.body).toMatchObject({
      reason: 'scam',
      details: 'Asked for upfront fee',
      source_platform: 'mobile_app',
      source_flow: 'provider_detail',
    });
    expect(res).toEqual({ recorded: true, id: 'rep-1' });
  });

  it('throws when the API rejects (UI must not fake success)', async () => {
    mockHttp.mockRejectedValue(new Error('network down'));
    await expect(reportProvider('prov-1', { reason: 'spam' })).rejects.toThrow('network down');
  });
});
