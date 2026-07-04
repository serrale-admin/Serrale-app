import { checkInstallation } from '../installation';
import { secureSession } from '../secure-session';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../secure-session', () => ({
  secureSession: {
    read: jest.fn(),
    write: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  const mockStorage = {
    getItem: jest.fn(async (key: string) => store[key] || null),
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
      return null;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
      return null;
    }),
    _clear: () => {
      store = {};
    },
  };
  return {
    __esModule: true,
    default: mockStorage,
  };
});

describe('installation', () => {
  beforeEach(() => {
    (AsyncStorage as any)._clear();
    jest.clearAllMocks();
  });

  it('should clear secure session and set install marker on first launch (stale keychain survivor)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (secureSession.read as jest.Mock).mockResolvedValue({
      accessToken: 'stale-access',
      refreshToken: 'stale-refresh',
      accessExpiresAt: '2026-07-04T10:00:00.000Z',
    });

    await checkInstallation();

    expect(secureSession.clear).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('serrale_install_marker', 'installed');
  });

  it('should not clear secure session if installation marker is present', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('installed');

    await checkInstallation();

    expect(secureSession.clear).not.toHaveBeenCalled();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});
