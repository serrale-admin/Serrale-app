# SERRALE Basic — Client App (Expo / React Native)

A client-first local service discovery app for Ethiopia (Addis Ababa first). Users
find trusted local service providers, check trust signals, and **Call** or
**WhatsApp** them directly. Guest-first browsing; phone-OTP login is only required
for saving providers, posting a request, and managing a profile.

Built as a native **Expo / React Native + TypeScript** app per the SERRALE Basic
technical spec, implementing the Claude Design handoff UI.

## Stack

- **Expo SDK 52** + **Expo Router** (file-based navigation)
- **TanStack React Query** — server state (via the mock API layer)
- **Zustand** — local app state (session, area, language, saved, filters)
- **Zod** + **React Hook Form** — form validation (request form, phone login)
- **phosphor-react-native** + **react-native-svg** — icons
- **expo-linear-gradient** — gradients
- Fonts: **Fraunces** (headings), **Inter** (UI), **Noto Sans Ethiopic** (Amharic)

## Run

```bash
npm install
npm start          # Expo dev server (press i / a / w, or scan with Expo Go)
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # run in the browser
npm run typecheck  # tsc --noEmit
```

## Navigation (per the technical spec)

Bottom tabs: **Home · Search · Request · Profile**. The provider-only **Manage**
tab and provider onboarding are intentionally out of scope for this client build
(spec Phase 1–3); they unlock later once a provider is approved.

Stack routes pushed over the tabs: category list & detail, provider profile,
phone login & OTP verify, bookmarks, settings, help, language, safety tips.

## Project structure

```text
app/                      # Expo Router routes
  _layout.tsx             # providers (QueryClient, fonts, SafeArea), global Toast + ContactSheets
  index.tsx               # branded splash → /(tabs)/home
  (tabs)/                 # home, search, request, profile (+ custom TabBar)
  categories/             # index.tsx, [id].tsx
  provider/[id].tsx       # provider detail + sticky Call/WhatsApp bar
  auth/                   # login.tsx, verify.tsx
  bookmarks · settings · help · language · safety
src/
  api/                    # mock-backed data access — mirrors packages/api in the spec
  hooks/queries.ts        # React Query hooks
  store/                  # Zustand: appStore (session/prefs/filters), contactStore
  schemas/                # Zod schemas (request, phone)
  components/             # ProviderRow, Medallion, sheets, TabBar, Toast, …
  lib/                    # theme tokens, icon registry, labels (en/am), format helpers
  data/mock.ts            # categories, providers, reviews, past work, areas
```

## Data layer

All data flows through `src/api/*`, which returns the spec's typed mock data with
simulated latency. It mirrors the spec's `packages/api` (`categories`, `providers`,
`requests`, `reviews`, `auth`). Swapping to Supabase later means replacing the
bodies in `src/api/` only — the React Query hooks, screens, and stores stay the
same. Provider list queries are paginated (page size 20 per the spec).

## Verification

`npm run typecheck` passes, and the app bundles cleanly with Metro for iOS and web
(`npx expo export`). A headless render of the web build confirmed the core flows:
splash → home, provider detail + call sheet, search, request (guest gate), and
profile — with no runtime errors.

> Note: TypeScript is pinned to ~5.6 and `moduleResolution` is `bundler` so
> TanStack Query v5's `NoInfer`-based generics resolve correctly (they collapse to
> `any` under the SDK-default TS 5.3 / `node10`).
