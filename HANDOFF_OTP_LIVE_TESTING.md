# SERRALE Basic OTP / Live Testing Handoff

## Branch / workspace
- Worktree: `/Users/terusew/projects/SERRALE-Basic-Mobile-App-feat-api`
- Branch: `feat/serrale-api-client`

## Already pushed on branch
- `f94affc` — feat: finish SERRALE API client OTP and request flow wiring
- `3cc4bea` — feat: persist bookmarks and log provider contact leads

## What was tested live in browser
1. Request tab login gate works.
2. Number `0038064841` is rejected by current Ethiopian phone validation.
3. Number `938064841` is accepted and routes to `/auth/verify`.
4. OTP input fields exist (6 boxes).
5. Pressing Verify with no digits shows `Enter the 6-digit code.`
6. `Change number` returns to `/auth/login` after recent patch.

## Root cause of no real OTP yet
The app was running in mock mode by default because no `EXPO_PUBLIC_*` env was loaded.

## Local env written for live testing
File created:
`apps/client-app/.env`

Contents:
```env
EXPO_PUBLIC_API_BASE_URL=https://api.serrale.com/api
EXPO_PUBLIC_USE_MOCK=false
```

## Auth / error-handling fixes applied locally (not yet confirmed pushed)
Touched files include:
- `apps/client-app/app/auth/login.tsx`
- `apps/client-app/app/auth/verify.tsx`
- `apps/client-app/src/hooks/queries.ts`
- `apps/client-app/src/store/appStore.ts`

### Intent of recent fixes
- clear stale pending OTP state on login success
- better login error handling
- better verify error handling
- prevent duplicate verify submit races
- make resend clickable via `requestOtp(...)`
- hide demo autofill outside mock mode
- bounce invalid verify state back to login

## Verification evidence so far
- `npm run typecheck` passed after the recent verify.tsx repair
- `npm run lint` passed before switching to live mode, and once again on the repaired code before the final interrupted restart

## Server/restart notes
- Old expo web process was killed after mock-mode testing.
- A new live-mode server was started, but browser navigation timed out intermittently.
- Raw socket GET to `127.0.0.1:8084` returned `HTTP/1.1 200 OK` with HTML, so the local server was at least partially serving.
- A clean restart using `npx expo start --web --port 8084 --clear` was interrupted before completion.

## Immediate next steps
1. Inspect current diff.
2. Re-run `npm run typecheck && npm run lint`.
3. Restart Expo web cleanly in live mode.
4. Re-test `/auth/login` with `938064841`.
5. Confirm whether the real API path for OTP request succeeds or returns a visible error.
6. If clean, commit + push.

## Important caution
Do not claim SMS delivery happened unless it is actually verified. So far the user reported they received no OTP, and that was consistent with the app still being in mock mode at the time.
