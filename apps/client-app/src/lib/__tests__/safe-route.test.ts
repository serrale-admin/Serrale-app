import { DEFAULT_POST_LOGIN_ROUTE, safeNextRoute } from '../safe-route';

describe('safeNextRoute', () => {
  it('passes through a legitimate internal path', () => {
    expect(safeNextRoute('/(tabs)/request')).toBe('/(tabs)/request');
    expect(safeNextRoute('/provider/abc-123')).toBe('/provider/abc-123');
  });

  it('preserves query/nested internal paths', () => {
    expect(safeNextRoute('/categories/plumbing')).toBe('/categories/plumbing');
  });

  it.each([
    ['empty', ''],
    ['whitespace only', '   '],
    ['relative (no leading slash)', 'home'],
    ['absolute http', 'http://evil.com'],
    ['absolute https', 'https://evil.com/phish'],
    ['protocol-relative', '//evil.com'],
    ['custom scheme', 'serrale://evil'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['scheme after slash', '/javascript:alert(1)'],
    ['backslash smuggling', '/\\evil.com'],
    ['double backslash', '\\\\evil.com'],
    ['embedded backslash', '/path\\to\\evil'],
  ])('falls back to the default for %s', (_label, input) => {
    expect(safeNextRoute(input)).toBe(DEFAULT_POST_LOGIN_ROUTE);
  });

  it('falls back for non-string values (undefined param)', () => {
    expect(safeNextRoute(undefined)).toBe(DEFAULT_POST_LOGIN_ROUTE);
    expect(safeNextRoute(null)).toBe(DEFAULT_POST_LOGIN_ROUTE);
    expect(safeNextRoute(42 as unknown as string)).toBe(DEFAULT_POST_LOGIN_ROUTE);
  });

  it('honours a custom fallback', () => {
    expect(safeNextRoute('http://evil.com', '/(tabs)/home')).toBe('/(tabs)/home');
  });
});
