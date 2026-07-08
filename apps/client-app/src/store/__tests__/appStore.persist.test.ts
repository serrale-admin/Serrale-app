/**
 * Language persistence contract (Task 7).
 *
 * The selected language must survive an app restart and must live in ordinary
 * (AsyncStorage) preference storage — never in the secure token store. These
 * tests drive the REAL zustand `persist` middleware: one asserts the write shape,
 * the other asserts a cold-start rehydrate restores the value.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../appStore';

// babel-jest hoists this above the imports, so the store loads with it in place.
jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k: string) => store[k] ?? null),
      setItem: jest.fn(async (k: string, v: string) => {
        store[k] = v;
      }),
      removeItem: jest.fn(async (k: string) => {
        delete store[k];
      }),
      __reset: () => {
        store = {};
      },
    },
  };
});

const STORAGE_KEY = 'serrale-basic-app';

beforeEach(() => {
  (AsyncStorage as unknown as { __reset(): void }).__reset();
  (AsyncStorage.setItem as jest.Mock).mockClear();
  useAppStore.setState({ lang: 'en' });
});

describe('language persistence', () => {
  it('persists the chosen language to AsyncStorage (preference storage, not secure token storage)', async () => {
    useAppStore.getState().setLang('am');
    // Let the persist middleware flush its write.
    await Promise.resolve();

    const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
    const write = calls.reverse().find((c) => c[0] === STORAGE_KEY);
    expect(write).toBeDefined();
    const payload = JSON.parse(write![1]);
    expect(payload.state.lang).toBe('am');
    // Preference storage only — the persisted blob never carries auth secrets.
    expect(write![1]).not.toMatch(/verifyToken|userToken|access|refresh/i);
  });

  it('restores the language from storage on a cold start (rehydrate)', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { lang: 'am', area: 'Bole', saved: {} }, version: 2 }),
    );

    await useAppStore.persist.rehydrate();

    expect(useAppStore.getState().lang).toBe('am');
  });
});
