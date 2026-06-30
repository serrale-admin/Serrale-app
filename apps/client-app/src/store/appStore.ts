import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  verifyToken: string;
  pendingPhone: string;
  pendingChallengeId: string;
  login(user: AuthUser, verifyToken: string): void;
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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      loggedIn: false,
      user: null,
      verifyToken: '',
      pendingPhone: '',
      pendingChallengeId: '',
      login: (user, verifyToken) =>
        set({ loggedIn: true, user, verifyToken, pendingPhone: '', pendingChallengeId: '' }),
      logout: () => set({ loggedIn: false, user: null, verifyToken: '', saved: {}, pendingPhone: '', pendingChallengeId: '' }),
      setPendingPhone: (pendingPhone) => set({ pendingPhone }),
      setPendingChallengeId: (pendingChallengeId) => set({ pendingChallengeId }),

      area: 'Bole',
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
      setRating: (value) => set((s) => ({ filters: { ...s.filters, rating: value } })),
      toggleQuick: (kind) =>
        set((s) => {
          const f = { ...s.filters };
          if (kind === 'verified') f.trust = toggleArr(f.trust, 'Verified only');
          else if (kind === 'today') f.avail = toggleArr(f.avail, 'Available today');
          else if (kind === 'near') f.areas = toggleArr(f.areas, s.area);
          else if (kind === 'rating4') f.rating = f.rating === '4.0+' ? 'Any' : '4.0+';
          else if (kind === 'whatsapp') f.contact = toggleArr(f.contact, 'WhatsApp available');
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
      partialize: (state) => ({
        saved: state.saved,
        area: state.area,
        lang: state.lang,
        loggedIn: state.loggedIn,
        user: state.user,
        verifyToken: state.verifyToken,
      }),
    },
  ),
);
