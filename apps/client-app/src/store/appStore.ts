import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AREA_ALL, AREAS } from '../data/mock';
import type { Filters, Lang } from '../types';

/** Minimal placeholder for the authenticated user shape. The concrete type
 *  lives server-side; the mobile store only needs something structurally
 *  compatible with what the UI consumes (`name`, `phone`). Replace with a
 *  real type when the auth client exposes one. */
interface AuthUser {
  id?: string;
  name: string;
  phone: string;
}

const emptyFilters = (): Filters => ({
  areas: [],
  avail: [],
  trust: [],
  rating: 'Any',
  contact: [],
  price: [],
  exp: [],
});

interface Toast {
  text: string;
  icon: string;
}

interface AppState {
  // session
  loggedIn: boolean;
  user: AuthUser | null;
  pendingPhone: string;
  pendingChallengeId: string;
  login(user: AuthUser): void;
  logout(): void;
  setPendingPhone(phone: string): void;
  setPendingChallengeId(id: string): void;

  // preferences
  area: string;
  lang: Lang;
  setArea(area: string): void;
  setLang(lang: Lang): void;

  // saved providers (local for the mock backend)
  saved: Record<string, boolean>;
  isSaved(id: string): boolean;
  toggleSaved(id: string): boolean;

  // discovery filters (shared between Search and Category screens)
  filters: Filters;
  toggleFilter(key: keyof Filters, value: string): void;
  /**
   * Single-select area filter: the backend matches exactly one `?area=` value
   * (ilike), so selecting an area replaces any previous one; selecting the
   * active area again clears it.
   */
  selectAreaFilter(area: string): void;
  setRating(value: string): void;
  toggleQuick(kind: string): void;
  resetFilters(): void;
  activeFilterCount(): number;

  // transient toast
  toast: Toast | null;
  showToast(text: string, icon?: string): void;
  hideToast(): void;
}

const toggleArr = (arr: string[], val: string): string[] =>
  arr.includes(val) ? arr.filter((x) => x !== val) : arr.concat([val]);

let toastTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Persistence migration. Exported for unit testing.
 *
 * v0 → v1: older installs persisted plaintext auth (verifyToken / loggedIn /
 * user / userToken) alongside prefs. Strip those so upgraded installs shed the
 * old tokens; auth now lives in SecureStore + in-memory state only.
 *
 * v1 → v2: the area list was realigned to the web app's 9 canonical locations
 * (Task 5). A persisted area outside the new list (e.g. the old
 * "All Addis Ababa" sentinel or a dropped sub-city like "Kirkos") would match
 * nothing server-side, so it resets to the city-wide default.
 */
export function migratePersistedState(persistedState: any, _version: number): any {
  if (persistedState) {
    delete persistedState.verifyToken;
    delete persistedState.loggedIn;
    delete persistedState.user;
    delete persistedState.userToken;
    if (typeof persistedState.area === 'string' && !AREAS.includes(persistedState.area)) {
      persistedState.area = AREA_ALL;
    }
  }
  return persistedState;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      loggedIn: false,
      user: null,
      pendingPhone: '',
      pendingChallengeId: '',
      login: (user) =>
        set({ loggedIn: true, user, pendingPhone: '', pendingChallengeId: '' }),
      logout: () => set({ loggedIn: false, user: null, saved: {}, pendingPhone: '', pendingChallengeId: '' }),
      setPendingPhone: (pendingPhone) => set({ pendingPhone }),
      setPendingChallengeId: (pendingChallengeId) => set({ pendingChallengeId }),

      area: AREA_ALL,
      lang: 'en',
      setArea: (area) => set({ area }),
      setLang: (lang) => set({ lang }),

      saved: {},
      isSaved: (id) => !!get().saved[id],
      toggleSaved: (id) => {
        const saved = { ...get().saved };
        const next = !saved[id];
        if (next) saved[id] = true;
        else delete saved[id];
        set({ saved });
        return next;
      },

      filters: emptyFilters(),
      toggleFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: toggleArr(s.filters[key] as string[], value) } })),
      selectAreaFilter: (area) =>
        set((s) => ({
          filters: { ...s.filters, areas: s.filters.areas[0] === area ? [] : [area] },
        })),
      setRating: (value) => set((s) => ({ filters: { ...s.filters, rating: value } })),
      toggleQuick: (kind) =>
        set((s) => {
          const f = { ...s.filters };
          // 'near' pins the user's chosen area as the single active area filter
          // (city-wide AREA_ALL is never pinned — it means "no area filter").
          if (kind === 'near' && s.area !== AREA_ALL) {
            f.areas = f.areas[0] === s.area ? [] : [s.area];
          }
          return { filters: f };
        }),
      resetFilters: () => set({ filters: emptyFilters() }),
      activeFilterCount: () => {
        const f = get().filters;
        return (
          f.areas.length +
          f.avail.length +
          f.trust.length +
          (f.rating !== 'Any' ? 1 : 0) +
          f.contact.length +
          f.price.length +
          f.exp.length
        );
      },

      toast: null,
      showToast: (text, icon = 'ph-check-circle') => {
        if (toastTimer) clearTimeout(toastTimer);
        set({ toast: { text, icon } });
        toastTimer = setTimeout(() => set({ toast: null }), 2200);
      },
      hideToast: () => {
        if (toastTimer) clearTimeout(toastTimer);
        set({ toast: null });
      },
    }),
    {
      name: 'serrale-basic-app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        saved: state.saved,
        area: state.area,
        lang: state.lang,
      }),
      version: 2,
      migrate: migratePersistedState,
    },
  ),
);

