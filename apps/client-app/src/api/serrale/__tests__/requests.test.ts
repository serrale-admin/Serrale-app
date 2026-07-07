import { createServiceRequest, logProviderContact } from '../requests';
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
    await createServiceRequest({ ...INPUT, when: 'This week' }, 'k1');
    await createServiceRequest({ ...INPUT, when: 'Flexible' }, 'k2');
    expect((mockHttp.mock.calls[0][1]?.body as Record<string, unknown>).timing).toBe('this_week');
    expect((mockHttp.mock.calls[1][1]?.body as Record<string, unknown>).timing).toBe('flexible');
  });

  it('returns the HONEST backend shape — never a synthesized id/status/created_at', async () => {
    mockHttp.mockResolvedValue({ ok: true, duplicate: false } as never);
    const created = await createServiceRequest(INPUT, 'key-123');
    expect(created).toEqual({ ok: true, duplicate: false, idempotentReplay: false });
    expect((created as unknown as Record<string, unknown>).id).toBeUndefined();
    expect((created as unknown as Record<string, unknown>).status).toBeUndefined();
    expect((created as unknown as Record<string, unknown>).createdAt).toBeUndefined();
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
