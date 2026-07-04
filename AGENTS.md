# SERRALE Basic Mobile - Agent Instructions

This file is the canonical operating context for Codex and other coding agents in this repository. Read it before changing code. `CLAUDE.md` points Claude Code to the same rules.

## 1. Repository scope

This repository is the Expo mobile client for SERRALE Basic:

```text
/Users/terusew/Projects/SERRALE-Basic-Mobile-App-feat-api
```

The related SERRALE web, backend, admin, database migrations, Plus marketplace, and combined static host are in a separate repository:

```text
/Users/terusew/Projects/serrale
```

Before a change that touches the web app, backend, database, deployment, or shared API contract, also read:

```text
/Users/terusew/Projects/serrale/AGENTS.md
/Users/terusew/Projects/serrale/docs/SYSTEM_STATE_CURRENT.md
/Users/terusew/Projects/serrale/docs/PUBLIC_DIRECTORY_INTEGRATION.md
```

Do not assume that changing this mobile repository changes the web or backend repositories. Cross-repository edits must stay within the user's requested scope.

## 2. System architecture: one backend

SERRALE mobile, SERRALE Basic web, and SERRALE Plus web share one production backend:

```text
https://api.serrale.com
```

There is no separate mobile backend and no separate Basic backend. The Express app in `/Users/terusew/Projects/serrale/backend` mounts all product routes under `/api`.

```text
One Express backend deployment
  /api/public-directory/*  -> SERRALE Basic web and mobile
  /api/auth/*              -> SERRALE Plus auth
  /api/me                  -> SERRALE Plus account
  /api/profiles            -> SERRALE Plus profiles
  /api/jobs                -> SERRALE Plus jobs
  /api/projects            -> SERRALE Plus projects
  /api/contracts           -> SERRALE Plus contracts
  /api/payments            -> SERRALE Plus payments
  /api/escrow              -> SERRALE Plus escrow
```

Clean rule:

```text
One backend and one Supabase project.
Separate API namespaces, auth models, tables, frontends, and user journeys.
```

Never create another backend or point mobile at a second API domain to fix an integration problem. Debug the request URL, environment value, CORS, route mounting, response body, and backend logs.

## 3. Product boundaries

SERRALE has two products:

| Product | Surface | Purpose | API and data |
|---|---|---|---|
| SERRALE Basic | Mobile app and `https://serrale.com/` | Low-friction local service discovery, Call/WhatsApp, provider directory, service requests | `/api/public-directory/*`, directory OTP, `directory_providers`, `directory_leads`, directory customer/provider records |
| SERRALE Plus | `https://serrale.com/plus/` | Full professional marketplace with projects, proposals, contracts, dashboards, and payments | Plus routes such as `/api/auth/*`, `/api/me`, `/api/jobs`, `/api/projects`, `profiles`, contracts, payments, and escrow tables |

Non-negotiable boundaries:

- Do not merge Basic and Plus authentication.
- Do not store Basic providers in Plus `profiles` as the primary flow.
- Do not store Plus marketplace users in `directory_providers`.
- Do not import Supabase directly into this mobile app or the Basic web frontend.
- Never place `SUPABASE_SERVICE_ROLE_KEY` or any backend secret in Expo, Vite, source code, screenshots, logs, or tracked documentation.
- Elevated database work belongs in the backend or secured admin server routes.

## 4. API configuration

The mobile API configuration is defined only in:

```text
apps/client-app/src/lib/env.ts
apps/client-app/src/lib/http.ts
```

Production/default configuration:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.serrale.com/api
EXPO_PUBLIC_USE_MOCK=false
```

`EXPO_PUBLIC_API_BASE_URL` must include the `/api` prefix. `src/lib/env.ts` defaults to `https://api.serrale.com/api` and strips trailing slashes. `DIRECTORY` is `/public-directory`, so a mobile request resolves like this:

```text
API_BASE_URL                         https://api.serrale.com/api
DIRECTORY                            /public-directory
OTP request                          https://api.serrale.com/api/public-directory/otp/request
Provider list                        https://api.serrale.com/api/public-directory/providers
```

The web repository uses the same backend with this production build-time value:

```env
VITE_API_BASE_URL=https://api.serrale.com
```

Both Basic web and Plus web normalize an absolute backend origin to include `/api`. Do not change only one client and leave the others on a different production origin.

Mock mode is opt-in. The mobile facade in `src/api/index.ts` selects `src/api/mock` only when `EXPO_PUBLIC_USE_MOCK=true`; otherwise it uses `src/api/serrale`.

## 5. Mobile data flow

Keep this dependency direction:

```text
Expo screen/component
  -> src/hooks/queries.ts
  -> src/api/index.ts facade
  -> src/api/serrale/* or src/api/mock/*
  -> src/lib/http.ts
  -> https://api.serrale.com/api
```

Screens must not call `fetch` directly. Add or change backend calls in `src/api/serrale`, expose the same function from the mock implementation, then consume it through the API facade and React Query hooks.

`src/lib/http.ts`:

- sends JSON and optional Bearer tokens;
- defaults to a 15 second timeout;
- unwraps the SERRALE `{ success, data }` envelope;
- tolerates direct JSON payloads for compatible endpoints;
- throws `NetworkError`, `HttpError`, or `ApiBusinessError`.

Current live mobile endpoints:

```text
GET  /api/public-directory/categories
GET  /api/public-directory/providers
GET  /api/public-directory/providers/:id
GET  /api/public-directory/search
GET  /api/public-directory/search/suggest
POST /api/public-directory/otp/request
POST /api/public-directory/otp/verify
POST /api/public-directory/leads/request
POST /api/public-directory/leads/provider
```

Important implementation details:

- Category names, icons, groups, and image keys come from local category metadata; the live category endpoint supplies counts.
- Provider detail may contain portfolio and reviews; adapters convert backend shapes into mobile types.
- Live mode has no global recent-work endpoint, so `getRecentWork()` currently returns an empty list.
- Call and WhatsApp actions must not be blocked by analytics/lead logging. Provider lead creation is best-effort and the native intent opens even if logging fails.
- Provider queries use page size 20. Preserve pagination-compatible return shapes.

## 6. Authentication and local state

Basic mobile currently uses phone OTP for the customer request flow:

```text
directory_customer_request
  -> POST /otp/request
  -> POST /otp/verify
  -> one-time verify_token
  -> POST /leads/request
```

The Zustand store is `apps/client-app/src/store/appStore.ts` and persists under `serrale-basic-app`:

- selected area;
- language;
- saved provider IDs;
- lightweight logged-in user fields;
- current verify token.

Current limitations must not be described as completed backend features:

- Saved providers are local Zustand state, not server-synchronized bookmarks.
- Mobile login is a lightweight OTP gate for requests, not the full Basic provider account/session implementation used by the web directory.
- Recent work is not fetched globally in live mode.
- Provider-only Manage/onboarding is not part of the current mobile tab set.

Do not reuse Plus tokens, Supabase browser sessions, or Plus profile helpers for Basic mobile auth.

## 7. Mobile stack and routes

Primary stack:

- Expo SDK 52, React Native 0.76, React 18, TypeScript;
- Expo Router 4;
- TanStack React Query for server state;
- Zustand with AsyncStorage persistence for local state;
- React Hook Form and Zod for forms;
- Phosphor icons and React Native SVG;
- Inter fonts loaded in `app/_layout.tsx`.

Bottom tabs:

```text
/(tabs)/home
/(tabs)/search      Categories/discovery screen
/(tabs)/request
/(tabs)/profile
```

Stack and utility routes:

```text
/providers
/categories
/categories/:id
/provider/:id
/auth/login
/auth/verify
/bookmarks
/settings
/help
/language
/safety
```

Preserve routes and existing interactions when changing presentation.

## 8. Current UI specification

The current Home and Categories redesign is intentional and is the baseline for future changes.

Tracked Home reference:

```text
apps/client-app/assets/design-reference/serrale-home-reference.png
apps/client-app/assets/design-reference/README.md
```

Additional local design references used for the current implementation:

```text
/Users/terusew/Downloads/ChatGPT Image Jun 30, 2026, 03_00_45 PM.png
/Users/terusew/Downloads/ChatGPT Image Jun 30, 2026, 03_00_57 PM.png
/Users/terusew/Downloads/ChatGPT Image Jul 2, 2026, 01_03_25 PM.png
```

The tracked reference and native implementation are authoritative if those Downloads files are unavailable.

Visual rules:

- Native Expo components render the interface; never display a full screenshot as the app.
- Keep the background light (`#FFFEFC`) with white surfaces, deep SERRALE green, and restrained gold actions.
- Use compact spacing and card proportions. Shared values live in `src/lib/theme.ts`.
- Current layout values include 14 px horizontal gutter, 16 px section gap, 44 px controls/touch targets, and 520 px maximum content width.
- Use Inter consistently for headings and UI copy.
- Preserve accessible labels, native text, touch feedback, and readable contrast.
- Home contains the compact header/location/bookmark controls, search/filter control, green trust banner, shortcut pills, nearby providers, photographic category grid, verified providers, recent work when available, safety card, and compact bottom navigation.
- Search tab is the Categories screen with category search, filter chips, trust/request banner, feature cards, and two-column category rows.
- Category/provider cards have presentation variants; extend variants instead of duplicating card implementations.

Category image rules:

- Category photography is mapped in `src/lib/category-images.ts`.
- Home category tiles use `resizeMode="contain"` in a fixed image region. Do not switch them back to zoomed or cropped full-background images.
- Category list rows use consistent fixed thumbnails with rounded corners.
- Long category labels may wrap to two lines and must not clip.
- Only use category photography as the visual background/content for category cards. Other card types should retain their current native surfaces unless a new approved design explicitly changes them.

Provider image rules:

- Local fallback portraits are mapped in `src/lib/provider-images.ts`.
- Remote provider images take priority when supplied by the API.
- Keep verification/admin-reviewed indicators and Call/WhatsApp actions visible.

Assets currently available:

```text
apps/client-app/assets/categories/*.webp
apps/client-app/assets/categories/extended/*.png
apps/client-app/assets/providers/*.webp
apps/client-app/assets/home-trust-banner.png
```

The base category/provider assets were copied from:

```text
/Users/terusew/Projects/serrale/frontend/public-directory/public/assets/directory
```

Reuse existing Serrale assets before generating replacements. Optimize any new large image before importing it so it does not unnecessarily increase the Expo bundle.

## 9. Shared web behavior

The related web repository serves:

```text
https://serrale.com/          -> SERRALE Basic public directory
https://serrale.com/plus/     -> SERRALE Plus marketplace
https://dashboard.serrale.com -> secured admin surface
https://api.serrale.com       -> shared backend
```

The combined web host is assembled by `/Users/terusew/Projects/serrale/frontend/host`. Plus routes require `/plus/*` handling before the Basic catch-all. Do not use `/serrale-plus`; the correct entry is `/plus/`.

The Basic web frontend must use `frontend/public-directory/src/services/serralePublicApi.ts` for backend calls. It must not import Supabase. The Plus app retains its separate Plus auth and API clients.

## 10. Change discipline

- Inspect the working tree before editing. Existing dirty changes belong to the user.
- Do not revert or overwrite unrelated changes.
- Use `rg` for file and text discovery.
- Use `apply_patch` for source and documentation edits.
- Keep business logic, API contracts, route names, and stores stable during visual-only tasks.
- If the backend contract must change, update backend tests and both affected clients in the explicitly authorized repositories.
- Do not add secrets, deploy-hook tokens, service-role keys, private credentials, or copied `.env` contents to these files.
- Do not trigger deployments, publish builds, push branches, or change production data unless the user explicitly requests it.

## 11. Verification before handoff

For mobile changes, run from `apps/client-app`:

```bash
npm run typecheck
npm run lint
npx expo export --platform web
```

For UI changes, also run the app and inspect the affected screens at approximately 390-430 px width. Check console warnings/errors, long labels, Amharic copy where affected, image fit, safe areas, scrolling, and tab navigation.

For Basic web changes, run from `/Users/terusew/Projects/serrale/frontend/public-directory`:

```bash
npm run typecheck
npm run test:homepage
npm run build
```

For backend changes, run from `/Users/terusew/Projects/serrale/backend`:

```bash
npm run build
npm run lint
npm test
```

Run targeted tests first when available, then the broader relevant checks. Never report a test, build, visual state, API response, or deployment as passing without fresh evidence.

## 12. Sources of truth

Use this precedence when documentation conflicts:

1. Current executable code and tests in the repository being changed.
2. This `AGENTS.md` for mobile operating rules.
3. `/Users/terusew/Projects/serrale/AGENTS.md` for shared web/backend architecture.
4. Current system docs in `/Users/terusew/Projects/serrale/docs`.
5. App README files and old design handoff material.

Some older README text still describes the mobile app as mock-only. That is outdated: live API mode is now the default and mock mode is explicit.
