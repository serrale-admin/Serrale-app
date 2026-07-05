# Task 3 Report — OTP login and abuse controls

Branch: `task/t3-otp-ux` (based on 8c0fb07) · Commit: `def5b5f` (+ report commit)
Status: **DONE** (live OTP smoke test excluded per instruction — deferred to release gate)

---

## ⚠️ MERGE CALLOUT — http.ts (read first)

`src/lib/http.ts` is being rewritten by a parallel task (request-policy/dedupe/circuit)
that merges BEFORE this branch. Per coordinator instruction the diff here was kept
minimal and **purely additive** — no new imports, no constructor-signature changes,
no behavior changes to existing paths. Four chunks:

1. **`HttpRetryRaw` interface + `HttpError.retryRaw?` field** — an optional,
   assign-after-construct field. `new HttpError(status, message, code)` is unchanged.
2. **`RequestOptions.headers?: Record<string, string>`** — extra request headers.
3. **`...(extraHeaders || {})`** spread into the fetch headers.
4. **429 capture block** in the `!res.ok` branch: copies the raw error-body object and
   the raw `Retry-After` / `RateLimit-Reset` header strings onto `error.retryRaw`.
   NO parsing happens in http.ts — all interpretation lives in `src/lib/otp-retry.ts`
   (`retryInfoFromError`, deliberately duck-typed so it doesn't import http.ts either).

**Re-apply guidance for the merger:** after the parallel rewrite lands, these four
chunks must be re-applied (or their equivalents mapped: "custom headers option" and
"raw 429 retry signals reachable from the thrown error"). A dedicated test file,
`src/lib/__tests__/http-retry-capture.test.ts`, is a tripwire: it drives `http()`
against a mocked fetch and fails if either behavior is lost. If the rewritten client
exposes its own equivalents, adapt `retryInfoFromError` + that test — the screens and
`otp-retry.ts` need no changes.

---

## 1. Backend contract findings (file:line, verified read-only in /Users/terusew/Projects/serrale)

### OTP request — success payload
- `POST /api/public-directory/otp/request` returns `{ challenge_id, expires_at, reused? }`:
  `backend/src/routes/publicDirectory.ts:215` (dispatch type), `:224` (reuse), `:265` (fresh).
- **`expires_at` is the ~5-minute challenge lifetime, NOT a resend gate. No cooldown /
  next-allowed field exists on the success path → CONTRACT GAP.** The client resend
  countdown is therefore seeded from the documented 60s constant
  (`OTP_COOLDOWN_SECONDS`, `backend/src/services/otp.service.ts:23`), exported client-side
  as `DEFAULT_RESEND_COOLDOWN_SECONDS` (`src/lib/otp-retry.ts`).
- Server reuses an active pending challenge instead of re-sending SMS:
  `otp.service.ts:52-54` → surfaced as `reused: true` (`publicDirectory.ts:223-225`).
- Server-side single-flight per phone+purpose: `publicDirectory.ts:111, 216-218, 266-269`.

### 429 shapes on otp/request (all three field shapes exist)
- Envelope: `{ success:false, error:{ code, message, retry_after_seconds?, next_allowed_at? } }` —
  `fail()` helper `publicDirectory.ts:101-109`.
- `OTP_COOLDOWN` → `Retry-After` header + `retry_after_seconds` (no `next_allowed_at`):
  `publicDirectory.ts:226-231`; seconds computed `otp.service.ts:57-64`.
- `OTP_PHONE_RATE_LIMITED` (3/10min, `otp.service.ts:21-22`) → header + `retry_after_seconds`
  + `next_allowed_at`: `publicDirectory.ts:233-239`; calc `otp.service.ts:66-78`.
- `OTP_DAILY_LIMIT` (10/day, `otp.service.ts:24`) → header + both fields:
  `publicDirectory.ts:241-247`; calc `otp.service.ts:80-90`.
- IP limiters (`OTP_IP_RATE_LIMITED` 20/h, `OTP_VERIFY_RATE_LIMITED` 30/15min):
  `backend/src/middleware/rateLimiter.ts:95-108, 112-125` — express-rate-limit with
  `standardHeaders: true` → `RateLimit-Reset` (+ `Retry-After` set by the middleware before
  the custom handler runs); their bodies carry NO retry fields.
- Client precedence implemented: `max(retry_after_seconds, Δnext_allowed_at)` →
  `Retry-After` → `RateLimit-Reset`; HTTP-date `Retry-After` ignored; past timestamps clamp to 0.

### Idempotency — SUPPORTED on otp/request
- `Idempotency-Key` header keyed `purpose:phone:key`, replayed from a 60s TTL cache with
  an `Idempotent-Replay: true` response header: `publicDirectory.ts:121-125` (key),
  `:288-295` (replay), `:299-301` (store). → Client sends one key per user send action
  (`newIdempotencyKey()`, `src/lib/otp-retry.ts`; wired in `src/api/serrale/auth.ts`).

### Verify errors (drive the challenge-consumed-once UX)
- `OTP_INCORRECT` **401** — attempt counted, challenge stays pending: `otp.service.ts:200`
  (MAX_ATTEMPTS=5, `:19`). → user retypes in place.
- Dead-challenge codes → client routes back to re-request:
  `OTP_EXPIRED` 400 (`otp.service.ts:174-177`), `OTP_INVALID_STATUS` 400 (`:164-172`),
  `OTP_MAX_ATTEMPTS` 429 (`:181-184`), `OTP_NOT_FOUND` 404 (`:160-162`).
- Verify success consumes: `markChallengesConsumed` (`publicDirectory.ts:334-335`,
  `otp.service.ts:386-400`); the resulting `verify_token` (15min, `publicDirectory.ts:80`)
  is effectively single-use through the exchange — an exchange failure with
  `INVALID_VERIFY_TOKEN` is not retryable, so the client re-requests cleanly.

## 2. What was built

| File | Change |
|---|---|
| `src/lib/phone.ts` | All formats (09…, 9…, +2519…, 2519…, any separators) → `+2519XXXXXXXX`; `isValidEthiopianPhone` / `phoneValidationError` / single `PHONE_INVALID_MESSAGE`; `displayEthiopianPhone` (national `0912 345 678`); non-string hardening |
| `src/lib/otp-retry.ts` (new) | `parseRetryInfo` (3 shapes, stricter-wins, HTTP-date guard, clamp), `retryInfoFromError` (reads `HttpError.retryRaw`, duck-typed), `formatRetryMessage`, `DEFAULT_RESEND_COOLDOWN_SECONDS=60`, `newIdempotencyKey` |
| `src/lib/safe-route.ts` (new) | `safeNextRoute`: internal paths only; rejects absolute/protocol-relative URLs, schemes (`javascript:`, custom), backslash smuggling → default `/(tabs)/profile` |
| `src/lib/http.ts` | MINIMAL additive (see merge callout) |
| `src/api/serrale/auth.ts` | `requestOtp(phone, purpose, idempotencyKey?)` sends `Idempotency-Key`; shared invalid message |
| `src/api/mock/auth.ts`, `src/hooks/queries.ts`, `src/schemas/auth.ts` | Signature parity / key plumbed through mutation input / schema uses the single message source |
| `app/auth/login.tsx` | Synchronous `useRef` in-flight guard (+`isPending`), one idempotency key per send, 429-specific wait copy (toast + inline), `next` passed through to verify |
| `app/auth/verify.tsx` | 60s countdown; `startResendCooldown` uses `Math.max` (a stricter server 429 overrides, never shortens); dead-challenge codes route to re-request via `goReRequest` (challenge id cleared); `OTP_INCORRECT` keeps challenge for retype; exchange failure (consumed verify token) → clean re-request; `safeNextRoute(params.next)` restoration; generic security-safe copy; national phone display; `verifying`/`resending` ref guards incl. the auto-submit path |

Pending states: both screens already used the Button primitive's `loading` prop (spinner +
press-blocking + `accessibilityState busy/disabled`) — kept and now backed by the ref guards.
Feedback is same-render (well under 100ms). No phone/OTP/token is ever logged (verified: no
console.* added; existing code logs nothing sensitive).

## 3. Test evidence (RED→GREEN)

Baseline before task: 13 suites / 56 tests. After: **18 suites / 122 tests** (+66).

- **Genuine RED→GREEN bug catch:** the double-tap test (5 rapid presses → expect 1 mutation)
  FAILED with 5 calls against an `isPending`-only guard (React Query flips `isPending` on the
  next render, too late for a synchronous burst). Fixed with a synchronous `useRef` guard →
  GREEN. This bug would have shipped without the test.
- `phone.test.ts` (26), `otp-retry.test.ts` (17), `safe-route.test.ts` (16): written first
  against the researched contract, then implemented to green.
- `login.test.tsx` (4): 5-tap dedup → exactly 1 call with normalized phone + `otp_…` key;
  invalid phone blocks network entirely; `next` preserved to verify; 429 shows "wait 42 seconds".
- `verify.test.tsx` (6, fake timers): 60s seed → disabled until 0; 429 with raw
  `retry_after_seconds:300` + `next_allowed_at` bumps countdown to 300s ("wait 5 minutes");
  route restoration to `/(tabs)/request`; `https://evil.com/phish` rejected → default route;
  `OTP_INCORRECT` keeps user on screen with generic copy; `OTP_EXPIRED` routes to login and
  clears the pending challenge id.
- `http-retry-capture.test.ts` (5): merge tripwire — real `http()` against mocked fetch:
  429 body+headers land on `retryRaw` and parse end-to-end; non-429 leaves it undefined;
  `Idempotency-Key` header sent with normalized `+2519…` body; omitted when absent.

## 4. Verification (from apps/client-app, final tree)

- `npx jest` → 18/18 suites, **122/122 pass**, exit 0
- `npm run typecheck` (tsc --noEmit) → 0 errors
- `npx eslint .` (expo lint) → **0 errors / 0 warnings**
- `npx expo export --platform web` → success ("Exported: dist"), exit 0
- `package-lock.json` → zero diff (deps installed with `npm ci`)

## 5. Self-review / notes for the controller

- **http.ts** — see merge callout at top; this is the one coordination point.
- **Contract gap (flagged):** no server resend-cooldown field on request success; countdown
  uses the 60s constant. If ops change `OTP_COOLDOWN_SECONDS`, the first resend attempt gets
  a 429 whose `retry_after_seconds` then overrides the timer — self-correcting, never shorter
  than the server wants. A `cooldown_seconds` field on the success payload would close this.
- **`reused: true` challenges:** server may return an existing active challenge; client
  restarts its 60s timer regardless — conservative (local wait ≥ server's actual gate).
- **Verify-screen copy change:** phone now shown as national `0912 345 678`
  (was `+251 912 345 678`) per the "readable local form" requirement.
- **Excluded by instruction:** the single live OTP smoke test (release gate, user's phone);
  no production API was touched at any point.
- Test teardown note: jest prints a benign worker force-exit warning caused by React Query's
  internal notifyManager timer (verified via --detectOpenHandles: no real leak; exit code 0).
