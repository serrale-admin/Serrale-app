import { HttpError } from '../http';
import {
  DEFAULT_RESEND_COOLDOWN_SECONDS,
  formatRetryMessage,
  parseRetryInfo,
  retryInfoFromError,
} from '../otp-retry';

// A fixed "now" so next_allowed_at deltas are deterministic.
const NOW = new Date('2026-07-05T12:00:00.000Z').getTime();

describe('parseRetryInfo — the three server field shapes', () => {
  it('reads retry_after_seconds from the error body (OTP_COOLDOWN shape)', () => {
    const info = parseRetryInfo(
      { code: 'OTP_COOLDOWN', retry_after_seconds: 42 },
      new Headers(),
      NOW,
    );
    expect(info.seconds).toBe(42);
  });

  it('reads next_allowed_at from the error body and converts to a delta (window/daily shape)', () => {
    const nextAllowed = new Date(NOW + 90_000).toISOString();
    const info = parseRetryInfo(
      { code: 'OTP_PHONE_RATE_LIMITED', next_allowed_at: nextAllowed },
      new Headers(),
      NOW,
    );
    expect(info.seconds).toBe(90);
    expect(info.nextAllowedAt).toBe(nextAllowed);
  });

  it('reads the Retry-After header when the body carries no retry fields (IP limiter)', () => {
    const headers = new Headers({ 'Retry-After': '120' });
    const info = parseRetryInfo({ code: 'OTP_IP_RATE_LIMITED' }, headers, NOW);
    expect(info.seconds).toBe(120);
  });

  it('reads the RateLimit-Reset header (express standardHeaders) as a fallback', () => {
    const headers = new Headers({ 'RateLimit-Reset': '75' });
    const info = parseRetryInfo({ code: 'OTP_IP_RATE_LIMITED' }, headers, NOW);
    expect(info.seconds).toBe(75);
  });
});

describe('parseRetryInfo — precedence and the stricter-wins rule', () => {
  it('prefers the LARGER of retry_after_seconds and the next_allowed_at delta (server strictness wins)', () => {
    const nextAllowed = new Date(NOW + 300_000).toISOString(); // 300s
    const info = parseRetryInfo(
      { code: 'OTP_DAILY_LIMIT', retry_after_seconds: 60, next_allowed_at: nextAllowed },
      new Headers(),
      NOW,
    );
    // 300 (next_allowed_at) is stricter than 60 (retry_after_seconds) → 300.
    expect(info.seconds).toBe(300);
  });

  it('prefers body fields over the Retry-After header when both exist', () => {
    const headers = new Headers({ 'Retry-After': '10' });
    const info = parseRetryInfo({ code: 'OTP_COOLDOWN', retry_after_seconds: 55 }, headers, NOW);
    expect(info.seconds).toBe(55);
  });

  it('ignores a Retry-After HTTP-date and does not crash (only numeric deltas are used)', () => {
    const headers = new Headers({ 'Retry-After': 'Wed, 21 Oct 2026 07:28:00 GMT' });
    const info = parseRetryInfo({ code: 'OTP_IP_RATE_LIMITED' }, headers, NOW);
    expect(info.seconds).toBeNull();
  });

  it('returns null seconds when nothing usable is present', () => {
    const info = parseRetryInfo({ code: 'SOMETHING' }, new Headers(), NOW);
    expect(info.seconds).toBeNull();
    expect(info.nextAllowedAt).toBeNull();
  });

  it('clamps a stale/past next_allowed_at to 0 rather than a negative delta', () => {
    const past = new Date(NOW - 5_000).toISOString();
    const info = parseRetryInfo({ next_allowed_at: past }, new Headers(), NOW);
    expect(info.seconds).toBe(0);
  });
});

describe('retryInfoFromError — raw signals captured on HttpError by http.ts', () => {
  it('parses body retry_after_seconds off retryRaw', () => {
    const e = new HttpError(429, 'cooldown', 'OTP_COOLDOWN');
    e.retryRaw = { body: { retry_after_seconds: 42 }, retryAfter: null, rateLimitReset: null };
    expect(retryInfoFromError(e, NOW).seconds).toBe(42);
  });

  it('parses next_allowed_at off retryRaw and keeps the timestamp', () => {
    const nextAllowed = new Date(NOW + 90_000).toISOString();
    const e = new HttpError(429, 'limited', 'OTP_PHONE_RATE_LIMITED');
    e.retryRaw = { body: { next_allowed_at: nextAllowed }, retryAfter: null, rateLimitReset: null };
    const info = retryInfoFromError(e, NOW);
    expect(info.seconds).toBe(90);
    expect(info.nextAllowedAt).toBe(nextAllowed);
  });

  it('falls back to the captured Retry-After / RateLimit-Reset headers (IP limiter)', () => {
    const e = new HttpError(429, 'ip limited', 'OTP_IP_RATE_LIMITED');
    e.retryRaw = { body: undefined, retryAfter: '120', rateLimitReset: null };
    expect(retryInfoFromError(e, NOW).seconds).toBe(120);

    const e2 = new HttpError(429, 'ip limited', 'OTP_IP_RATE_LIMITED');
    e2.retryRaw = { body: undefined, retryAfter: null, rateLimitReset: '75' };
    expect(retryInfoFromError(e2, NOW).seconds).toBe(75);
  });

  it('returns empty info for errors without retryRaw (plain HttpError, Error, undefined)', () => {
    expect(retryInfoFromError(new HttpError(429, 'no data'))).toEqual({ seconds: null, nextAllowedAt: null });
    expect(retryInfoFromError(new Error('x'))).toEqual({ seconds: null, nextAllowedAt: null });
    expect(retryInfoFromError(undefined)).toEqual({ seconds: null, nextAllowedAt: null });
  });
});

describe('formatRetryMessage', () => {
  it('renders seconds under a minute', () => {
    expect(formatRetryMessage({ seconds: 45, nextAllowedAt: null })).toMatch(/45 second/);
  });

  it('renders minutes for longer waits', () => {
    expect(formatRetryMessage({ seconds: 600, nextAllowedAt: null })).toMatch(/10 minute/);
  });

  it('falls back to a generic wait message when no seconds are known', () => {
    expect(formatRetryMessage({ seconds: null, nextAllowedAt: null })).toMatch(/wait a moment/i);
  });
});

describe('DEFAULT_RESEND_COOLDOWN_SECONDS', () => {
  it('matches the backend OTP_COOLDOWN_SECONDS constant (60s)', () => {
    expect(DEFAULT_RESEND_COOLDOWN_SECONDS).toBe(60);
  });
});
