# SERRALE Basic — Device & iOS Test Plan (Task 11)

A runnable, per-scenario checklist for the on-device / cross-platform verification
that Task 11 requires but that cannot be automated in this headless environment
(no Android emulator, no iOS simulator, no EAS/Apple credentials). The executor
(a developer with hardware, or Task 12) runs each item, records the outcome in its
**Result** field, and attaches evidence (screen recording / logcat / Console).

**Do not fabricate results.** Items that are genuinely verifiable now (TypeScript,
lint, and the cross-platform web export of the iOS-compatible code, plus the
automated suite) were executed and are recorded below with the real command output.
Everything needing a device, emulator, or a signed build is marked **BLOCKED** with
an exact recipe — it stays BLOCKED until someone runs it on hardware.

- **App under test:** `apps/client-app/` (Expo SDK 52, RN 0.76, Hermes)
- **Branch / baseline:** `feat/serrale-api-client`
- **Recorded-now results captured:** 2026-07-09
- **iOS bundle id:** `et.serrale.basic` · **Android package:** `et.serrale.basic` · **scheme:** `serrale`

---

## How to build & run

```bash
cd apps/client-app
npm install

# Dev client / Metro (choose a target)
npm run android          # expo run:android  → connected device or emulator
npm run ios              # expo run:ios      → simulator or connected iPhone
npm start                # Metro only; open in Expo Go / a dev build

# Point at a backend. Live is the default; mock is opt-in.
#   EXPO_PUBLIC_API_BASE_URL  → REST base (default https://api.serrale.com/api)
#   EXPO_PUBLIC_USE_MOCK      → "true" uses bundled mock data (offline, deterministic)
EXPO_PUBLIC_USE_MOCK=false EXPO_PUBLIC_API_BASE_URL=https://<staging>/api npm run android
```

Network-failure scenarios (timeout / 429 / 500 / malformed) are easiest to force with
a proxy (Charles / mitmproxy / Proxyman) or by pointing `EXPO_PUBLIC_API_BASE_URL` at a
local stub server that returns the desired status/body. `EXPO_PUBLIC_USE_MOCK=true` gives
a deterministic offline UI for the pure-navigation and accessibility passes.

**Legend:** `PASS` observed & correct · `FAIL` observed & wrong (file a bug) · `BLOCKED` not yet run (needs hardware/credentials).

---

## Section 0 — Code-verifiable now (EXECUTED — real results)

These are the Task 11 "iOS-compatible code" gates plus the automated suite. They run
in CI / on any dev machine with no device and were executed against this branch.

| # | Item | Command | Expected | Result (2026-07-09) |
|---|------|---------|----------|---------------------|
| CV1 | TypeScript compiles (all platforms) | `npm run typecheck` | `tsc --noEmit` exits 0, no errors | **PASS** — exit 0, no diagnostics |
| CV2 | Lint clean | `npm run lint` | `expo lint` exits 0, 0 errors / 0 warnings | **PASS** — exit 0, 0/0 |
| CV3 | Cross-platform bundle (proves no Android-only / native-only import breaks the JS graph) | `npx expo export --platform web` | Export succeeds, `dist/` written | **PASS** — exit 0, `dist/` emitted (single web bundle) |
| CV4 | Automated test suite (unit + adapters + screens + **per-route nav smoke**) | `npm test` | All suites green | **PASS** — 38 suites / 350 tests green |

> CV1–CV3 are exactly the Task 11 "TypeScript/lint/export passes for iOS-compatible
> code" requirement and satisfy **iOS item I1** below. They do **not** replace a real
> iOS run (I2–I9) — a compile is not a runtime.

---

## Section A — Android device / emulator scenarios (BLOCKED — needs hardware)

Run on at least one physical Android device and one emulator (min API 24 / Android 7,
which is the Expo SDK 52 floor). Use a **live/staging** backend unless the step says mock.

### A.1 Install & session lifecycle

| # | Scenario | Steps | Expected | Result |
|---|----------|-------|----------|--------|
| A1 | Fresh install + first launch | Uninstall, then `npm run android` (or install the APK). Cold-launch. | Splash → Home. No crash. Signed-out state (Profile shows guest card). No stale session restored. | BLOCKED |
| A2 | Successful OTP login (once) | Profile → "Log in with phone" → enter a real Ethiopian number → receive code → enter 6 digits. | Verify screen accepts the code, session exchange succeeds, lands on the `next` route, Profile now shows the account rows + Logout. | BLOCKED |
| A3 | Kill / relaunch restoration | After A2, swipe-kill the app, relaunch. | Still signed in (tokens read from SecureStore, silent refresh if access expired). No re-login prompt. | BLOCKED |
| A4 | Device reboot restoration | After A2, reboot the phone, open the app. | Still signed in; session restored from SecureStore. | BLOCKED |

### A.2 Network & failure handling

Force each condition via proxy or a stub base URL.

| # | Scenario | Steps | Expected | Result |
|---|----------|-------|----------|--------|
| A5 | Offline launch | Enable airplane mode, cold-launch, open Search / a category. | App renders; data screens show the mapped **offline** error surface (Try again), never a raw error or crash. | BLOCKED |
| A6 | Reconnect | From A5, disable airplane mode, tap **Try again**. | Query refetches and content loads. | BLOCKED |
| A7 | Timeout | Proxy delays a request past the client timeout. | Screen shows the mapped **timeout** copy with retry; no infinite spinner. | BLOCKED |
| A8 | 429 rate-limited | Backend returns 429 with `Retry-After` / `retry_after_seconds` on an OTP send. | Login/verify shows the specific "wait N seconds/minutes" copy; resend stays disabled for the server window (not shortened). | BLOCKED |
| A9 | 500 server error | Proxy returns 500 on a provider list. | Mapped **server** error surface + Try again; no raw body shown. | BLOCKED |
| A10 | Malformed / non-JSON | Proxy returns HTML/garbage with 200. | Mapped generic error surface; no crash, no leaked body. | BLOCKED |
| A11 | Expired session | Invalidate the refresh token server-side, then submit a request. | Single-flight refresh fails → user routed to sign-in (session-expired action), not a raw 401. | BLOCKED |

### A.3 Rapid repeated taps (idempotency / in-flight guards)

| # | Scenario | Steps | Expected | Result |
|---|----------|-------|----------|--------|
| A12 | OTP send + verify hammering | Rapidly tap **Send code** ~6×; then auto-submit / tap verify repeatedly. | Exactly one OTP request per logical send (in-flight guard); one verify attempt; no duplicate SMS storm. | BLOCKED |
| A13 | Request submit hammering | On the request form, tap **Submit** many times fast, incl. after a failed attempt. | One lead per logical submission (stable Idempotency-Key across retry-taps); a duplicate replays, never double-creates. | BLOCKED |
| A14 | Retry hammering | On an errored data screen, tap **Try again** rapidly. | No request pile-up; latest result wins; no crash. | BLOCKED |
| A15 | Call hammering | On a provider, tap **Call** repeatedly. | One dialer intent; confirmation sheet not duplicated. | BLOCKED |
| A16 | WhatsApp hammering | Tap **WhatsApp** repeatedly. | One WhatsApp intent; graceful if not installed (see I6). | BLOCKED |
| A17 | Navigation hammering | Double/triple-tap cards, back, and tab switches quickly. | No duplicate pushes / stuck screens / crash. | BLOCKED |

### A.4 Full journey & platform behaviors

| # | Scenario | Steps | Expected | Result |
|---|----------|-------|----------|--------|
| A18 | End-to-end journey | Home → browse a category → type a query (see suggestions) → apply a filter → open a provider detail → bookmark → **Call** → back → **WhatsApp** → back → submit a service request → switch language (EN⇄AM) → **Logout**. | Every hop works; Amharic renders in the Ethiopic font with no clipping; logout clears session + saved. | BLOCKED |
| A19 | Background / foreground | Background the app mid-flow, return after 30s and after 10min. | State preserved; no crash; session still valid (or silent refresh). | BLOCKED |
| A20 | Android hardware back | Use the system Back button across stack screens, tabs, and sheets. | Pops the expected screen; closes open sheets first; exits from Home root (does not skip screens or trap the user). | BLOCKED |
| A21 | Soft keyboard | Focus phone, OTP, search, and the request description fields. | Keyboard does not cover the active input / submit button; `KeyboardAvoidingView` behaves; return keys act as expected. | BLOCKED |
| A22 | Screen reader (TalkBack) | Enable TalkBack; traverse Home, a provider detail, login, verify. | Every actionable control announces a meaningful label (back, filters, save, Call, WhatsApp, "Sending…", OTP boxes). No unlabeled buttons. | BLOCKED |
| A23 | Font scaling | Set system font size to the largest step. | Text scales without clipping/overlap; CTAs remain tappable; no truncated critical copy. | BLOCKED |
| A24 | Narrow screen (320 dp) | Run on a 320 dp-wide device/emulator (e.g. small phone profile). | Layouts (category grid, provider rows, sticky Call/WhatsApp bar, request form) reflow without horizontal overflow. | BLOCKED |

---

## Section B — iOS compatibility

### B.1 Recorded now

| # | Item | Evidence | Result |
|---|------|----------|--------|
| I1 | TS / lint / export pass for iOS-compatible code | Section 0 CV1–CV3 (executed 2026-07-09) | **PASS** |

### B.2 Device / simulator / EAS (BLOCKED — needs macOS + Xcode / Apple credentials)

| # | Scenario | Steps | Expected | Result |
|---|----------|-------|----------|--------|
| I2 | iOS simulator smoke | On macOS with Xcode: `npm run ios`. Repeat the A18 journey. | Builds & runs on a simulator; journey passes; parity with Android. | BLOCKED |
| I3 | EAS preview build | Create `eas.json` (preview profile), `eas build --profile preview --platform ios` with an Expo account + Apple signing. Install on a real iPhone via TestFlight / dev cert. | Signed build installs and launches; smoke journey passes. | BLOCKED — no `eas.json` / Expo / Apple credentials in this environment |
| I4 | SecureStore fresh-install + Keychain-survivor | Sign in (writes `serrale_customer_tokens` to Keychain). Uninstall the app (iOS Keychain **survives** uninstall). Reinstall and cold-launch. | On first launch the missing AsyncStorage marker (`serrale_install_marker`) triggers a SecureStore purge (`checkInstallation()` in `src/lib/installation.ts`), so the app starts **signed out** — no stale/expired credentials restored from the previous install. | BLOCKED |
| I5 | Call fallback | On a device/simulator with no phone capability, tap **Call**. | Confirmation sheet appears; if no dialer can open, it fails gracefully (toast/no-op), no crash. | BLOCKED |
| I6 | WhatsApp fallback | With WhatsApp **not** installed, tap **WhatsApp**. | Graceful handling (App Store / message), never a crash or dead button. | BLOCKED |
| I7 | Safe areas | Run on a notch / Dynamic Island device and an older home-button device. | Headers, the sticky Call/WhatsApp bar, and scroll content respect top & bottom insets (`edges={['top']}`, `useSafeAreaInsets`); nothing under the notch or home indicator. | BLOCKED |
| I8 | Keyboard (iOS) | Focus the request description and OTP fields. | `KeyboardAvoidingView` `behavior="padding"` lifts content on iOS; submit stays reachable; no jump/flicker. | BLOCKED |
| I9 | Navigation not Android-only | Use the iOS interactive swipe-back gesture across stack screens. | Swipe-back pops screens; no reliance on a hardware back button; transitions correct. | BLOCKED |

---

## Summary

| Bucket | Count |
|--------|------:|
| **Code-verifiable-now — EXECUTED & recorded** (CV1–CV4, satisfies iOS I1) | 4 |
| **Device / emulator / EAS — BLOCKED** (Android A1–A24 = 24, iOS I2–I9 = 8) | 32 |
| **Total checklist items** | 36 |

All four executable gates PASS as of 2026-07-09. The 32 device-only items remain
BLOCKED pending Android hardware/emulator and a macOS + Xcode / EAS + Apple setup;
each carries an exact recipe above and is ready for Task 12 to execute and record.
