# SERRALE Basic — Test & Command Evidence (Task 12)

Raw, reproducible evidence for the final release gate. Every result below is real
command output captured on the release candidate; nothing is fabricated. Gates that
cannot be produced in this environment are marked **BLOCKED** with an exact recipe
and owner (see `DEPLOYMENT_READINESS_REPORT.md`).

- **App under test:** `apps/client-app/` (Expo SDK ~52, React Native 0.76, Hermes)
- **Repo / branch:** `SERRALE-Basic-Mobile-App-` worktree · `feat/serrale-api-client`
- **Mobile baseline commit (pre-T12):** `012d007`
- **Environment:** macOS (Darwin 24.3, arm64), Node v22.20.0
- **Captured:** 2026-07-09

---

## 1. Mobile automated command sweep (from `apps/client-app`)

| Command | Result | Exit |
|---|---|---|
| `npm run typecheck` (`tsc --noEmit`) | Clean — no diagnostics | 0 |
| `npm run lint` (`expo lint` → `eslint .`) | **0 errors / 0 warnings** | 0 |
| `npm test` (`jest`) | **39 suites / 374 tests passed**, 0 failed, 0 skipped (4.1 s) | 0 |
| `npx expo export --platform android` | Success — `Exported: dist` | 0 |
| `npx expo export --platform ios` | Success — `Exported: dist` | 0 |
| `npx expo export --platform web` | Success — `Exported: dist` | 0 |
| `npx expo-doctor` | **18/18 checks passed. No issues detected!** | 0 |

### 1.1 Test suite detail

```
Test Suites: 39 passed, 39 total
Tests:       374 passed, 374 total
Snapshots:   0 total
Time:        4.135 s
```

Test count moved 350 → **374** this task: the new production-env-guard suite
`src/lib/__tests__/env.test.ts` adds **24** tests. Run in isolation:

```
$ npx jest src/lib/__tests__/env.test.ts
Test Suites: 1 passed, 1 total
Tests:       24 passed, 24 total
```

The env suite asserts (a) `assertProductionEnv()` THROWS for mock mode, non-HTTPS,
localhost / `127.0.0.1` / `0.0.0.0` / `[::1]` / `*.local`, and relative/non-absolute
URLs, and PASSES for a real `https://` origin; and (b) `parseUseMock()` returns `true`
ONLY for the exact string `'true'` (trimmed, case-insensitive) — every other value,
including typos (`no`, `off`, `1`, `yes`), stays live.

### 1.2 Export bundle sizes (Hermes bytecode / JS)

| Platform | Entry bundle | Extra files |
|---|---|---|
| android | `entry-*.hbc` — **10.7 MB** | `metadata.json` (4.2 kB) |
| ios | `entry-*.hbc` — **10.7 MB** | `metadata.json` (4.19 kB) |
| web | `entry-*.js` — **7.64 MB** | `index.html` (1.17 kB), `metadata.json` (49 B) |

> These are the Metro/Hermes JS bundle sizes, not the installable app size. The
> release **AAB** size/checksum is BLOCKED on an EAS build — see the readiness report.

### 1.3 expo-doctor

```
Running 18 checks on your project...
18/18 checks passed. No issues detected!
```

`expo-doctor` loads `.env` and confirms only `EXPO_PUBLIC_API_BASE_URL` and
`EXPO_PUBLIC_USE_MOCK` are exported (no secrets). No native-only issue was flagged.

---

## 2. Backend automated tests (serrale repo — READ-ONLY)

Re-run for fresh evidence in `/Users/terusew/Projects/serrale/backend` (`npm test`).
The serrale repo was **not** modified or staged.

```
Test Suites: 34 passed, 34 total
Tests:       223 passed, 223 total
Snapshots:   0 total
Time:        8.321 s
```

Relevant backend commits behind the mobile session flow (serrale repo, `SERRALE-Main`):
`a203c69` durable Basic customer sessions, `b73af16` authenticated service requests +
atomic refresh rotation, `1e5c4fa` + `ccc3dd0` CORS allow-list for mobile client
headers. These are **committed and tested** but **not yet deployed** to
`api.serrale.com` (BLOCKED — see readiness report).

---

## 3. Live read-only smoke against `https://api.serrale.com` (production)

Public GET endpoints only. **No OTP, no write, no authenticated flow was exercised.**
`curl` `time_total`, single sample each unless noted. Captured 2026-07-09.

| Endpoint | Status | time_total | Notes |
|---|---|---|---|
| `GET /api/public-directory/categories` | **200** (179 B) | 24.43 s cold → **1.17 s warm** | First-call time is a cold serverless / TLS-handshake outlier (matches T10 §4); warm is ~1 s. |
| `GET /api/public-directory/providers?limit=5` | **200** (1891 B) | 1.11 s | — |
| `GET /api/public-directory/search/suggest?q=pl` | **200** (255 B) | 0.71 s | — |
| `GET /api/public-directory/customers/me` (no auth) | **401** | — | Route is mounted and requires a customer session (expected without a bearer token). This confirms the route exists; it does **not** confirm the T12 migration is applied or the new commits are deployed — that requires the (BLOCKED) authenticated flow. |

All public reads return HTTP 200. This is an indicative dev-workstation read over the
public internet, not the release-candidate device network (see readiness report / T10
§4–5 for the rigorous, on-device p50/p95 that remains BLOCKED).

---

## 4. Config-change verification (this task)

| Change | File | Verified by |
|---|---|---|
| `android.versionCode: 1` | `app.json` | typecheck + `expo-doctor` 18/18 + export green |
| `ios.buildNumber: "1"` | `app.json` | same |
| Production env guard `assertProductionEnv()` + module-load `!__DEV__` invocation | `src/lib/env.ts` | `env.test.ts` (24 tests) + full suite green |
| `USE_MOCK` tightened to explicit `'true'` (`parseUseMock`) | `src/lib/env.ts` | `env.test.ts` parametrized cases |
| No-OTA-at-launch decision documented | `RELEASE_CHECKLIST.md` / readiness report | doc |
| 5 deployment docs consolidated into `apps/client-app/docs/deployment/` | `git mv` (renames tracked) | `git status` shows `R` renames |

Resolved local env (`.env`, gitignored): `EXPO_PUBLIC_API_BASE_URL=https://api.serrale.com/api`,
`EXPO_PUBLIC_USE_MOCK=false` — a valid production config (HTTPS, mock off) that the new
guard passes. No secret is committed (`git ls-files` shows no `.env`/secret/credential file).
