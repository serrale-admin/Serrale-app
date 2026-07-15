# SERRALE Basic Mobile - Claude Context

Read `AGENTS.md` in this repository before planning, editing, testing, or deploying. It is the canonical and detailed system specification for this project.

## Critical context

- This repository is the Expo mobile client at `/Users/terusew/Projects/SERRALE-Basic-Mobile-App-feat-api`.
- The related web, backend, admin, Plus marketplace, combined host, and Supabase migrations are in `/Users/terusew/Projects/serrale`.
- Mobile, SERRALE Basic web, and SERRALE Plus web share the same production backend: `https://api.serrale.com`.
- Mobile uses `EXPO_PUBLIC_API_BASE_URL=https://api.serrale.com/api` and calls Basic routes under `/public-directory/*`.
- Web uses `VITE_API_BASE_URL=https://api.serrale.com`; its clients normalize the origin to `/api`.
- Never create a second Basic/mobile backend to fix an API problem.
- Basic and Plus share infrastructure but must keep separate API namespaces, sessions, user journeys, and primary tables.
- Never import Supabase directly into the mobile app or Basic web frontend. Never expose service-role keys or backend secrets.
- Live mobile API mode is the default. Mock mode requires `EXPO_PUBLIC_USE_MOCK=true`.

## Current mobile implementation

- Expo SDK 52, React Native, TypeScript, Expo Router, React Query, Zustand, Zod, and React Hook Form.
- Tabs: Home, Search/Categories, Request, Profile.
- Live directory integrations: categories/counts, provider lists/details/search, OTP request/verify, customer service requests, provider registration (`/provider/join`), and provider contact leads.
- **Customer auth:** OTP → verify → durable session (`secure-session.ts`); used for Request tab and Profile login.
- **Provider register:** OTP (`directory_provider_join`) → verify → `POST /providers/register` → local provider JWT (`provider-session.ts`). No in-app provider dashboard yet.
- **OTP UI:** shared `OtpInput` / `OtpBox` with responsive sizing and paste support on `auth/verify` and `provider/join`.
- Call and WhatsApp actions open native intents; lead logging is best-effort and must never block contact.
- Saved providers are currently local Zustand data, not server-synchronized bookmarks.

## Current UI baseline

- Preserve the compact Home and Categories redesign documented in `AGENTS.md`.
- Request tab and Provider Join use production-quality section cards and photo hero banners (see `AGENTS.md` § Session continuity 2026-07-11).
- Keep the background light, surfaces white, primary green deep, and gold limited to important actions.
- Keep category images fitted without zooming: Home category tiles use a contained image region.
- Reuse assets under `apps/client-app/assets` and the tracked Home reference under `apps/client-app/assets/design-reference`.
- Preserve routes, filters, sheets, localization, provider details, bookmarks, request flow, Call/WhatsApp, and accessibility while changing visuals.

## Before cross-repository work

Read these files first:

```text
/Users/terusew/Projects/serrale/AGENTS.md
/Users/terusew/Projects/serrale/docs/SYSTEM_STATE_CURRENT.md
/Users/terusew/Projects/serrale/docs/PUBLIC_DIRECTORY_INTEGRATION.md
```

Do not edit, deploy, or mutate another repository or production system unless the user's request includes that scope.

## Required verification

From `apps/client-app`:

```bash
npm run typecheck
npm run lint
npx expo export --platform web
```

For UI work, inspect the affected mobile-width screens in the running app and check image fit, labels, safe areas, interactions, and browser/device console errors. Report only checks that were actually run.
