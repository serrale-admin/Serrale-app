/**
 * Redaction fixture — the security core of Task 8.
 *
 * Every field a log line or crash breadcrumb might carry that could leak PII or a
 * secret is exercised here against a REALISTIC leaky payload: an Ethiopian phone
 * (both +2519 and 09 forms), an OTP code, an access/refresh/verify token, a raw
 * JWT, an `Authorization: Bearer` header, and a deeply-nested request body. The
 * contract: after `redact()`, NONE of those raw values survive anywhere in the
 * output — not as an object value, not embedded in a free-text string, not in a
 * nested array. Default to over-redaction; a missed JWT in a nested object is a
 * finding.
 */
import { redact, REDACTED } from '../redact';

/** Assert a value (deeply) contains no trace of any secret substring. */
function assertNoSecret(value: unknown, secrets: string[]): void {
  const serialized = JSON.stringify(value);
  for (const secret of secrets) {
    expect(serialized).not.toContain(secret);
  }
}

// Realistic-but-fake secrets. None are real credentials.
const PHONE_INTL = '+251912345678';
const PHONE_LOCAL = '0912345678';
const OTP = '482913';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LTEiLCJwaG9uZSI6IisyNTE5MTIzNDU2NzgifQ.s3cr3tSignatureABCDEF';
// Production refresh tokens are unprefixed, 32-byte base64url values (43 chars).
const REFRESH_TOKEN = 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE';
const VERIFY_TOKEN = 'vt_aabbccddeeff00112233445566778899';
const BEARER = `Bearer ${ACCESS_TOKEN}`;

const ALL_SECRETS = [PHONE_INTL, PHONE_LOCAL, OTP, ACCESS_TOKEN, REFRESH_TOKEN, VERIFY_TOKEN];

describe('redact()', () => {
  it('redacts a bare Ethiopian phone number in intl (+2519) form inside a string', () => {
    const out = redact(`SMS sent to ${PHONE_INTL} ok`);
    expect(out).not.toContain(PHONE_INTL);
    expect(out).toContain(REDACTED);
  });

  it('redacts a bare Ethiopian phone number in local (09) form inside a string', () => {
    const out = redact(`user ${PHONE_LOCAL} requested otp`) as string;
    expect(out).not.toContain(PHONE_LOCAL);
    expect(out).toContain(REDACTED);
  });

  it('redacts a JWT embedded in a free-text string', () => {
    const out = redact(`token=${ACCESS_TOKEN} expired`) as string;
    expect(out).not.toContain(ACCESS_TOKEN);
  });

  it('redacts an Authorization Bearer value inside a string', () => {
    const out = redact(`header Authorization: ${BEARER}`) as string;
    expect(out).not.toContain(ACCESS_TOKEN);
  });

  it('redacts an OTP embedded in free text', () => {
    const out = redact(`OTP ${OTP} is valid for five minutes`) as string;
    expect(out).not.toContain(OTP);
    expect(out).toContain(REDACTED);
  });

  it('redacts a real unprefixed 43-character base64url refresh token in free text', () => {
    const out = redact(`refresh failed for ${REFRESH_TOKEN}`) as string;
    expect(out).not.toContain(REFRESH_TOKEN);
    expect(out).toContain(REDACTED);
  });

  it('redacts a value by sensitive KEY name regardless of the value shape', () => {
    const out = redact({
      phone: PHONE_LOCAL,
      otp: OTP,
      code: OTP,
      access_token: ACCESS_TOKEN,
      accessToken: ACCESS_TOKEN,
      refresh_token: REFRESH_TOKEN,
      refreshToken: REFRESH_TOKEN,
      verify_token: VERIFY_TOKEN,
      Authorization: BEARER,
      authorization: BEARER,
      password: 'hunter2',
    }) as Record<string, unknown>;

    for (const key of Object.keys(out)) {
      expect(out[key]).toBe(REDACTED);
    }
    assertNoSecret(out, [...ALL_SECRETS, 'hunter2']);
  });

  it('deep-redacts secrets nested in objects and arrays', () => {
    const leaky = {
      level1: {
        headers: { Authorization: BEARER, 'X-Request-Id': 'req-123' },
        body: {
          phone: PHONE_INTL,
          challenge: { otp: OTP, note: `resend to ${PHONE_LOCAL}` },
        },
        tokens: [ACCESS_TOKEN, REFRESH_TOKEN, { verify_token: VERIFY_TOKEN }],
      },
      trail: `Bearer ${ACCESS_TOKEN} used for ${PHONE_INTL}`,
    };

    const out = redact(leaky);
    assertNoSecret(out, ALL_SECRETS);
    // A non-sensitive correlation id must survive — over-redaction must not eat
    // the request id we rely on for breadcrumbs.
    expect(JSON.stringify(out)).toContain('req-123');
  });

  it('redacts personal request-body fields by key at any depth', () => {
    const out = redact({
      body: {
        name: 'Abebe Kebede',
        fullName: 'Almaz Tesfaye',
        email: 'abebe@example.com',
        location: 'Bole, Addis Ababa',
        address: 'House 4, Example Street',
        description: 'I need plumbing at my home',
        note: 'Call after work',
        serviceNeed: 'Leaking sink in bedroom',
      },
    }) as { body: Record<string, unknown> };

    for (const value of Object.values(out.body)) expect(value).toBe(REDACTED);
  });

  it('redacts an Error message + stack that leak a token and a phone', () => {
    const err = new Error(`refresh failed for ${PHONE_INTL} with ${BEARER}`);
    const out = redact(err) as unknown as Record<string, unknown>;
    assertNoSecret(out, ALL_SECRETS);
  });

  it('handles null, undefined, numbers and booleans without throwing', () => {
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
    expect(redact(42)).toBe(42);
    expect(redact(true)).toBe(true);
  });

  it('does not blow the stack on a circular structure', () => {
    const a: Record<string, unknown> = { phone: PHONE_LOCAL };
    a.self = a;
    const out = redact(a) as Record<string, unknown>;
    expect(out.phone).toBe(REDACTED);
    // The cycle is broken, not recursed into forever.
    expect(out.self).toBeDefined();
  });

  it('redacts a 12-digit international phone without the plus', () => {
    const out = redact('id 251912345678 ok') as string;
    expect(out).not.toContain('251912345678');
  });

  // --- T9 adversarial additions ---------------------------------------------

  it('redacts the SPACED national display form (0912 345 678) in free text', () => {
    const out = redact('SMS sent to 0912 345 678 ok') as string;
    expect(out).not.toContain('0912 345 678');
    expect(out).toContain(REDACTED);
  });

  it('redacts the spaced mask form (912 345 678) and dash / intl variants', () => {
    expect(redact('caller 912 345 678') as string).not.toContain('912 345 678');
    expect(redact('dialing 0912-345-678 now') as string).not.toContain('0912-345-678');
    expect(redact('intl +251 912 345 678') as string).not.toContain('912 345 678');
  });

  it('redacts a spaced phone nested deep inside a free-text field', () => {
    const out = redact({ level1: { trail: 'resend to 0912 345 678 failed' } });
    expect(JSON.stringify(out)).not.toContain('0912 345 678');
  });

  it('redacts a JWT that rides under an oddly-named (non-sensitive) key via value scrub', () => {
    // `blob` is NOT in the sensitive-key list, so only value-based scrubbing can
    // catch the token — proving the free-text layer is a real second line.
    const out = redact({ blob: `payload=${ACCESS_TOKEN} trailing` }) as { blob: string };
    expect(out.blob).not.toContain(ACCESS_TOKEN);
    expect(out.blob).toContain(REDACTED);
  });

  it('does not over-redact an ordinary 9-digit id that is not phone-shaped', () => {
    // A bare 9-digit run that is not a leading-9 mobile and is not grouped must
    // survive — over-redaction must not eat unrelated identifiers.
    const out = redact('order 123456789 shipped') as string;
    expect(out).toContain('123456789');
  });
});
