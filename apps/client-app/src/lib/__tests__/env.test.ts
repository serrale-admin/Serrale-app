import { assertProductionEnv, parseUseMock } from '../env';

/**
 * The production env guard (Task 12) must FAIL a release build whose resolved
 * API config is unsafe — mock mode, a relative/static-host URL, a non-HTTPS
 * origin, or a local host — and PASS for a real https:// origin. It is exercised
 * here by calling the pure exported function with explicit args; the module-load
 * invocation is gated on `!__DEV__`, which stays true under Jest, so importing
 * this module never throws.
 */
describe('assertProductionEnv', () => {
  it('passes for a real https production origin with mock off', () => {
    expect(() => assertProductionEnv('https://api.serrale.com/api', false)).not.toThrow();
  });

  it('passes for another https origin', () => {
    expect(() => assertProductionEnv('https://serrale.com', false)).not.toThrow();
  });

  it('throws when mock mode is enabled', () => {
    expect(() => assertProductionEnv('https://api.serrale.com/api', true)).toThrow(
      /USE_MOCK is enabled/i,
    );
  });

  it.each([
    ['plain http', 'http://api.serrale.com/api', /must use HTTPS/i],
    ['http localhost with port', 'http://localhost:3000/api', /HTTPS|local host/i],
    ['https localhost', 'https://localhost/api', /local host/i],
    ['loopback ip', 'https://127.0.0.1:8081/api', /local host/i],
    ['0.0.0.0 host', 'https://0.0.0.0/api', /local host/i],
    ['ipv6 loopback', 'https://[::1]/api', /local host/i],
    ['.local mDNS host', 'https://my-mac.local/api', /local host/i],
    ['relative path', '/api', /not an absolute URL/i],
    ['bare host no scheme', 'api.serrale.com/api', /not an absolute URL/i],
    ['empty string', '', /not an absolute URL/i],
  ])('throws for %s', (_label, url, pattern) => {
    expect(() => assertProductionEnv(url, false)).toThrow(pattern);
  });

  it('aggregates multiple problems into one error', () => {
    let message = '';
    try {
      assertProductionEnv('http://localhost:3000', true);
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toMatch(/USE_MOCK is enabled/i);
    expect(message).toMatch(/HTTPS/i);
    expect(message).toMatch(/local host/i);
  });
});

/**
 * USE_MOCK must be an EXPLICIT opt-in: on only for the exact (trimmed,
 * case-insensitive) string 'true'. Any other value — including typos — keeps
 * the app on live data.
 */
describe('parseUseMock', () => {
  it.each([
    ['exact true', 'true', true],
    ['uppercase TRUE', 'TRUE', true],
    ['padded true', '  true  ', true],
    ['exact false', 'false', false],
    ['unset', undefined, false],
    ['empty', '', false],
    ['typo no', 'no', false],
    ['typo off', 'off', false],
    ['numeric 1', '1', false],
    ['yes', 'yes', false],
  ])('%s => %s', (_label, value, expected) => {
    expect(parseUseMock(value as string | undefined)).toBe(expected);
  });
});
