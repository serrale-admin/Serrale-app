# SERRALE Basic — Deployment Readiness Report (Task 12, final gate)

**Master release document** for the SERRALE Basic mobile client (`apps/client-app`).
This is the consolidation gate for the 12-task deployment-readiness plan. It records
every gate with **fresh evidence or an honest BLOCKED status** (with owner + exact
action) and gives a qualified Go/No-Go. It deliberately does **not** claim unqualified
"deployment-ready."

- **Prepared:** 2026-07-09
- **App:** `apps/client-app` — Expo SDK ~52, React Native 0.76, Hermes, expo-router
- **Repo / branch:** `SERRALE-Basic-Mobile-App-` · `feat/serrale-api-client`
- **Environment:** macOS (Darwin 24.3, arm64), Node v22.20.0 — headless (no emulator,
  no simulator, no EAS/Apple credentials)

## Companion documents (all co-located in `apps/client-app/docs/deployment/`)

| Doc | Owns |
|---|---|
| [API_CONTRACT_MATRIX.md](./API_CONTRACT_MATRIX.md) (T1) | `/public-directory/*` contract; backend↔mobile field mapping |
| [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) (T8) | Error/observability launch gates; crash-DSN blocker; OTA decision |
| [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) (T9) | MASVS review; dependency triage; GAP-1..4 |
| [PERFORMANCE_AND_SIZE.md](./PERFORMANCE_AND_SIZE.md) (T10) | Asset optimization; config verification; latency samples; BLOCKED perf recipes |
| [DEVICE_TEST_PLAN.md](./DEVICE_TEST_PLAN.md) (T11b) | Per-scenario Android/iOS device matrix (BLOCKED on hardware) |
| [TEST_EVIDENCE.md](./TEST_EVIDENCE.md) (T12) | Raw command output: sweep, backend tests, live reads |
| **DEPLOYMENT_READINESS_REPORT.md** (this) | Master gate + Go/No-Go |

> **Doc consolidation note (T12):** T1/T8/T9/T10 placed their docs at the repo-root
> `docs/deployment/`; T11b placed `DEVICE_TEST_PLAN.md` under `apps/client-app/docs/deployment/`.
> Per the T12 directive to co-locate, the four root docs were `git mv`'d into
> `apps/client-app/docs/deployment/` (history preserved) so all seven live together.

---

## 1. Git commit(s) and repositories changed

**Mobile repo** (`SERRALE-Basic-Mobile-App-`, worktree `feat/serrale-api-client`) — the
only repo changed by this task. Pre-T12 baseline `012d007`. T12 change is a single
config-and-docs commit (SHA recorded on merge/commit):

- `app.json` — add `android.versionCode: 1`, `ios.buildNumber: "1"`.
- `src/lib/env.ts` — add production env build guard `assertProductionEnv()`; tighten
  `USE_MOCK` to an explicit `'true'` opt-in via a pure `parseUseMock()`.
- `src/lib/__tests__/env.test.ts` — **new**, 24 tests for the guard + toggle parsing.
- `docs/deployment/*` — new `DEPLOYMENT_READINESS_REPORT.md`, `TEST_EVIDENCE.md`;
  consolidated 4 existing docs into this folder.

No app behavior changed; no prior layer weakened (config + guard + docs + tests only).

**Backend repo** (`/Users/terusew/Projects/serrale`, `SERRALE-Main`) — **READ-ONLY**,
not modified or staged. Commits behind the mobile session flow, tested but **not yet
deployed** to `api.serrale.com`:

| SHA | Subject |
|---|---|
| `a203c69` | durable Basic customer sessions (access + rotating refresh) |
| `b73af16` | authenticated service requests + atomic refresh rotation |
| `1e5c4fa` | CORS allow-list for mobile client tracing headers |
| `ccc3dd0` | allow `Idempotency-Key` in CORS allow-list |

---

## 2. API contract changes and migrations

- **Mobile API contract:** unchanged this task. Consumes `/api/public-directory/*`
  exactly as recorded in [API_CONTRACT_MATRIX.md](./API_CONTRACT_MATRIX.md). All 13
  call sites target `/public-directory/*`; no provider/plus/admin path is called
  (verified T9 §MASVS-AUTH).
- **Migration required for the session flow (BLOCKED — see §12, gate B-1):**
  `20260704090000_directory_customer_refresh_sessions`. Until applied in production,
  customer-session create/refresh endpoints will fail (503) even though the route is
  mounted (live probe: `GET /customers/me` → 401, i.e. route present, auth required).

---

## 3. Automated test commands and exact results

Full raw output: [TEST_EVIDENCE.md](./TEST_EVIDENCE.md). Summary:

| Command (from `apps/client-app`) | Result | Exit |
|---|---|---|
| `npm run typecheck` | Clean | 0 |
| `npm run lint` | 0 errors / 0 warnings | 0 |
| `npm test` | **39 suites / 374 tests pass**, 0 fail, 0 skip | 0 |
| `npx expo export --platform android` | `Exported: dist` (hbc 10.7 MB) | 0 |
| `npx expo export --platform ios` | `Exported: dist` (hbc 10.7 MB) | 0 |
| `npx expo export --platform web` | `Exported: dist` (js 7.64 MB) | 0 |
| `npx expo-doctor` | 18/18 checks passed | 0 |

**Backend** (`serrale/backend`, read-only): `npm test` → **34 suites / 223 tests pass**.

Test count 350 → 374: the new `env.test.ts` guard suite (+24). No suite was skipped.

---

## 4. Android device matrix and results

**BLOCKED — needs Android hardware/emulator + a signed build** (see §12, gate B-4/B-7).
The full per-scenario matrix (install/session lifecycle, network & failure handling,
rapid-repeated-tap idempotency, full journey & platform behaviors) is enumerated with
exact recipes and empty **Result** fields in [DEVICE_TEST_PLAN.md](./DEVICE_TEST_PLAN.md)
§Section A (~32 items across A.1–A.4). Code-level compatibility is proven now via
typecheck + lint + the Android Metro/Hermes **export (green)** + the full automated
suite; on-device execution stays BLOCKED until run on hardware.

---

## 5. iOS compatibility evidence

**Code-level: GREEN. Device/simulator/EAS build: BLOCKED** (needs macOS + Xcode / Apple
credentials — §12, gate B-5). Evidence available now:

- iOS Metro/Hermes **export green** (`entry-*.hbc` 10.7 MB) — the iOS-target JS bundle
  builds cleanly.
- Shared `app.json` iOS config verified: `bundleIdentifier et.serrale.basic`,
  `buildNumber "1"` (added this task), `supportsTablet`, deep-link `scheme: serrale`,
  no ATS weakening (T9 §MASVS-NETWORK), SecureStore-based session.
- Per-scenario iOS matrix (recorded-now + BLOCKED device items) in
  [DEVICE_TEST_PLAN.md](./DEVICE_TEST_PLAN.md) §Section B.

---

## 6. Live OTP result (without exposing phone/code)

**BLOCKED — deliberately not exercised** (§12, gate B-3). One live OTP login requires
the user's real phone **and** the deployed backend + applied migration; per the task's
hard rules, no OTP or write endpoint was hit against production. What was verified live
(read-only, public): `categories`, `providers`, `search/suggest` all HTTP 200 (see §9 /
[TEST_EVIDENCE.md](./TEST_EVIDENCE.md) §3). The OTP request→verify→session-exchange path
is fully covered by automated tests (`session-manager.test.ts`, `otp-retry.test.ts`,
`secure-session.test.ts`) but its live confirmation is an owner action.

---

## 7. Rate-limit and duplicate-tap evidence

**Automated: GREEN. On-device confirmation: BLOCKED** (device matrix A.3).

- Writes are **never blind-replayed** on 401 (`http.ts` — verified T9 §MASVS-AUTH);
  single-flight refresh guard prevents a thundering herd (`session-manager.ts`
  module-level `refreshPromise`).
- Idempotency + in-flight-guard behavior is covered by `request-policy.test.ts`,
  `http-reliability.test.ts`, `http-retry-capture.test.ts`, `otp-retry.test.ts`, and
  the `Idempotency-Key` CORS allow-list (backend `ccc3dd0`).
- Rapid-repeated-tap idempotency on real hardware is item **A.3** in
  [DEVICE_TEST_PLAN.md](./DEVICE_TEST_PLAN.md) — BLOCKED on a device.

---

## 8. Offline / error / circuit-breaker evidence

**Automated: GREEN. On-device confirmation: BLOCKED** (device matrix A.2).

- Every typed failure maps to user-safe, localized (EN/AM) copy — no raw
  message/stack/SQL/provider text reaches the UI (`error-presentation.ts`;
  `error-presentation.test.ts`). Transport failures are coarsely classified
  (`http.ts classifyTransportFailure`; `http-interceptor.test.ts`).
- Retry/backoff + circuit behavior: `http-reliability.test.ts`,
  `http-retry-capture.test.ts`, `request-policy.test.ts`.
- Global crash boundary with branded recovery (`ErrorBoundary.tsx`; wired in
  `_layout.tsx`) — see [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md).
- Live offline/5xx/maintenance state rendering on a device is item **A.2** — BLOCKED.

---

## 9. Performance p50/p95 measurements

Full detail + recipes: [PERFORMANCE_AND_SIZE.md](./PERFORMANCE_AND_SIZE.md) §4–5.

- **Live public read (indicative, dev workstation, 2026-07-09):**
  `categories` 200 (cold 24.4 s / **warm ~1.0–1.17 s**), `providers?limit=5` 200
  (1.11 s), `search/suggest?q=pl` 200 (0.71 s). The cold-start figure is a serverless /
  TLS-handshake outlier, recorded honestly.
- **Rigorous p50/p95 (OTP request/verify, session refresh, service request; and n≥30
  on-device reads) — BLOCKED** (§12, gate B-6): authenticated write flows were not hit;
  and the device-network sample must be captured on a release candidate, not a dev box.
- **Startup / meaningful-Home < 1.5 s on a release build — BLOCKED** on a native build
  (recipe in T10 §5.2).
- Code-level latency controls verified: 300 ms search-suggest debounce, synchronous
  press feedback, pre-data skeletons, non-blocking bootstrap (T10 §3).

---

## 10. Android AAB / EAS build ID, checksum, and size

**BLOCKED — needs `eas login` + Android credentials** (§12, gate B-4):

```bash
cd apps/client-app
eas build -p android --profile production   # → .aab (buildType: app-bundle in eas.json)
```

Record the **EAS build ID**, **artifact size** (target AAB < 50 MB), and **checksum**
from the EAS build page; get the Play download estimate via App bundle explorer. The
Metro/Hermes JS bundle is 10.7 MB (android export) but the installable AAB size can only
come from a native build. `eas.json` `production` profile is verified: `buildType:
app-bundle`, distinct from `development`/`preview`, no committed secrets.

---

## 11. Security findings and resolutions

Full audit: [SECURITY_REVIEW.md](./SECURITY_REVIEW.md). Executive status:

- **No launch-blocking security finding.** No PII/secret leak on any log path; no secret
  committed or bundled; all production traffic HTTPS; cleartext disabled on Android (T9).
- **Dependency audit:** `npm audit --omit=dev` → 22 findings (17 high, 5 moderate,
  **0 critical**), **all** in the Expo CLI/build toolchain — never shipped to the device
  bundle. Remediation = coordinated Expo SDK-upgrade window (GAP-3), not a forced bump.
- **T9 fixes (each closes a real finding):** `usesCleartextTraffic:false`; sanitized
  `tel:` intent; spaced-phone redaction pattern (GAP-4 closed).
- **Open low-severity, out of mobile scope:** GAP-1 (backend `verifyAccessToken` lacks a
  token-type assertion — LOW, **not reachable from this app**, owner = backend team);
  GAP-2 (no TLS pinning — deliberate launch baseline).
- **T12 config-security additions:** production env guard rejecting mock/localhost/
  non-HTTPS/relative origins at release; explicit `'true'`-only mock opt-in.

---

## 12. Known limitations and external credential blockers (every BLOCKED gate)

Each gate below has an owner (**the user / deploy owner**) and an exact action. Nothing
here is hidden behind a success statement.

| # | Gate | Status | Exact owner action |
|---|---|---|---|
| **B-1** | Supabase migration `20260704090000_directory_customer_refresh_sessions` not applied → customer-session endpoints 503 in prod | **BLOCKED** | Apply the migration to the production Supabase project (via the management API per project memory; MCP is read-only), then verify `list_migrations`. |
| **B-2** | Backend commits `a203c69`, `b73af16`, `1e5c4fa`, `ccc3dd0` not deployed to `api.serrale.com` | **BLOCKED** | Deploy the `SERRALE-Main` backend (session endpoints + CORS headers) to production; confirm `/customers/session` create/refresh return non-503. |
| **B-3** | Live critical path incl. **one** live OTP login (request→verify→session→profile→one non-destructive request→Call/WhatsApp intent→logout) | **BLOCKED** | After B-1+B-2, run the checklist in [DEVICE_TEST_PLAN.md](./DEVICE_TEST_PLAN.md) §A.1/A.4 on a device with a real phone. Record pass/fail without exposing phone/code. |
| **B-4** | Release **Android AAB** build ID + checksum + size (target < 50 MB) | **BLOCKED** | `eas login`; `eas build -p android --profile production`; record build ID, size, checksum. |
| **B-5** | **iOS** simulator / EAS preview build | **BLOCKED** | On macOS + Xcode / Apple credentials: `eas build -p ios --profile preview` (or a simulator run). Code-level compat already GREEN (§5). |
| **B-6** | Rigorous **p50/p95** (auth write flows + n≥30 on-device reads) and release-build startup < 1.5 s | **BLOCKED** | Capture per recipes in [PERFORMANCE_AND_SIZE.md](./PERFORMANCE_AND_SIZE.md) §5 on a release candidate + device network. |
| **B-7** | **Device matrix** (~32 Android/iOS scenarios) | **BLOCKED** | Execute [DEVICE_TEST_PLAN.md](./DEVICE_TEST_PLAN.md) §A + §B on hardware; fill Result fields with evidence. |
| **B-8** | **Crash-reporting provider DSN** (no-op redacting adapter in place) | **BLOCKED** | Supply provider DSN; implement `CrashReporter` + `setCrashReporter(...)`; wire source-map upload into EAS; verify a PII-free symbolicated crash. See [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md). |

**Documented non-blocking findings (not release gates):** 22 dev/build-only dependency
vulns (0 critical, never shipped — GAP-3); backend GAP-1 (LOW, not mobile-reachable).

**Decisions recorded this task:** **No OTA at launch** — `expo-updates` is a dependency
but no `updates`/`runtimeVersion` block is configured (intentional for a pure store-binary
release); add `runtimeVersion` + `updates.url` if/when EAS Update is introduced. This is a
deliberate decision, not a gap. (See [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md).)

---

## 13. Go / No-Go recommendation with reasons

The app is **code-complete and all-green**: 374 mobile tests + 223 backend tests pass;
typecheck clean; lint 0/0; android + ios + web exports green; expo-doctor 18/18;
security-reviewed with **0 production criticals**; bundle size-optimized (T10); and a new
release guard fails any build that resolves to mock/localhost/non-HTTPS. It is **not**
production-deployable until the user-gated external steps (B-1..B-8) clear.

- **GO — internal-testing / preview track.** Ship to an internal/preview channel now:
  the code, config, and automated evidence support it. Requires only B-4/B-5 for the
  installable artifacts.
- **NO-GO — public production**, until at minimum: **B-1** (migration) + **B-2**
  (backend deploy) + **B-3** (one live OTP smoke) + **B-4** (release AAB) + **B-8**
  (crash DSN) are cleared, with B-6/B-7 evidence captured on the release candidate.

**This report does not certify unqualified "deployment-ready."** It certifies
*code-complete, all-green, and blocked only on external/credentialed steps* — each named,
owned, and actionable above.
