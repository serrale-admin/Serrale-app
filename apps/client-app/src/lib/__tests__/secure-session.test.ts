import { secureSession } from '../secure-session';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => {
  let store: Record<string, string> = {};
  return {
    getItemAsync: jest.fn(async (key: string) => store[key] || null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      delete store[key];
    }),
    _clear: () => {
      store = {};
    },
  };
});

describe('secure-session', () => {
  beforeEach(() => {
    (SecureStore as any)._clear();
    jest.clearAllMocks();
  });

  it('should write and read tokens successfully', async () => {
    const tokens = {
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
      accessExpiresAt: '2026-07-04T10:00:00.000Z',
    };

    await secureSession.write(tokens);
    const read = await secureSession.read();

    expect(read).toEqual(tokens);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('serrale_customer_tokens', JSON.stringify(tokens));
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('serrale_customer_tokens');
  });

  it('should return null when reading empty session', async () => {
    const read = await secureSession.read();
    expect(read).toBeNull();
  });

  it('should clear stored session tokens', async () => {
    const tokens = {
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
      accessExpiresAt: '2026-07-04T10:00:00.000Z',
    };

    await secureSession.write(tokens);
    await secureSession.clear();
    const read = await secureSession.read();

    expect(read).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('serrale_customer_tokens');
  });
});
