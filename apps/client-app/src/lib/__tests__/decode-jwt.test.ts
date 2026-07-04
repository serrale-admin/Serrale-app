import { decodeJwt } from '../session-manager';

// The API and stores are mocked so importing session-manager does not pull in
// native modules. We only exercise the pure-JS decodeJwt export here.
jest.mock('../../api', () => ({
  exchangeSession: jest.fn(),
  refreshSession: jest.fn(),
  logoutSession: jest.fn(),
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

/**
 * Build a JWT-shaped string from a payload. The base64url encoding here is only
 * test-fixture construction; the decode under test (decodeJwt) uses no atob /
 * TextDecoder / Buffer, so it must work identically on Hermes.
 */
function makeJwt(payload: object): string {
  const b64 = (obj: object) =>
    Buffer.from(JSON.stringify(obj), 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`;
}

describe('decodeJwt (Hermes-safe, no TextDecoder/atob)', () => {
  it('decodes a plain ASCII payload', () => {
    const token = makeJwt({ customer_id: 'cust-1', phone: '+251912345678', scope: 'directory_customer' });
    expect(decodeJwt(token)).toEqual({
      customer_id: 'cust-1',
      phone: '+251912345678',
      scope: 'directory_customer',
    });
  });

  it('decodes a payload with multi-byte UTF-8 (Amharic name) correctly', () => {
    // "አበበ ከበደ" is 3-byte-per-glyph Amharic — this is exactly the case where a
    // naive charCodeAt/atob decode corrupts the string on-device.
    const amharic = 'አበበ ከበደ';
    const token = makeJwt({ customer_id: 'cust-42', phone: '+251911223344', name: amharic });
    const decoded = decodeJwt(token) as { name?: string; customer_id?: string };
    expect(decoded?.name).toBe(amharic);
    expect(decoded?.customer_id).toBe('cust-42');
  });

  it('decodes emoji (4-byte surrogate pair) correctly', () => {
    const token = makeJwt({ note: '👍🏽 ok' });
    expect((decodeJwt(token) as { note?: string })?.note).toBe('👍🏽 ok');
  });

  it('returns null for a malformed (non 3-part) token', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
    expect(decodeJwt('a.b')).toBeNull();
  });

  it('returns null when the payload is not valid JSON', () => {
    const bad = `${Buffer.from('{}').toString('base64')}.${Buffer.from('not json', 'utf-8').toString('base64')}.sig`;
    expect(decodeJwt(bad)).toBeNull();
  });
});
