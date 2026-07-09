# SERRALE Mobile Deployment Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a production-ready SERRALE Basic Expo application for Android first and iOS compatibility, using the shared SERRALE backend at `https://api.serrale.com`, with durable secure sessions, complete OTP and request flows, resilient networking, consistent UI, localization, tests, release builds, and evidence-based deployment gates.

**Architecture:** Keep the mobile application as a native Expo client of the existing universal SERRALE backend. Mobile and Basic web use `/api/public-directory/*`; Plus remains isolated on its existing namespaces and auth model. Centralize secure session management, API reliability, localization, design primitives, and production error handling instead of implementing those concerns independently in screens.

**Tech Stack:** Expo SDK 52, React Native 0.76, Expo Router, TypeScript, TanStack React Query, Zustand, Expo SecureStore, React Hook Form, Zod, Jest/React Native Testing Library or the Expo-compatible test stack confirmed from official Expo documentation, Android emulator/EAS Build, and the Node/Express/Supabase backend in `/Users/terusew/Projects/serrale`.

---

## Execution directive

You are the senior release engineer responsible for implementing this plan, not only reviewing or proposing changes. Continue until every in-scope gate is implemented and verified. Do not stop after producing another plan.

Only pause for information that cannot safely be inferred or generated:

- the one live OTP code sent to a user-controlled phone;
- missing EAS, Google Play, Apple, or crash-reporting credentials;
- explicit approval before submitting a production release or mutating production data.

Do not publish to Google Play or the Apple App Store. Build and validate release artifacts, then report readiness and remaining external credential blockers.

## Mandatory source context

- [ ] Read the mobile repository `AGENTS.md` and `CLAUDE.md` completely.
- [ ] Read `/Users/terusew/Projects/serrale/AGENTS.md` completely.
- [ ] Read `/Users/terusew/Projects/serrale/docs/SYSTEM_STATE_CURRENT.md` and `PUBLIC_DIRECTORY_INTEGRATION.md`.
- [ ] Inspect current `git status` in both repositories and preserve all existing user changes.
- [ ] Inspect the actual mobile API facade, HTTP client, auth screens, stores, routes, design tokens, and EAS configuration before editing.
- [ ] Inspect the Basic web API client and backend public-directory routes/tests before changing any contract.
- [ ] Use current code and tests as the source of truth when old README text conflicts.

Primary repositories:

```text
Mobile:  /Users/terusew/Projects/SERRALE-Basic-Mobile-App-feat-api
Web/API: /Users/terusew/Projects/serrale
```

Production system:

```text
Basic web: https://serrale.com/
Plus web:  https://serrale.com/plus/
Admin:     https://dashboard.serrale.com
Backend:   https://api.serrale.com
Mobile API base: https://api.serrale.com/api
Basic namespace: /api/public-directory/*
```

Never create a second Basic/mobile backend. Never import Supabase into mobile or Basic web. Never merge Basic and Plus auth, sessions, or primary tables.

## Task 1: Baseline and contract matrix

**Files:**

- Read: `apps/client-app/src/api/**`
- Read: `apps/client-app/src/lib/env.ts`
- Read: `apps/client-app/src/lib/http.ts`
- Read: `/Users/terusew/Projects/serrale/frontend/public-directory/src/services/serralePublicApi.ts`
- Read: `/Users/terusew/Projects/serrale/backend/src/routes/publicDirectory.ts`
- Create: `docs/deployment/API_CONTRACT_MATRIX.md`

- [ ] Record the current mobile route, HTTP method, request type, response type, auth requirement, timeout, retry rule, rate-limit behavior, and consuming screen for every `/api/public-directory/*` endpoint.
- [ ] Compare the mobile types and adapters with real backend envelopes and fields. Fix mismatches with tests before changing UI behavior.
- [ ] Confirm the production mobile base is `https://api.serrale.com/api` and mock mode is disabled unless explicitly set to `true`.
- [ ] Confirm production code never silently replaces failed live provider/category requests with fake data. Use explicit loading, empty, offline, and error states.
- [ ] Record baseline output for typecheck, lint, web export, dependency audit, Android build size if available, startup time, and critical API response times.
- [ ] Commit only after the contract matrix and baseline are internally consistent.

## Task 2: Secure persistent Basic customer sessions

Current verified backend behavior:

- `POST /api/public-directory/otp/verify` returns a short-lived, one-time `verify_token` and does not create a session.
- `POST /api/public-directory/leads/request` currently returns a 30-day `session_token` after the first request.
- `GET /api/public-directory/customers/me` accepts the scoped customer session.
- Mobile currently persists a `verifyToken` in Zustand/AsyncStorage. A one-time verification token must not be treated as a durable login session.

**Mobile files expected to change or be created:**

- Modify: `apps/client-app/src/api/serrale/auth.ts`
- Modify: `apps/client-app/src/api/serrale/requests.ts`
- Modify: `apps/client-app/src/api/serrale/types.ts`
- Modify: `apps/client-app/src/api/index.ts`
- Modify: `apps/client-app/src/lib/http.ts`
- Create: `apps/client-app/src/lib/secure-session.ts`
- Create: `apps/client-app/src/lib/installation.ts`
- Modify: `apps/client-app/src/store/appStore.ts`
- Modify: `apps/client-app/app/_layout.tsx`
- Modify: `apps/client-app/app/auth/login.tsx`
- Modify: `apps/client-app/app/auth/verify.tsx`
- Modify: `apps/client-app/app/(tabs)/profile.tsx`
- Test: session, launch restoration, refresh, logout, expiry, and fresh-install behavior.

**Backend files expected if the current contract cannot satisfy durable login:**

- Modify: `/Users/terusew/Projects/serrale/backend/src/routes/publicDirectory.ts`
- Create or modify: a directory-customer session service with hashed rotating refresh tokens.
- Create: a Supabase migration for revocable directory customer refresh sessions if no suitable table exists.
- Test: `/Users/terusew/Projects/serrale/backend/src/tests/publicDirectory.customer-account.test.ts`
- Add targeted tests for refresh rotation, reuse rejection, logout revocation, expiry, and Basic/Plus scope isolation.

- [ ] Implement an explicit Basic customer session exchange after successful OTP verification. Do not require the user to submit a service request merely to become logged in.
- [ ] Keep access tokens short-lived and refresh tokens revocable and rotating. Store only a hash of each refresh token on the server.
- [ ] Keep the session scoped to `directory_customer_session`. Never accept it on Plus endpoints.
- [ ] Store access/refresh credentials only in Expo SecureStore, never AsyncStorage or persisted Zustand.
- [ ] Remove persisted `verifyToken`; hold one-time verification tokens only for the flow that consumes them.
- [ ] Restore and refresh the session during app bootstrap without blocking the first visual shell indefinitely.
- [ ] On 401 `SESSION_EXPIRED`, perform at most one single-flight refresh and replay only the safe original request once.
- [ ] On explicit logout, revoke the server refresh session, clear SecureStore, clear private query caches, and reset authenticated state.
- [ ] Preserve login across app restarts, OS restarts, and app upgrades. Require OTP again after explicit logout, server revocation/security expiry, or a detected fresh install.
- [ ] Handle iOS Keychain persistence across reinstall: keep a non-secret installation marker in the app sandbox; if the marker is missing on first launch, clear any stale SecureStore session before creating a new installation marker.
- [ ] Confirm Android uninstall removes local session data. Android is the release priority.
- [ ] Never log phone numbers, OTP values, verify tokens, access tokens, refresh tokens, or Authorization headers.

The secure session module must expose one narrow interface equivalent to:

```ts
export interface BasicSessionTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
}

export interface SecureSessionStore {
  read(): Promise<BasicSessionTokens | null>;
  write(tokens: BasicSessionTokens): Promise<void>;
  clear(): Promise<void>;
}
```

## Task 3: OTP login and abuse controls

**Files:**

- Modify: `apps/client-app/app/auth/login.tsx`
- Modify: `apps/client-app/app/auth/verify.tsx`
- Modify: `apps/client-app/src/api/serrale/auth.ts`
- Modify: `apps/client-app/src/lib/phone.ts`
- Test: OTP request, resend, expiry, invalid code, cooldown, 429, timeout, duplicate taps, and navigation restoration.
- Verify backend: public-directory OTP limiters, idempotency replay, attempt limits, challenge consumption, and stable error envelopes.

- [ ] Normalize Ethiopian phone input to the backend canonical form and display an understandable local format.
- [ ] Disable request/verify buttons while a request is pending.
- [ ] Give visual pending feedback within 100 ms of a tap.
- [ ] Use one idempotency key per OTP send action and prevent duplicate in-flight sends.
- [ ] Show a resend countdown based on server expiry/cooldown data. Do not let UI timers override a stricter server response.
- [ ] Parse `Retry-After`, `retry_after_seconds`, and `next_allowed_at` from 429 responses and show a specific retry time.
- [ ] Use generic security-safe messages for invalid/expired OTPs and never reveal whether a phone is already registered.
- [ ] Consume a challenge once. Do not retry OTP verification automatically.
- [ ] Restore the originally requested route after successful login.
- [ ] Perform exactly one live OTP login smoke test using a user-controlled Ethiopian number. Pause only for the user to provide the received code. Never store the number or code in a committed file or terminal transcript.

## Task 4: Central network reliability, retries, and circuit protection

**Files:**

- Modify: `apps/client-app/src/lib/http.ts`
- Create: `apps/client-app/src/lib/request-policy.ts`
- Modify: `apps/client-app/src/lib/queryClient.ts`
- Add tests for request classification and failure handling.

- [ ] Add request IDs and safe client metadata (`platform`, `app_surface=basic`, app version) without PII.
- [ ] Keep finite timeouts: approximately 15 seconds for reads and 20 seconds for OTP/request writes unless contract evidence requires another value.
- [ ] Retry only idempotent reads and only for network errors, 408, 502, 503, or 504. Use exponential backoff with jitter and a strict attempt limit.
- [ ] Never automatically retry OTP verify, service request submission, provider contact logging, or other writes unless the endpoint has a tested idempotency contract.
- [ ] Respect `Retry-After` and do not retry a 429 in a tight loop.
- [ ] Deduplicate identical in-flight category, provider, profile, and suggestion reads.
- [ ] Cancel obsolete search/suggestion requests with AbortController.
- [ ] Implement a small circuit breaker only for repeated read failures: open after a tested threshold of consecutive network/5xx failures, cool down, then allow one half-open probe. Never use it to block logout or security/session cleanup.
- [ ] Surface offline and circuit-open states with a retry action and cached data when safe.
- [ ] Prevent rapid repeated button actions globally. Pending buttons remain disabled; repeated taps show one restrained notification such as "Please wait - your request is being processed."
- [ ] Ensure service request writes use idempotency and cannot create duplicate leads from double taps or navigation retries.

## Task 5: Categories, providers, search assistance, and request flow

**Files:**

- Modify as needed: `apps/client-app/src/api/serrale/categories.ts`
- Modify as needed: `apps/client-app/src/api/serrale/providers.ts`
- Modify: `apps/client-app/src/api/serrale/search.ts`
- Modify: `apps/client-app/src/hooks/queries.ts`
- Modify: `apps/client-app/app/(tabs)/home.tsx`
- Modify: `apps/client-app/app/(tabs)/search.tsx`
- Modify: `apps/client-app/app/providers.tsx`
- Modify: `apps/client-app/app/categories/[id].tsx`
- Modify: `apps/client-app/app/(tabs)/request.tsx`

- [ ] Load live category counts and provider data from the shared API in production.
- [ ] Preserve local category metadata/images only as presentation metadata, not fake production results.
- [ ] Keep Home category photography fitted without zooming or clipping. Preserve `resizeMode="contain"` for Home category tile images.
- [ ] Verify all attached extended category images are optimized, correctly mapped, and not needlessly bundled when unused.
- [ ] Add search assistance using `/api/public-directory/search/suggest` with a 300 ms debounce, minimum useful query length, cancellation, six-result limit, keyboard navigation, clear action, loading state, and accessible result labels.
- [ ] Cache suggestions briefly but never show stale suggestions for a different query.
- [ ] Make filters, area, sort, category, and search query compose predictably and map to backend-supported parameters.
- [ ] Validate provider profile, bookmark, Call, WhatsApp, verified/admin-reviewed signals, portfolio, and review states.
- [ ] Keep Call/WhatsApp available even if best-effort contact-event logging fails.
- [ ] Make request submission authenticated, idempotent, validation-safe, and resilient to offline/timeout/duplicate-tap cases.
- [ ] Remove mock-only success actions such as a fake "View my requests" result unless a real endpoint backs them; otherwise label the unavailable feature honestly.

## Task 6: Shared UI system across every screen

**Files:**

- Modify: `apps/client-app/src/lib/theme.ts`
- Refine shared components under `apps/client-app/src/components/`
- Update every route under `apps/client-app/app/` to use the shared tokens and primitives.

- [ ] Treat the current Home and Categories screens as the visual baseline.
- [ ] Extend the light background, compact spacing, white surfaces, deep green, restrained gold, card radii, typography, headers, search controls, loading/empty/error states, and bottom-sheet behavior to provider lists/details, request, profile, auth, bookmarks, settings, help, language, and safety.
- [ ] Do not duplicate Home styles into every screen. Build or refine shared screen headers, fields, buttons, cards, badges, error blocks, skeletons, and section containers.
- [ ] Keep minimum interactive touch targets at 44x44 even when visual spacing is compact.
- [ ] Verify 320, 360, 390, 412, and 430 px widths, Android font scaling, safe areas, keyboard avoidance, long provider names, and two-line category labels.
- [ ] Keep native accessible text and controls; never render a screenshot as UI.
- [ ] Meet WCAG AA contrast for normal text and meaningful icons.

## Task 7: English and Amharic localization

**Files:**

- Refactor: `apps/client-app/src/lib/labels.ts`
- Modify: `apps/client-app/app/settings.tsx`
- Modify: `apps/client-app/app/language.tsx`
- Update all user-facing screens/components that still contain hard-coded English strings.
- Add localization completeness tests.

- [ ] Add a clear English/Amharic toggle in Settings and retain the dedicated Language route if it still adds value.
- [ ] Persist the selected language across restarts without storing it in secure token storage.
- [ ] Centralize all user-facing strings. No mixed-language screen caused by hard-coded English.
- [ ] Translate validation, network, OTP, rate-limit, empty, accessibility, button, sheet, and toast copy as well as primary labels.
- [ ] Load an Ethiopic-capable font where needed and verify glyph rendering on Android.
- [ ] Verify Amharic labels, long provider names, buttons, chips, cards, and OTP/error text do not clip.
- [ ] Do not claim full localization if any production path still contains untracked English copy; list and fix every occurrence found by the string audit.

## Task 8: Production error handling and observability

**Files:**

- Modify: `apps/client-app/app/_layout.tsx`
- Create or refine: global error boundary and production logger modules.
- Modify: API/UI error mapping and error states.
- Document: crash reporting configuration in `docs/deployment/RELEASE_CHECKLIST.md`.

- [ ] Add a global React error boundary with a branded recovery screen and safe restart action.
- [ ] Handle offline, DNS/TLS failure, timeout, 400 validation, 401 session expiry, 403, 404, 409, 429, 5xx, malformed/non-JSON responses, and maintenance states distinctly.
- [ ] Do not expose stack traces, backend internals, SQL/Supabase details, raw provider responses, or secrets to users.
- [ ] Redact phone numbers, OTPs, tokens, Authorization headers, and request bodies containing personal data from logs and crash reports.
- [ ] Disable verbose production console logging.
- [ ] If production crash-reporting credentials are available, integrate the approved provider with release/source-map support and PII scrubbing. If credentials are unavailable, implement and test a no-op-safe adapter and report the missing external configuration as a launch blocker.
- [ ] Add a release health breadcrumb strategy that records route, failure class, status, app version, and request ID without PII.

## Task 9: Security hardening

- [ ] Run dependency vulnerability checks and resolve exploitable production findings or document a precise mitigation with owner and deadline.
- [ ] Confirm no `.env`, service-role key, backend secret, deploy-hook key, OTP, token, or credential is committed or bundled.
- [ ] Confirm all production traffic uses HTTPS and Android cleartext traffic is disabled for release.
- [ ] Minimize Android/iOS permissions. Opening `tel:` and WhatsApp intents must not request unnecessary direct-call, contacts, SMS, or storage permissions.
- [ ] Validate and encode every route/query parameter and externally supplied URL.
- [ ] Verify tokens are scoped, expiring, revocable, and rejected across Basic/Plus boundaries.
- [ ] Clear authenticated React Query data on logout/account removal.
- [ ] Review deep links and redirect parameters so they cannot navigate to arbitrary external URLs.
- [ ] Test logs and error payloads for PII leakage.
- [ ] Review the implementation against relevant OWASP MASVS storage, authentication, network, platform, code, and privacy controls; record evidence and gaps.

## Task 10: Android-first performance and build size

**Files:**

- Modify: `apps/client-app/app.json` or migrate to typed app config only if required.
- Modify: `apps/client-app/eas.json`
- Optimize: `apps/client-app/assets/**`
- Document measurements in `docs/deployment/PERFORMANCE_AND_SIZE.md`.

- [ ] Measure on a release/profile Android build, not only Expo development mode.
- [ ] Show a responsive visual shell without waiting for network completion. Target meaningful Home content or skeleton within 1.5 seconds on a representative mid-range Android emulator/device after native startup.
- [ ] Keep interaction feedback under 100 ms and search suggestion debounce around 300 ms.
- [ ] Measure p50/p95 for categories, providers, search suggestions, OTP request, OTP verify, session refresh, and service request on the release candidate network. Record status, date, environment, and sample size.
- [ ] Optimize or convert oversized images. Treat any individual bundled image above 500 KB as requiring explicit justification.
- [ ] Remove unused assets, fonts, packages, debug code, and duplicate images from the production bundle.
- [ ] Produce an Android App Bundle and record AAB size plus estimated Play download size. Target an AAB below 50 MB unless measured native dependencies make a documented exception necessary.
- [ ] Verify Hermes, minification, ProGuard/resource shrinking, adaptive icon, splash, versionCode, package ID, and production update/runtime settings.
- [ ] Keep iOS bundle identifier, icons, splash, safe areas, deep links, SecureStore behavior, and linking functionality compatible.

## Task 11: Automated and device testing

Add a maintained Expo-compatible test setup if the repository lacks one. Select versions from official Expo SDK 52 documentation rather than guessing.

Required automated coverage:

- [ ] Ethiopian phone normalization and validation.
- [ ] API URL construction and envelope/error parsing.
- [ ] timeout, cancellation, retry classification, jitter bounds, 429 handling, and circuit states.
- [ ] single-flight refresh and replay limit.
- [ ] SecureStore persistence, logout clearing, and fresh-install stale-Keychain clearing.
- [ ] OTP request/verify/resend/expiry/invalid/429/double-tap flows.
- [ ] category count adaptation, provider adaptation, filters, search suggestions, and empty/error states.
- [ ] service request validation, authentication gate, idempotency, and duplicate-submit protection.
- [ ] English/Amharic completeness and no-clipping smoke fixtures.
- [ ] navigation smoke coverage for every route and bottom tab.

Required Android device/emulator scenarios:

- [ ] fresh install and first launch;
- [ ] successful OTP login once;
- [ ] kill/relaunch and device reboot session restoration;
- [ ] offline launch, reconnect, timeout, 429, 500, malformed response, and expired session;
- [ ] rapid repeated taps on OTP, request, retry, Call, WhatsApp, and navigation controls;
- [ ] category browsing, suggestion selection, filtering, provider detail, bookmark, Call, WhatsApp, request submission, language switch, logout;
- [ ] background/foreground transitions and Android back button behavior;
- [ ] keyboard, screen reader labels, font scaling, and narrow screen checks.

Required iOS compatibility evidence:

- [ ] TypeScript/lint/export passes for iOS-compatible code.
- [ ] iOS simulator or EAS preview build if credentials/environment permit.
- [ ] SecureStore fresh-install detection accounts for Keychain persistence.
- [ ] Call/WhatsApp fallbacks, safe areas, keyboard, and navigation do not use Android-only assumptions.

## Task 12: Release configuration and final gate

**Files:**

- Update: `apps/client-app/app.json` or app config
- Update: `apps/client-app/eas.json`
- Create: `docs/deployment/DEPLOYMENT_READINESS_REPORT.md`
- Create: `docs/deployment/TEST_EVIDENCE.md`
- Create: `docs/deployment/RELEASE_CHECKLIST.md`

- [ ] Validate app name, Android package, iOS bundle ID, scheme, icons, splash, orientation, version, Android versionCode, iOS buildNumber, privacy disclosures, permissions, support URL, and store metadata dependencies.
- [ ] Keep production API environment explicit and fail the production build if it resolves to localhost, a relative static-host URL, mock mode, or a non-HTTPS origin.
- [ ] Ensure EAS development, preview, and production profiles are distinct and contain no committed secrets.
- [ ] Run fresh final commands from `apps/client-app`:

```bash
npm run typecheck
npm run lint
npx expo export --platform android
npx expo export --platform ios
npx expo export --platform web
npx expo-doctor
```

- [ ] Run the complete mobile automated test command and report exact counts.
- [ ] Run targeted and full backend tests for every backend file changed.
- [ ] Build a release Android AAB using EAS or the approved local release workflow. Record the build ID, artifact checksum, and size.
- [ ] Build an iOS preview/release candidate if credentials permit; otherwise report the exact external blocker and retain code-level compatibility evidence.
- [ ] Re-run the live critical path against `https://api.serrale.com`: categories, providers, search suggestions, one OTP login, session restoration, customer profile, one non-destructive request test approved by the user, Call/WhatsApp intent validation, and logout.
- [ ] Confirm no P0/P1 defects, no unhandled critical-path exception, no secret/PII leakage, and no unresolved high-severity production dependency vulnerability.

Final report must include:

```text
Git commit(s) and repositories changed
API contract changes and migrations
Automated test commands and exact results
Android device matrix and results
iOS compatibility evidence
Live OTP result without exposing phone/code
Rate-limit and duplicate-tap evidence
Offline/error/circuit-breaker evidence
Performance p50/p95 measurements
Android AAB/EAS build ID, checksum, and size
Security findings and resolutions
Known limitations and external credential blockers
Go / No-Go recommendation with reasons
```

Do not state that the app is deployment-ready unless all required gates have fresh evidence. If any gate fails, continue fixing it. If a gate depends on external credentials or user input, mark the result `BLOCKED`, identify the exact owner/action, and do not hide it behind a general success statement.
