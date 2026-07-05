/**
 * Unit coverage for the pure request-reliability policy: retry classification,
 * backoff bounds + full jitter, Retry-After handling, and the read-only circuit
 * breaker state machine. No network here — every function under test is pure or
 * a self-contained state object, so we drive it directly with fake timers.
 */
import {
  BACKOFF_BASE_MS,
  BACKOFF_MAX_MS,
  CIRCUIT_COOLDOWN_MS,
  CIRCUIT_FAILURE_THRESHOLD,
  MAX_RETRIES,
  READ_TIMEOUT_MS,
  RETRY_AFTER_CAP_MS,
  WRITE_TIMEOUT_MS,
  classifyRetry,
  computeBackoffDelay,
  createReadCircuit,
  defaultTimeoutFor,
  generateRequestId,
  parseRetryAfter,
} from '../request-policy';

describe('generateRequestId', () => {
  it('produces RFC-4122 v4 shaped UUIDs', () => {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    for (let i = 0; i < 500; i++) expect(generateRequestId()).toMatch(re);
  });

  it('is unique across many calls', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 5000; i++) ids.add(generateRequestId());
    expect(ids.size).toBe(5000);
  });
});

describe('defaultTimeoutFor', () => {
  it('uses the read timeout for GET reads', () => {
    expect(defaultTimeoutFor('GET', '/public-directory/providers')).toBe(READ_TIMEOUT_MS);
  });

  it('uses the longer write timeout for OTP request/verify', () => {
    expect(defaultTimeoutFor('POST', '/public-directory/otp/request')).toBe(WRITE_TIMEOUT_MS);
    expect(defaultTimeoutFor('POST', '/public-directory/otp/verify')).toBe(WRITE_TIMEOUT_MS);
  });

  it('uses the longer write timeout for lead/request submissions', () => {
    expect(defaultTimeoutFor('POST', '/public-directory/leads/request')).toBe(WRITE_TIMEOUT_MS);
    expect(defaultTimeoutFor('POST', '/public-directory/leads/provider')).toBe(WRITE_TIMEOUT_MS);
  });
});

describe('classifyRetry — method × status matrix', () => {
  const retryableStatuses = [408, 502, 503, 504];
  const nonRetryableStatuses = [400, 401, 403, 404, 409, 422, 500, 501];

  it('retries GET on a pure network error', () => {
    expect(classifyRetry('GET', '/x', { kind: 'network' }).retry).toBe(true);
  });

  it.each(retryableStatuses)('retries GET on retryable status %s', (status) => {
    expect(classifyRetry('GET', '/x', { kind: 'http', status }).retry).toBe(true);
  });

  it.each(nonRetryableStatuses)('does NOT retry GET on non-retryable status %s', (status) => {
    expect(classifyRetry('GET', '/x', { kind: 'http', status }).retry).toBe(false);
  });

  it.each(['POST', 'PATCH', 'PUT', 'DELETE'] as const)('never retries write method %s (network)', (method) => {
    expect(classifyRetry(method, '/x', { kind: 'network' }).retry).toBe(false);
  });

  it.each(['POST', 'PATCH', 'PUT', 'DELETE'] as const)('never retries write method %s (503)', (method) => {
    expect(classifyRetry(method, '/x', { kind: 'http', status: 503 }).retry).toBe(false);
  });

  it('never retries an aborted request even for a GET', () => {
    expect(classifyRetry('GET', '/x', { kind: 'aborted' }).retry).toBe(false);
  });

  it('stops retrying once the attempt cap is reached', () => {
    // attempt is the number of attempts already made (1-based for the just-failed try).
    expect(classifyRetry('GET', '/x', { kind: 'network' }, MAX_RETRIES).retry).toBe(false);
    expect(classifyRetry('GET', '/x', { kind: 'network' }, MAX_RETRIES + 5).retry).toBe(false);
  });

  it('never retries GET 429 in a tight loop (no Retry-After)', () => {
    const d = classifyRetry('GET', '/x', { kind: 'http', status: 429 });
    expect(d.retry).toBe(false);
  });

  it('retries GET 429 only when Retry-After is within the sane cap', () => {
    const within = classifyRetry('GET', '/x', { kind: 'http', status: 429, retryAfterMs: 2000 });
    expect(within.retry).toBe(true);
    expect(within.delayMs).toBe(2000);
  });

  it('does NOT retry GET 429 when Retry-After exceeds the cap (surfaces instead)', () => {
    const tooLong = classifyRetry('GET', '/x', {
      kind: 'http',
      status: 429,
      retryAfterMs: RETRY_AFTER_CAP_MS + 1000,
    });
    expect(tooLong.retry).toBe(false);
  });

  it('honors Retry-After on a retryable 503 as the exact delay', () => {
    const d = classifyRetry('GET', '/x', { kind: 'http', status: 503, retryAfterMs: 1500 });
    expect(d.retry).toBe(true);
    expect(d.delayMs).toBe(1500);
  });

  it('does not retry a 503 whose Retry-After exceeds the cap', () => {
    const d = classifyRetry('GET', '/x', { kind: 'http', status: 503, retryAfterMs: RETRY_AFTER_CAP_MS + 1 });
    expect(d.retry).toBe(false);
  });
});

describe('computeBackoffDelay — exponential with full jitter', () => {
  it('stays within [0, min(base * 2^n, cap)] for every attempt', () => {
    const spy = jest.spyOn(Math, 'random');
    for (const r of [0, 0.25, 0.5, 0.9999]) {
      spy.mockReturnValue(r);
      for (let attempt = 1; attempt <= 6; attempt++) {
        const ceiling = Math.min(BACKOFF_BASE_MS * 2 ** (attempt - 1), BACKOFF_MAX_MS);
        const delay = computeBackoffDelay(attempt);
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(ceiling);
      }
    }
    spy.mockRestore();
  });

  it('full jitter: random=0 yields 0 delay', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(computeBackoffDelay(3)).toBe(0);
    spy.mockRestore();
  });

  it('full jitter: random→1 approaches the capped ceiling', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.999999);
    // attempt 1 ceiling is BACKOFF_BASE_MS
    expect(computeBackoffDelay(1)).toBeGreaterThan(BACKOFF_BASE_MS * 0.9);
    expect(computeBackoffDelay(1)).toBeLessThanOrEqual(BACKOFF_BASE_MS);
    // deep attempts are capped
    expect(computeBackoffDelay(10)).toBeLessThanOrEqual(BACKOFF_MAX_MS);
    spy.mockRestore();
  });

  it('never exceeds the absolute cap regardless of attempt depth', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(1);
    for (let attempt = 1; attempt <= 20; attempt++) {
      expect(computeBackoffDelay(attempt)).toBeLessThanOrEqual(BACKOFF_MAX_MS);
    }
    spy.mockRestore();
  });
});

describe('parseRetryAfter', () => {
  it('parses delta-seconds into milliseconds', () => {
    expect(parseRetryAfter('2')).toBe(2000);
    expect(parseRetryAfter('0')).toBe(0);
  });

  it('parses an HTTP-date into a millisecond delay from now', () => {
    const future = new Date(Date.now() + 3000).toUTCString();
    const ms = parseRetryAfter(future);
    // allow a little slack for clock/rounding
    expect(ms).toBeGreaterThanOrEqual(2000);
    expect(ms).toBeLessThanOrEqual(4000);
  });

  it('returns undefined for missing or garbage values', () => {
    expect(parseRetryAfter(null)).toBeUndefined();
    expect(parseRetryAfter(undefined)).toBeUndefined();
    expect(parseRetryAfter('not-a-date')).toBeUndefined();
  });

  it('clamps a past HTTP-date to 0', () => {
    const past = new Date(Date.now() - 5000).toUTCString();
    expect(parseRetryAfter(past)).toBe(0);
  });
});

describe('createReadCircuit — open → cool-down → half-open → close', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('starts closed and permits requests', () => {
    const c = createReadCircuit();
    expect(c.getState().status).toBe('closed');
    expect(c.canRequest()).toBe(true);
  });

  it('opens only after the consecutive-failure threshold', () => {
    const c = createReadCircuit();
    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD - 1; i++) c.onFailure();
    expect(c.getState().status).toBe('closed');
    expect(c.canRequest()).toBe(true);
    c.onFailure(); // crosses the threshold
    expect(c.getState().status).toBe('open');
    expect(c.canRequest()).toBe(false);
  });

  it('a success resets the consecutive-failure counter', () => {
    const c = createReadCircuit();
    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD - 1; i++) c.onFailure();
    c.onSuccess(); // reset
    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD - 1; i++) c.onFailure();
    expect(c.getState().status).toBe('closed');
  });

  it('moves to half-open after the cool-down and allows exactly one probe', () => {
    const c = createReadCircuit();
    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD; i++) c.onFailure();
    expect(c.canRequest()).toBe(false);

    jest.advanceTimersByTime(CIRCUIT_COOLDOWN_MS + 1);
    // first probe allowed
    expect(c.canRequest()).toBe(true);
    expect(c.getState().status).toBe('half-open');
    // second concurrent caller is blocked while the single probe is in flight
    expect(c.canRequest()).toBe(false);
  });

  it('closes on a successful half-open probe', () => {
    const c = createReadCircuit();
    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD; i++) c.onFailure();
    jest.advanceTimersByTime(CIRCUIT_COOLDOWN_MS + 1);
    expect(c.canRequest()).toBe(true); // take the probe slot
    c.onSuccess();
    expect(c.getState().status).toBe('closed');
    expect(c.canRequest()).toBe(true);
  });

  it('re-opens (new cool-down) when the half-open probe fails', () => {
    const c = createReadCircuit();
    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD; i++) c.onFailure();
    jest.advanceTimersByTime(CIRCUIT_COOLDOWN_MS + 1);
    expect(c.canRequest()).toBe(true); // probe slot
    c.onFailure(); // probe fails
    expect(c.getState().status).toBe('open');
    expect(c.canRequest()).toBe(false);
    // must wait a fresh cool-down again
    jest.advanceTimersByTime(CIRCUIT_COOLDOWN_MS + 1);
    expect(c.canRequest()).toBe(true);
  });

  it('notifies subscribers on state transitions', () => {
    const c = createReadCircuit();
    const seen: string[] = [];
    const unsub = c.subscribe((s) => seen.push(s.status));
    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD; i++) c.onFailure();
    expect(seen).toContain('open');
    unsub();
    const len = seen.length;
    c.onSuccess();
    expect(seen.length).toBe(len); // no notifications after unsubscribe
  });

  it('reset() forces the circuit closed and clears timers', () => {
    const c = createReadCircuit();
    for (let i = 0; i < CIRCUIT_FAILURE_THRESHOLD; i++) c.onFailure();
    expect(c.getState().status).toBe('open');
    c.reset();
    expect(c.getState().status).toBe('closed');
    expect(c.canRequest()).toBe(true);
  });
});
