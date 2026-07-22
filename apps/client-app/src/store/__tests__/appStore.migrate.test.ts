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

  it('strips device-local saved bookmarks when upgrading to v3', () => {
    const migrated = migratePersistedState({ area: 'Bole', lang: 'en', saved: { p1: true } }, 2) as Record<string, unknown>;
    expect(migrated.saved).toBeUndefined();
    expect(migrated.area).toBe('Bole');
  });

  it('keeps non-auth preferences (area / lang) untouched', () => {
    const migrated = migratePersistedState(legacyPersistedState(), 0) as Record<string, unknown>;
    expect(migrated.area).toBe('Piassa');
    expect(migrated.lang).toBe('am');
    // Saved is stripped on v0→v3 migration path (version < 3).
    expect(migrated.saved).toBeUndefined();
    // Nothing sensitive leaks through.
    expect(Object.keys(migrated).sort()).toEqual(['area', 'lang']);
  });

  it('is a no-op safe on null/undefined persisted state', () => {
    expect(migratePersistedState(null, 0)).toBeNull();
    expect(migratePersistedState(undefined, 0)).toBeUndefined();
  });
});

describe('appStore migratePersistedState (area realignment, v1 -> v2)', () => {
  it('resets areas that left the canonical list to the city-wide default', () => {
    const oldSentinel = migratePersistedState({ area: 'All Addis Ababa', lang: 'en', saved: {} }, 1) as Record<string, unknown>;
    expect(oldSentinel.area).toBe('Addis Ababa');

    const droppedSubCity = migratePersistedState({ area: 'Kirkos', lang: 'en', saved: {} }, 1) as Record<string, unknown>;
    expect(droppedSubCity.area).toBe('Addis Ababa');
  });

  it('keeps areas that are still canonical', () => {
    const migrated = migratePersistedState({ area: 'Bole', lang: 'en', saved: {} }, 1) as Record<string, unknown>;
    expect(migrated.area).toBe('Bole');
  });

  it('leaves a missing area to the store default', () => {
    const migrated = migratePersistedState({ lang: 'en', saved: {} }, 1) as Record<string, unknown>;
    expect(migrated.area).toBeUndefined();
  });
});
