# SERRALE Basic — Mobile App Security Review (Task 9)

Scope: `apps/client-app/` (Expo SDK 52 / React Native 0.76, Hermes). Native mobile
client + web export. Reviewed at branch `feat/serrale-api-client`.

This document maps the app's implementation to the OWASP **MASVS** control groups,
citing concrete evidence (file:line / command output), and lists explicit GAPS with
severity + owner for the T12 deploy/hardening pass. It is an AUDIT artifact: most
security controls were built in earlier tasks (T2/T3/T8) and are VERIFIED here; the
few targeted fixes made under T9 are called out inline.

---

## 1. Executive summary

- **No launch-blocking finding.** No PII/secret leak is reachable on any log path;
  no secret is committed or bundled; all production traffic is HTTPS.
- **Dependency audit: 0 critical, 0 runtime-exploitable production vulns.** All 22
  `--omit=dev` findings live in the Expo **build/CLI toolchain** (never shipped to
  the device bundle). See §MASVS-CODE and the triage table.
- **Targeted fixes made under T9** (each cites a real finding):
  1. `android.usesCleartextTraffic: false` for release (app.json) — prevents
     cleartext HTTP on Android.
  2. `tel:` URL is now built from a sanitized `+`/digits phone (ContactSheets.tsx)
     — validate/encode-before-intent.
  3. `redact.ts` hardened to also scrub **spaced** display-format phones
     (`0912 345 678`) — defensive closure of the known PHONE_RE gap.

---

## MASVS-STORAGE — sensitive data at rest

| Control | Evidence |
|---|---|
| Session tokens stored only in the OS keystore, never AsyncStorage/plaintext | `src/lib/secure-session.ts:1,11-38` — `expo-secure-store` `getItemAsync`/`setItemAsync`/`deleteItemAsync` under key `serrale_customer_tokens`. No token ever written to AsyncStorage. |
| Non-sensitive app state persistence carries no secrets | Zustand persist (`src/store/appStore.ts`) holds prefs/user display fields; tokens are NOT persisted there (they live in SecureStore). |
| Secrets cleared on logout | `src/lib/session-manager.ts:159-173` `handleLogout` → `secureSession.clear()` + `queryClient.clear()` + `useAppStore.logout()`. |
| No secret at rest in the shipped bundle | Secret scan of `dist/` (web export) is clean; only baked value is the public `https://api.serrale.com/api` base URL. |

## MASVS-AUTH — authentication & session management

| Control | Evidence |
|---|---|
| Short-lived access token + rotating hashed refresh | Backend (READ-ONLY) `directoryCustomerSession.service.ts:9-10,24,88-90` — access JWT scope `directory_customer_session`, 1h TTL; refresh rotates. Mobile: `session-manager.ts:84-132` single-flight `doRefresh` (module-level `refreshPromise` guard). |
| Single-flight refresh; no thundering herd on 401 | `session-manager.ts:85-131` + `http.ts:376-379` 401 interceptor replays once via `unauthorizedHandler`; writes are never blind-replayed (`http.ts:186-197`). |
| Revocation on logout (server + local) | `api/serrale/auth.ts:67-79` best-effort `logoutSession`; `session-manager.ts:159-173` clears local state regardless. |
| Token scope isolation across Basic/Plus boundaries | Backend rejects wrong-scope tokens: customer endpoints `publicDirectory.ts:156-172` `requireCustomerSession` asserts `decoded.scope === 'directory_customer_session'` else 401; provider/Plus endpoints compose `serraleAuth` + `requireRole([...])` (`rbac.ts:26-30` → 403 when role absent). A customer token carries no `role`, so it is denied on privileged routes. See GAP-1. |
| Mobile never sends a customer token cross-boundary | All 13 API call sites target `${DIRECTORY}` = `/public-directory/*` (`env.ts:18`); grep of `http<...>` in `src/api/serrale/*` shows no provider/plus/admin path. The bearer token is attached only via the token provider (`session-manager.ts:180-184`). |
| OTP codes / verify tokens are one-time & not retained | `session-manager.ts:134-157` `handleExchange` consumes the verify_token; store no longer holds it. |

## MASVS-NETWORK — network communication

| Control | Evidence |
|---|---|
| HTTPS-only API base | `src/lib/env.ts:7-8` default `https://api.serrale.com/api`; `.env` sets the same https value. No `http://` origin in app source (only safe-route **rejection** test fixtures). |
| Android cleartext disabled for release | **FIX (T9):** `app.json` → `expo-build-properties.android.usesCleartextTraffic: false`. |
| iOS ATS not weakened | No `NSAppTransportSecurity`/`NSAllowsArbitraryLoads` override in app.json — Expo default ATS (TLS-enforced) applies. |
| Transport diagnostics never leak raw system text | `http.ts:423-437` `classifyTransportFailure` maps errors to a coarse safe class; user sees generic copy. |
| No certificate pinning | Not implemented — see GAP-2 (deliberate; decision for T12). |

## MASVS-PLATFORM — platform interaction

| Control | Evidence |
|---|---|
| Minimal permissions | `app.json` declares **no** Android `permissions` array and **no** iOS usage-description/entitlements beyond Expo defaults. Effective Android perms = INTERNET (Expo default). No CALL_PHONE / READ_CONTACTS / SMS / storage. |
| `tel:`/`whatsapp:` via Linking need no permission | `ContactSheets.tsx:28-44` uses `Linking.openURL` (fires an intent; requires no direct-call/contacts/SMS permission). |
| Deep links cannot open-redirect | scheme `serrale` (app.json). The only attacker-influenceable nav param `next` is validated to an internal path by `safe-route.ts:25-43` (rejects absolute/scheme/protocol-relative/backslash), applied at `app/auth/verify.tsx:96` and preserved (never navigated to) in `login.tsx`/`verify.tsx`. |
| No WebView / HTML-injection surface | grep: no `WebView`, `dangerouslySetInnerHTML`, or `eval(` in `src`/`app`. |
| `tel:`/WhatsApp URL built from validated + encoded values | WhatsApp: `waDigits()` strips to digits, message `encodeURIComponent`'d (`ContactSheets.tsx:10,40`). **FIX (T9):** `tel:` now built from a `+`/digits-sanitized phone. |

## MASVS-CODE — code quality & build

| Control | Evidence |
|---|---|
| No stray `console.*` in feature code | Only sanctioned sink is `logger.ts` (its own `console.*` is dev-gated at `logger.ts:74-80`). grep confirms no other `console.*` in `src`/`app`. |
| Dependency vulnerabilities triaged | `npm audit --omit=dev` → **22 (17 high, 5 moderate, 0 critical)**. Every finding is a transitive dep of the `expo` metapackage's **CLI/build** subtree (`@expo/cli`, `@expo/config-plugins`, `@expo/metro-config`, `@expo/prebuild-config`, `@expo/plist`, `@xmldom/xmldom`, `tar`, `cacache`, `xcode`, `uuid`, `postcss`, `@expo/rudder-sdk-node`, `@expo/bunyan`). None are imported by app code (grep) → not in the Hermes/web bundle → build-time only. Only fix offered is `expo@57` (SDK 57, semver-major) — out of scope per SDK-52 constraint. See triage table + GAP-3. |
| No debug/mock data ships to production by default | `env.ts:14-15` `USE_MOCK` defaults to false; demo autofill gated behind `USE_MOCK` (`verify.tsx:241`). |
| Release build hardening | `app.json` enables Proguard + resource shrinking for Android release. |

## MASVS-PRIVACY — data minimization & redaction

| Control | Evidence |
|---|---|
| Every log/breadcrumb value redacted before emit | `logger.ts:71-89` `emit()` maps every arg through `redact()`; `addBreadcrumb` redacts on entry (`logger.ts:48-55`). Crash adapter re-redacts (`crash-reporter.ts:51-67`). |
| PII/secret scrubbing (phones, OTP, JWT, Bearer, refresh/prefixed tokens, PII keys) | `redact.ts:34-118` — key-based + value-based double layer. **FIX (T9):** added spaced-phone pattern (`0912 345 678`). |
| Breadcrumbs use route TEMPLATES, never concrete ids/PII | `http.ts:184-196` + `_layout.tsx:65-79` join `useSegments()` (unresolved `[id]`) — no dynamic value can leak. |
| Request metadata headers are PII-free | `http.ts:198-208` — source/surface/version + coarse `app_surface`/route template only. |
| Phone shown masked in UI | `phone.ts:57-74` `maskEthiopianPhone`/`displayEthiopianPhone`; verify screen shows grouped national form only (`verify.tsx:72,206`). |

---

## GAPS (severity + owner, for T12)

| ID | Severity | Gap | Evidence | Mitigation / Owner |
|---|---|---|---|---|
| GAP-1 | Low (backend; out of mobile scope) | `verifyAccessToken` does not assert the JWT is a serrale-session payload (no `profile_id`/`role`/`scope` check) — a customer-session token, signed with the same `SERRALE_JWT_SECRET`, structurally passes `serraleAuth`. Privileged routes are still safe (guarded by `requireRole` → 403 when role absent); only `serraleAuth`-only routes would see `req.user.id === undefined` (no cross-user data access). | `backend/src/services/session.service.ts:192-197`; `serraleAuth.ts:32-61`; `rbac.ts:26-30` | Backend team — add an explicit token-type/scope assertion in `verifyAccessToken` (reject `scope === 'directory_customer_session'` or missing `profile_id`). NOT reachable from this mobile app (it never sends a customer token to a serrale endpoint). |
| GAP-2 | Low | No TLS certificate pinning. | — | T12 decision. Deferred: pinning adds cert-rotation operational risk; ATS/system trust + HTTPS-only is the launch baseline. Revisit if threat model warrants. |
| GAP-3 | Medium (build-time only) | 22 audit findings in the Expo CLI/build toolchain; the only automated remediation is an Expo SDK 57 major upgrade. | `npm audit --omit=dev` (see triage table) | T12 / deploy owner — address in a coordinated Expo SDK upgrade window (with `expo install --check`), not a forced bump. These tools run only in the trusted dev/CI build environment, never on untrusted input at app runtime. |
| GAP-4 | Informational (closed) | `redact.ts` PHONE_RE missed spaced display-format phones (`0912 345 678`). | `redact.ts` | CLOSED in T9 (pattern added + test). Was not reachable: `displayEthiopianPhone` is used only in `verify.tsx` JSX, never on a log path. |

## Dependency-audit triage (`npm audit --omit=dev`)

Totals: **17 high, 5 moderate, 0 critical**. Classification: every advisory is a
**build/CLI-time** dependency of the `expo` metapackage — not part of the JS bundle
that runs on the device (confirmed: none imported by `src`/`app`).

| Package(s) | Severity | Prod-runtime? | Advisory class | Action |
|---|---|---|---|---|
| `tar` (<=7.5.15), `cacache` | high | No — `@expo/cli` build subtree | path traversal on archive extraction (install/EAS build) | Defer to SDK upgrade; not on device. |
| `xcode` → `uuid` (<11.1.1) | moderate | No — `@expo/config-plugins` (prebuild) | `.pbxproj` gen at `expo prebuild` | Defer; build-time. |
| `@xmldom/xmldom` (<=0.8.12), `@expo/plist` | high | No — prebuild/config | XML parse at build | Defer; build-time. |
| `@expo/metro-config`, `postcss` (<8.5.10) | high/mod | No — bundler config | build-time bundler | Defer; build-time. |
| `@expo/cli`, `@expo/config`, `@expo/config-plugins`, `@expo/prebuild-config` | high | No — CLI | CLI orchestration | Defer; build-time. |
| `@expo/rudder-sdk-node`, `@expo/bunyan` → `uuid` (<11.1.1) | moderate | No — CLI telemetry/logging | Expo CLI telemetry | Defer; build-time. |
| `expo`, `expo-asset`, `expo-constants`, `expo-linking`, `expo-router`, `expo-splash-screen`, `expo-updates` | high | Flagged transitively (depend on the above) | inherit build-tool advisories | Defer; the runtime packages themselves are not the vulnerable leaf. |

Two advisories report a **non-semver-major** fix candidate (`expo-linking@7.1.7`,
`expo-router` in-range). These are NOT applied here: bumping individual Expo modules
off the SDK-52 pin risks native/JS drift; validate via `expo install --check` during
the SDK maintenance window (owner: T12).

## Verification commands (T9)

- `npm test` — full suite green (incl. new adversarial redaction + `tel:` sanitize tests).
- `npm run typecheck` — clean (tsc `--noEmit`, exit 0).
- `npm run lint` — 0 errors / 0 warnings.
- `npx expo export --platform web` — succeeds; `dist/` secret scan clean.
- `npm audit --omit=dev` — 0 critical; see triage above.
