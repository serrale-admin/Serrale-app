/**
 * Failure-class matrix — one case per class → expected labels key + retryable
 * flag + kind. This is the contract screens rely on to show mapped, localized
 * copy instead of ad-hoc `instanceof` checks.
 *
 * It ALSO enforces the no-internal-leakage guarantee (requirement 3): the raw
 * error carries a stack, a SQL string, a Supabase internal and a raw phone; none
 * of those may appear in the resolved presentation. The resolver returns KEYS,
 * not prose, so leakage is structurally impossible — but we assert it against a
 * maximally-leaky error to prove it.
 */
import { APP_VERSION, HttpError, MalformedResponseError, NetworkError, ApiBusinessError } from '../http';
import { breadcrumbForError, presentError, resolvePresentation } from '../error-presentation';
import { labelsFor } from '../labels';

// labels.ts pulls in the app store (for useLabels), which imports AsyncStorage.
// Mock the native module so importing the label set works under Jest. Babel
// hoists this jest.mock above the imports above.
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));

const en = labelsFor('en');

/** Build an HttpError with optional 429/503 retry raw + code. */
function httpError(status: number, code?: string, message = 'x'): HttpError {
  return new HttpError(status, message, code);
}

describe('failure-class matrix', () => {
  const cases: {
    name: string;
    error: unknown;
    kind: string;
    titleKey: keyof typeof en.errors;
    retryable: boolean;
  }[] = [
    {
      name: 'connection (DNS/TLS reachability)',
      error: new NetworkError('Connection problem', 'connection'),
      kind: 'connection',
      titleKey: 'connectionTitle',
      retryable: true,
    },
    {
      name: 'offline (NetworkError, offline copy)',
      error: new NetworkError('Check your internet and try again.'),
      kind: 'offline',
      titleKey: 'offlineTitle',
      retryable: true,
    },
    {
      name: 'timeout (NetworkError, timeout copy)',
      error: new NetworkError('The request timed out. Check your internet and try again.'),
      kind: 'timeout',
      titleKey: 'timeoutTitle',
      retryable: true,
    },
    {
      name: 'cancelled (NetworkError, cancelled copy) is NOT a user-facing error',
      error: new NetworkError('Request cancelled.'),
      kind: 'cancelled',
      titleKey: 'unknownTitle', // cancelled maps to a benign, non-retryable state
      retryable: false,
    },
    {
      name: '400 validation',
      error: httpError(400, 'VALIDATION_ERROR'),
      kind: 'validation',
      titleKey: 'validationTitle',
      retryable: false,
    },
    {
      name: '401 session expiry',
      error: httpError(401, 'SESSION_EXPIRED'),
      kind: 'session-expired',
      titleKey: 'sessionExpiredTitle',
      retryable: false,
    },
    {
      name: '403 forbidden',
      error: httpError(403),
      kind: 'forbidden',
      titleKey: 'forbiddenTitle',
      retryable: false,
    },
    {
      name: '404 not found',
      error: httpError(404),
      kind: 'not-found',
      titleKey: 'notFoundTitle',
      retryable: false,
    },
    {
      name: '409 conflict / duplicate',
      error: httpError(409, 'DUPLICATE_REQUEST'),
      kind: 'conflict',
      titleKey: 'conflictTitle',
      retryable: false,
    },
    {
      name: '429 rate limited',
      error: httpError(429, 'RATE_LIMITED'),
      kind: 'rate-limited',
      titleKey: 'rateLimitedTitle',
      retryable: true,
    },
    {
      name: '500 server error',
      error: httpError(500),
      kind: 'server',
      titleKey: 'serverTitle',
      retryable: true,
    },
    {
      name: '502 server error',
      error: httpError(502),
      kind: 'server',
      titleKey: 'serverTitle',
      retryable: true,
    },
    {
      name: '503 unavailable (no maintenance signal) → server',
      error: httpError(503),
      kind: 'server',
      titleKey: 'serverTitle',
      retryable: true,
    },
    {
      name: '503 + maintenance code → maintenance',
      error: httpError(503, 'MAINTENANCE'),
      kind: 'maintenance',
      titleKey: 'maintenanceTitle',
      retryable: true,
    },
    {
      name: 'malformed / non-JSON successful response',
      error: new MalformedResponseError('Malformed response', 'req-malformed'),
      kind: 'malformed',
      titleKey: 'malformedTitle',
      retryable: true,
    },
    {
      name: 'business envelope (success:false) never surfaces server message',
      error: new ApiBusinessError('SELECT * FROM users; supabase leak +251912345678', 'PGRST204'),
      kind: 'business',
      titleKey: 'unknownTitle',
      retryable: false,
    },
    {
      name: 'unknown raw error',
      error: new Error('kaboom'),
      kind: 'unknown',
      titleKey: 'unknownTitle',
      retryable: false,
    },
  ];

  for (const c of cases) {
    it(`${c.name} → kind=${c.kind}, ${String(c.titleKey)}, retryable=${c.retryable}`, () => {
      const p = resolvePresentation(c.error);
      expect(p.kind).toBe(c.kind);
      expect(p.titleKey).toBe(c.titleKey);
      expect(p.retryable).toBe(c.retryable);
      // A message key always resolves to real copy in the label set.
      expect(typeof en.errors[p.messageKey]).toBe('string');
      expect((en.errors[p.messageKey] as string).length).toBeGreaterThan(0);
    });
  }
});

describe('malformed / non-JSON transport', () => {
  it('classifies the typed malformed response exactly as malformed', () => {
    const p = resolvePresentation(new MalformedResponseError('Malformed response'));
    expect(p.kind).toBe('malformed');
  });
});

describe('no internal leakage (requirement 3)', () => {
  it('never surfaces stack / SQL / Supabase / phone from a maximally-leaky error', () => {
    const leaky = new HttpError(
      500,
      'ERROR: null value in column "phone" violates not-null constraint at PostgREST supabase.rpc for +251912345678',
      'PGRST204',
    );
    leaky.stack = 'at Object.<anonymous> (/app/backend/src/db.ts:42) SELECT * FROM users WHERE phone=+251912345678';

    const en2 = labelsFor('en');
    const view = presentError(leaky, en2);

    const serialized = JSON.stringify(view);
    expect(serialized).not.toContain('supabase');
    expect(serialized).not.toContain('PGRST204');
    expect(serialized).not.toContain('SELECT');
    expect(serialized).not.toContain('not-null constraint');
    expect(serialized).not.toContain('+251912345678');
    expect(serialized).not.toContain('/app/backend');
    // It DOES surface safe, mapped copy.
    expect(view.title).toBe(en2.errors.serverTitle);
    expect(view.message).toBe(en2.errors.serverMessage);
  });

  it('presents 401 SESSION_EXPIRED as a friendly sign-in prompt, not a scary error', () => {
    const en2 = labelsFor('en');
    const view = presentError(new HttpError(401, 'Session expired', 'SESSION_EXPIRED'), en2);
    expect(view.title).toBe(en2.errors.sessionExpiredTitle);
    expect(view.message).toBe(en2.errors.sessionExpiredMessage);
    expect(view.kind).toBe('session-expired');
    // The safe-restart / recovery action for a session expiry routes to sign-in.
    expect(view.action).toBe(en2.errors.signIn);
  });

  it('presents AUTH_REFRESHED_RETRY as a retryable server error, not session expired', () => {
    const en2 = labelsFor('en');
    const view = presentError(
      new HttpError(409, 'Please try again.', 'AUTH_REFRESHED_RETRY'),
      en2,
    );
    expect(view.kind).toBe('server');
    expect(view.kind).not.toBe('session-expired');
    expect(view.title).toBe(en2.errors.serverTitle);
  });
});

describe('429 wait substitution', () => {
  it('substitutes a human wait into the rate-limited message when the server sent one', () => {
    const err = new HttpError(429, 'Too many', 'RATE_LIMITED');
    err.retryRaw = { body: { retry_after_seconds: 45 }, retryAfter: '45', rateLimitReset: null };
    const en2 = labelsFor('en');
    const view = presentError(err, en2);
    expect(view.message).toContain('45');
    expect(view.message).not.toContain('{wait}');
  });

  it('falls back to the generic rate-limited message when no wait is known', () => {
    const en2 = labelsFor('en');
    const view = presentError(new HttpError(429, 'Too many', 'RATE_LIMITED'), en2);
    expect(view.message).toBe(en2.errors.rateLimitedMessage);
  });

  it('uses localized Amharic wait units without English unit fragments', () => {
    const err = new HttpError(429, 'Too many', 'RATE_LIMITED');
    err.retryRaw = { body: { retry_after_seconds: 120 }, retryAfter: '120', rateLimitReset: null };
    const view = presentError(err, labelsFor('am'));
    expect(view.message).toContain('2 ደቂቃ');
    expect(view.message).not.toMatch(/seconds?|minutes?/i);
  });

  it('shows wait time even when the error code maps to apiErrors (OTP_COOLDOWN)', () => {
    const err = new HttpError(429, 'rate limited', 'OTP_COOLDOWN');
    err.retryRaw = { body: { retry_after_seconds: 42 }, retryAfter: '42', rateLimitReset: null };
    const view = presentError(err, labelsFor('en'));
    expect(view.message).toMatch(/42 seconds/i);
  });
});

describe('failed request breadcrumbs', () => {
  it('includes failure class, status, app version, and the transport request id', () => {
    const err = new HttpError(503, 'internal details', 'UPSTREAM', undefined, 'req-safe-123');
    expect(breadcrumbForError(err)).toMatchObject({
      category: 'http',
      message: 'request-failed:server',
      data: {
        kind: 'server',
        status: 503,
        appVersion: APP_VERSION,
        requestId: 'req-safe-123',
      },
    });
  });
});
