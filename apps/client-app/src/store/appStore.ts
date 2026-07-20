import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OtpPurpose } from '../api/shared';
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
  profileComplete?: boolean;
}

const emptyFilters = (): Filters => ({
  areas: [],
  avail: [],
  trust: [],
  rating: 'Any',
  contact: [],
  price: [],
  exp: [],
  engagement: '',
});

interface Toast {
  text: string;
  icon: string;
}

interface AppState {
  loggedIn: boolean;
  /** True when customer access/refresh tokens are present on device. */
  hasCustomerSession: boolean;
  user: AuthUser | null;
  pendingPhone: string;
  pendingChallengeId: string;
  /** Ephemeral: how the pending OTP was delivered (`review_code` = no SMS). */
  pendingOtpDelivery: 'sms' | 'review_code' | null;
  pendingAccountHint: {
    has_customer: boolean;
    has_provider: boolean;
    customer_profile_complete: boolean;
  } | null;
  phoneHasProvider: boolean;
  linkedProvider: {
    id: string;
    full_name: string;
    area?: string | null;
    photo_url?: string | null;
    category_slug?: string | null;
  } | null;
  providerProfile: {
    id: string;
    full_name: string;
    phone: string;
    area?: string | null;
    photo_url?: string | null;
    category_slug?: string | null;
  } | null;
  sessionReady: boolean;
  pendingAuthRole: 'customer' | 'provider';
  /** Frozen OTP purpose for the in-flight customer/provider challenge. */
  pendingOtpPurpose: OtpPurpose | null;
  /** Which login path is active in this app session — drives profile UI and edit flows. */
  activeSession: 'customer' | 'provider' | null;
  login(user: AuthUser): void;
  /** Clear customer session state only — keeps provider profile / saved providers. */
  logoutCustomer(): void;
  logout(): void;
  setPendingPhone(phone: string): void;
  setPendingChallengeId(id: string): void;
  setPendingOtpDelivery(delivery: AppState['pendingOtpDelivery']): void;
  setPendingAccountHint(hint: AppState['pendingAccountHint']): void;
  setPhoneHasProvider(value: boolean): void;
  setLinkedProvider(provider: AppState['linkedProvider']): void;
  setProviderProfile(profile: AppState['providerProfile']): void;
  setSessionReady(ready: boolean): void;
  setPendingAuthRole(role: 'customer' | 'provider'): void;
  setPendingOtpPurpose(purpose: OtpPurpose | null): void;
  setActiveSession(role: 'customer' | 'provider' | null): void;
  setHasCustomerSession(value: boolean): void;

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
  /** Single-select engagement filter: '' clears it, selecting the active value again clears it. */
  selectEngagementFilter(value: string): void;
  /** Always assign engagement ('' = All). Used by the home/categories segment control. */
  setEngagementFilter(value: string): void;
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
      hasCustomerSession: false,
      user: null,
      pendingPhone: '',
      pendingChallengeId: '',
      pendingOtpDelivery: null,
      pendingAccountHint: null,
      phoneHasProvider: false,
      linkedProvider: null,
      providerProfile: null,
      sessionReady: false,
      pendingAuthRole: 'customer',
      pendingOtpPurpose: null,
      activeSession: null,
      login: (user) =>
        set({
          loggedIn: true,
          user,
          pendingPhone: '',
          pendingChallengeId: '',
          pendingOtpDelivery: null,
          pendingAccountHint: null,
          pendingOtpPurpose: null,
        }),
      logoutCustomer: () =>
        set({
          loggedIn: false,
          hasCustomerSession: false,
          user: null,
          pendingPhone: '',
          pendingChallengeId: '',
          pendingOtpDelivery: null,
          pendingAccountHint: null,
          pendingOtpPurpose: null,
        }),
      logout: () =>
        set({
          loggedIn: false,
          hasCustomerSession: false,
          user: null,
          pendingPhone: '',
          pendingChallengeId: '',
          pendingOtpDelivery: null,
          pendingAccountHint: null,
          pendingOtpPurpose: null,
          phoneHasProvider: false,
          linkedProvider: null,
          providerProfile: null,
          pendingAuthRole: 'customer',
          activeSession: null,
        }),
      setPendingPhone: (pendingPhone) => set({ pendingPhone }),
      setPendingChallengeId: (pendingChallengeId) => set({ pendingChallengeId }),
      setPendingOtpDelivery: (pendingOtpDelivery) => set({ pendingOtpDelivery }),
      setPendingAccountHint: (pendingAccountHint) => set({ pendingAccountHint }),
      setPhoneHasProvider: (phoneHasProvider) => set({ phoneHasProvider }),
      setLinkedProvider: (linkedProvider) => set({ linkedProvider }),
      setProviderProfile: (providerProfile) => set({ providerProfile }),
      setSessionReady: (sessionReady) => set({ sessionReady }),
      setPendingAuthRole: (pendingAuthRole) => set({ pendingAuthRole }),
      setPendingOtpPurpose: (pendingOtpPurpose) => set({ pendingOtpPurpose }),
      setActiveSession: (activeSession) => set({ activeSession }),
      setHasCustomerSession: (hasCustomerSession) => set({ hasCustomerSession }),

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
      selectEngagementFilter: (value) =>
        set((s) => ({
          filters: { ...s.filters, engagement: s.filters.engagement === value ? '' : value },
        })),
      setEngagementFilter: (value) =>
        set((s) => ({
          filters: { ...s.filters, engagement: value === 'temporary' || value === 'permanent' ? value : '' },
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
          f.exp.length +
          (f.engagement ? 1 : 0)
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

