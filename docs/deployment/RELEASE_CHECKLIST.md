# SERRALE Basic — Release Checklist

Production readiness for the Basic mobile client (`apps/client-app`). This document
owns the observability / error-handling launch gates introduced in Task 8 and the
**open blocker** for a real crash-reporting provider.

---

## Error handling & observability (Task 8)

The app ships a complete, PII-safe error and observability layer:

| Concern | Module | Notes |
| --- | --- | --- |
| Global crash boundary | `src/components/ErrorBoundary.tsx` | Class component; branded recovery screen; safe restart (`onReset` → `/`). Wired in `app/_layout.tsx` inside `SafeAreaProvider`, outside the query/navigation tree. |
| Failure-class mapping | `src/lib/error-presentation.ts` | Maps every typed error to user-safe, localized copy. No raw message/stack/SQL/Supabase/provider response ever reaches the user. |
| Redaction | `src/lib/redact.ts` | Single scrub gate for phones, OTPs, tokens, JWTs, Authorization headers, nested bodies. |
| Logger | `src/lib/logger.ts` | Single sanctioned sink. `__DEV__`-gated. Redacts before emit. Owns the breadcrumb ring buffer. |
| Crash adapter | `src/lib/crash-reporter.ts` | Interface + **no-op-safe** default. Redacts every payload before it would forward. |

All user-facing strings are `labels.ts` keys (`errors.*`, `recovery.*`) — English +
Amharic. See the Task 8 report for the exact key list handed to T7 localization.

---

## 🚨 LAUNCH BLOCKER — crash-reporting provider (T12)

**Status: BLOCKED — external credentials unavailable in this environment.**

A real crash-reporting SDK (e.g. Sentry / Bugsnag / Firebase Crashlytics) is **not**
integrated. The adapter interface (`CrashReporter` in `src/lib/crash-reporter.ts`) is
ready to receive one; the default implementation is a redacting no-op.

To go live at T12, the following must be provided and wired:

- [ ] **Crash-reporting DSN / API key** for the approved provider (per-platform if
      required). *← the missing external configuration blocking full observability.*
- [ ] Concrete `CrashReporter` implementation calling the SDK's
      `captureException` / `addBreadcrumb` / `setRelease`, installed at the app root
      via `setCrashReporter(...)` **before** `getCrashReporter().setRelease(...)`.
- [ ] **Release identifier + source-map (symbolication) upload** wired into the EAS
      build so production stack frames are readable. `setRelease(APP_VERSION)` is
      already called in `app/_layout.tsx`; the build must upload matching maps.
- [ ] **Provider-side PII scrubbing** enabled as defence-in-depth. The client already
      redacts via `redact()` before anything crosses the adapter boundary; the
      provider config must NOT re-attach request bodies, headers, or breadcrumb PII.
- [ ] Verify in a staging build that a forced crash produces a symbolicated,
      **PII-free** event (no phone / OTP / token / Authorization / concrete ids).

Until the DSN is supplied, the app is safe to build and run — errors are handled,
logged (dev), and discarded (prod no-op) without leaking data — but production crash
telemetry is not collected.

---

## Pre-release verification

Run from `apps/client-app`:

- [ ] `npm test` — all green, zero skips
- [ ] `npm run typecheck` — clean
- [ ] `npm run lint` — 0 errors, 0 warnings
- [ ] `npx expo export --platform web` — succeeds
- [ ] Manual: force an error state per class (offline, 401, 429, 5xx, maintenance)
      and confirm mapped copy renders in both English and Amharic.
