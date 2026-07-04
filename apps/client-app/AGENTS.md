# SERRALE Basic Mobile App — client-app Agent Context

App-level context for coding agents working inside `apps/client-app`. Read the repository root `AGENTS.md` first — it is the canonical operating spec for this repo; this file adds the app-local map and the backend contract in short form. When they conflict, root `AGENTS.md` and the code win.

## 1. What this is (as of 2026-07)

This is the native mobile app for **SERRALE Basic** — the core SERRALE system going forward (historically called the "public directory"). It is an Expo / React Native client (Expo SDK 52, React Native 0.76, React 18, TypeScript, Expo Router 4, TanStack React Query, Zustand, Zod + React Hook Form).

Basic's surfaces all share one universal backend:

- Web: `https://serrale.com` (`frontend/public-directory` in the main repo)
- API: `https://api.serrale.com` (shared Express app, `backend/` in the main repo)
- Admin: `https://dashboard.serrale.com` (`admin/` in the main repo)
- Telegram bot
- **This mobile app**

**SERRALE Plus** (`frontend/plus`, `/plus/*` routes, `/api/auth`, `/api/jobs`, `/api/projects`, etc.) is the original professional marketplace, now legacy and maintenance-only. It is still live in production and must not be broken — but this mobile app has nothing to do with it and must never call its API namespaces. See `docs/PLUS_LEGACY_SYSTEM.md` in the main repo.

Main repo (web/backend/admin/migrations): `/Users/terusew/Projects/serrale`
Key references there: `AGENTS.md`, `docs/BASIC_INTELLIGENCE_LAYER.md`, `docs/PLUS_LEGACY_SYSTEM.md`.

## 2. Entry points and routing (Expo Router)

`package.json` → `"main": "expo-router/entry"`. `app/_layout.tsx` is the root layout: loads Inter fonts, wraps the tree in `QueryClientProvider` / `SafeAreaProvider` / `GestureHandlerRootView`, and mounts the global `ContactSheets` and `Toast`. `app/index.tsx` is a branded splash that redirects to `/(tabs)/home`.

Routes as they exist in `app/`:

```text
/(tabs)/home        Home (header, search, trust banner, nearby, categories, verified)
/(tabs)/search      Categories/discovery screen
/(tabs)/request     Customer service-request flow (OTP-gated)
/(tabs)/profile     Profile / settings hub
/providers          Provider list
/categories         Category index
/categories/[id]    Providers in a category
/provider/[id]      Provider detail (portfolio, reviews, Call/WhatsApp)
/auth/login         Phone entry for directory OTP
/auth/verify        6-digit OTP entry
/bookmarks /settings /help /language /safety
```

Preserve routes and interactions when changing presentation.

## 3. Code layout

```text
src/api/index.ts       Facade — screens/hooks import ONLY from here
src/api/serrale/       Real API client (adapters, auth, categories, providers, requests, search, types)
src/api/mock/          Mock implementation, same surface; used only when EXPO_PUBLIC_USE_MOCK=true
src/hooks/queries.ts   React Query hooks (server state)
src/hooks/useProviderActions.ts  Shared open/save/call/WhatsApp actions
src/components/        Cards, sheets, banners, TabBar, Toast, ContactSheets, ...
src/lib/env.ts         API_BASE_URL (default https://api.serrale.com/api), USE_MOCK, DIRECTORY='/public-directory'
src/lib/http.ts        Typed fetch: JSON, Bearer token, 15s timeout, unwraps { success, data }, typed errors
src/lib/theme.ts       Design tokens (colors, fonts, spacing, radius, shadows) — single source of truth
src/lib/icons.tsx      Phosphor icon mapping
src/lib/category-images.ts / provider-images.ts  Local image fallbacks
src/store/appStore.ts  Zustand + AsyncStorage: area, language, saved providers, user, verify token
src/store/contactStore.ts  Drives the global Call/WhatsApp confirmation sheets
src/schemas/           Zod schemas (auth, request)
src/types.ts           Mobile domain types
```

Dependency direction (never bypass it; screens must not call `fetch` directly):

```text
screen → src/hooks/queries.ts → src/api/index.ts → src/api/serrale|mock → src/lib/http.ts → api.serrale.com
```

## 4. Design system references

- `project/uploads/SERRALE_Basic_Design_System.md` — token/design-system source (mirrored in `src/lib/theme.ts`)
- `project/uploads/SERRALE_Basic_Mobile_App_UI_UX_Spec.md` — screen-by-screen UI/UX spec
- `assets/design-reference/serrale-home-reference.png` (+ its `README.md`) — tracked Home baseline
- Root `AGENTS.md` §8 — current visual rules (light `#FFFEFC` background, deep green, restrained gold, contained category images, 44 px touch targets)

Reuse assets under `assets/` (categories, providers, trust banner) before generating new ones.

## 5. Backend contract (short form)

Same universal backend as Basic web: `https://api.serrale.com`, Basic namespace `/api/public-directory/*`. One backend, one Supabase project — never point mobile at a second API origin. Basic data lives in `directory_providers`, `directory_leads`, `directory_customers`, `otp_challenges` (directory purposes) plus the 2026-07 intelligence tables — full reference: `/Users/terusew/Projects/serrale/docs/BASIC_INTELLIGENCE_LAYER.md` (link, don't duplicate).

Endpoints relevant to this app (verified against `backend/src/routes/publicDirectory.ts`):

```text
GET  /api/public-directory/categories
GET  /api/public-directory/providers            filters; optional lat= lng= radius_km=
                                                → nearest-first, rows carry distance_km
GET  /api/public-directory/providers/:id
GET  /api/public-directory/search               ?q= (also accepts lat/lng)
GET  /api/public-directory/search/suggest
POST /api/public-directory/providers/:id/contact-events   contact tracking (call/whatsapp),
                                                source_platform: 'mobile_app'
POST /api/public-directory/otp/request
POST /api/public-directory/otp/verify           → one-time verify_token
POST /api/public-directory/leads/request        customer service request (needs verify_token)
POST /api/public-directory/leads/provider       best-effort contact lead log
```

Contract rules:

- **Send `X-Serrale-Source: mobile_app` on every request** so backend source tracking attributes traffic correctly (the backend reads it in `backend/src/utils/requestContext.ts`). As of 2026-07 `src/lib/http.ts` does not yet set this header — when wiring it, add it once in `http.ts`, not per call site.
- **Never call Plus namespaces**: `/api/auth`, `/api/me`, `/api/profiles`, `/api/jobs`, `/api/projects`, `/api/proposals`, `/api/contracts`, `/api/payments`, `/api/escrow`, etc. are the legacy marketplace. Basic mobile has no business there.
- **Contact/analytics logging must never block contact.** Call/WhatsApp opens the native intent even if `leads/provider` or a contact-event POST fails (see `src/components/ContactSheets.tsx` — fire-and-forget with `.catch(() => {})`). Keep it that way.
- **Never weaken OTP flows.** Do not shorten codes, skip verification, log codes/tokens, loosen rate limits, or cache `verify_token` beyond its intended one-time use.
- Never import Supabase into this app; never embed service-role keys or any backend secret in Expo config, source, or docs. No raw coordinates are shown publicly — only `distance_km`.
- Nearby-by-coordinates (`lat`/`lng`/`radius_km`) is live on the backend; current mobile `getNearbyProviders()` still filters by `area` only. Adding coordinate support is an additive client change, not a backend change.

## 6. Verification

From this directory:

```bash
npm run typecheck
npm run lint
npx expo export --platform web
```

For UI work also run the app at ~390–430 px width and check labels (including Amharic), image fit, safe areas, and console errors. Treat Basic as production-critical: additive changes, no route/store/contract breakage during visual work, fresh evidence before claiming anything passes.
