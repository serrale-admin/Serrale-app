# SERRALE Basic Mobile — Session Orientation (as of 2026-07-11)

One-page orientation for Claude sessions in this repository. Canonical detail lives in root `AGENTS.md` and `apps/client-app/AGENTS.md` — read those before editing.

## What this repo is

The **SERRALE Basic native mobile app**: an Expo / React Native (Expo SDK 52, Expo Router 4, TypeScript) client for SERRALE Basic, the core SERRALE system (historically "public directory"). It is a separate git repo from the main SERRALE repo; current working branch `feat/serrale-api-client` may contain user WIP in `.tsx` files — never commit, revert, or overwrite changes you did not make.

## Where things live

```text
apps/client-app/          THE real app. app/ = Expo Router routes (tabs: home, search,
                          request, profile + provider/category/auth/utility screens),
                          src/ = api client, hooks, components, lib (env/http/theme), stores.
apps/client-app/AGENTS.md App-level agent context (routing, layout, API contract).
AGENTS.md (root)          Canonical operating rules for this repo.
CLAUDE.md (root)          Claude pointer to AGENTS.md.
project/ + chats/         Claude Design HANDOFF materials — HTML mockups, transcripts, and
                          project/uploads/SERRALE_Basic_Design_System.md +
                          SERRALE_Basic_Mobile_App_UI_UX_Spec.md. Reference input, NOT the app.
README.md (root)          Describes that design-handoff bundle, not the Expo app.
HANDOFF_OTP_LIVE_TESTING.md  OTP live-testing handoff notes (env setup, what was verified).
design-qa.md, qa-*.png    UI QA snapshots against design references.
apps/client-app/dist*     Build/export outputs — do not hand-edit.
```

## Backend contract (condensed)

- One universal backend for Basic web + mobile + legacy Plus: `https://api.serrale.com`. Never create a second backend or API origin.
- Mobile uses `EXPO_PUBLIC_API_BASE_URL=https://api.serrale.com/api` (default in `src/lib/env.ts`); all Basic calls go under `/api/public-directory/*`: categories, providers (optional `lat`/`lng`/`radius_km` → nearest-first with `distance_km`), provider detail, search + suggest, `POST providers/:id/contact-events`, OTP request/verify, customer session exchange, leads (request + provider), **provider register**.
- **Auth (2026-07-11):** customer OTP session via `secure-session.ts` (web AsyncStorage fallback); provider register at `/provider/join` persists JWT via `provider-session.ts`. Shared `OtpInput` on verify + join screens.
- **Local web dev:** point `.env` at `http://127.0.0.1:5000/api` — production API rejects Expo web CORS.
- Rule: every mobile request should carry `X-Serrale-Source: mobile_app` for source tracking (backend reads it; as of 2026-07 `src/lib/http.ts` does not yet set it — wire it there once if asked).
- **Never call Plus namespaces** (`/api/auth`, `/api/me`, `/api/profiles`, `/api/jobs`, `/api/projects`, contracts/payments/escrow...). Plus is the legacy marketplace — live, maintenance-only, off limits to this app.
- Data flow is fixed: screen → `src/hooks/queries.ts` → `src/api/index.ts` facade → `src/api/serrale` (or mock) → `src/lib/http.ts`. Screens never call `fetch`. Live mode is default; mock only with `EXPO_PUBLIC_USE_MOCK=true`.

## Main repo pointer

Web, backend, admin, migrations, and Plus live in `/Users/terusew/Projects/serrale`. Read there before any cross-repo or contract-affecting work:

- `AGENTS.md` — shared architecture + status policy (Basic = core/active, Plus = legacy)
- `docs/BASIC_INTELLIGENCE_LAYER.md` — contact/search events, nearby matching, intelligence tables
- `docs/PLUS_LEGACY_SYSTEM.md` — canonical legacy Plus reference

## Safety rules for this repo

- Basic is production-critical: additive changes only; keep routes, stores, API shapes, and business logic stable during visual work.
- **Never weaken OTP flows** (no skipped verification, logged codes/tokens, or loosened limits).
- Contact/lead/analytics logging is best-effort and must never block the Call/WhatsApp native intent.
- No Supabase imports in the app; no service-role keys or secrets in Expo config, code, logs, or docs; no raw provider coordinates surfaced — only `distance_km`.
- Docs and design claims must match code — verify against `apps/client-app/src` before stating a route, endpoint, or behavior. Some old handoff text calls the app mock-only; that is outdated.
- Verify with `npm run typecheck && npm run lint && npx expo export --platform web` from `apps/client-app`; report only checks actually run.
