import { migratePersistedState } from '../appStore';

// Importing appStore pulls in AsyncStorage (for persist); mock the native module.
// jest.mock is hoisted above imports by babel-jest, so the mock is in place first.
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));

/** A pre-upgrade (version 0) persisted blob that still carried plaintext auth. */
function legacyPersistedState() {
  return {
    loggedIn: true,
    user: { id: 'old-1', name: 'Legacy User', phone: '+251900000000' },
    verifyToken: 'LEAKED-VERIFY-TOKEN',
    userToken: 'LEAKED-USER-TOKEN',
    area: 'Piassa',
    lang: 'am',
    saved: { p1: true },
  };
}

describe('appStore migratePersistedState (legacy auth strip, v0 -> v1)', () => {
  it('strips legacy verifyToken / loggedIn / user / userToken', () => {
    const migrated = migratePersistedState(legacyPersistedState(), 0) as Record<string, unknown>;
    expect(migrated.verifyToken).toBeUndefined();
    expect(migrated.loggedIn).toBeUndefined();
    expect(migrated.user).toBeUndefined();
    expect(migrated.userToken).toBeUndefined();
  });

  it('keeps non-auth preferences (area / lang / saved) untouched', () => {
    const migrated = migratePersistedState(legacyPersistedState(), 0) as Record<string, unknown>;
    expect(migrated.area).toBe('Piassa');
    expect(migrated.lang).toBe('am');
    expect(migrated.saved).toEqual({ p1: true });
    // Nothing sensitive leaks through.
    expect(Object.keys(migrated).sort()).toEqual(['area', 'lang', 'saved']);
  });

  it('is a no-op safe on null/undefined persisted state', () => {
    expect(migratePersistedState(null, 0)).toBeNull();
    expect(migratePersistedState(undefined, 0)).toBeUndefined();
  });
});
