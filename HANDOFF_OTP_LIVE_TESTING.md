# SERRALE Basic OTP / Live Testing Handoff

Last updated: 2026-07-11

## Branch / workspace
- Worktree: `/Users/terusew/Projects/SERRALE-Basic-Mobile-App-feat-api`
- Branch: `feat/serrale-api-client` (may contain user WIP)

## What works now (2026-07-11)

### Customer login (`/auth/login` → `/auth/verify`)
- OTP uses shared **`OtpInput`** (responsive, paste, autofill hints).
- After verify, **`POST /customers/session`** exchanges `verify_token` for access + refresh tokens.
- Tokens persist via **`secure-session.ts`** (SecureStore; **AsyncStorage fallback on web**).
- Profile tab and Request tab use this customer session.

### Provider register (`/provider/join`)
- Form → OTP (`directory_provider_join`) → verify → **`POST /providers/register`**.
- **`session_token`** from register response is persisted via **`provider-session.ts`**.
- **Fix:** challenge id is stored synchronously before OTP auto-submit (was causing silent verify failures).

### Request tab
- Production UI: photo hero, section cards, localized area, OTP-gated submit.

## Local env for live testing

File: `apps/client-app/.env`

**Native device / simulator (production API):**
```env
EXPO_PUBLIC_API_BASE_URL=https://api.serrale.com/api
EXPO_PUBLIC_USE_MOCK=false
```

**Expo web in browser (requires local backend — production blocks CORS):**
```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api
EXPO_PUBLIC_USE_MOCK=false
```

Run `serrale/backend` locally on port 5000 with dev CORS allowing Expo web origins.

## Phone validation reminders
- Ethiopian numbers: `09xxxxxxxx` or `+2519xxxxxxxx` (10 digits after normalizing).
- `0038064841` is rejected (invalid prefix).

## Google Play review path (production backend)
- Phone `0938064841` + reusable review OTP when `GOOGLE_PLAY_REVIEW_ACCESS_ENABLED=true`
  and `X-Serrale-Source: mobile_app` (see deployment report § 2026-07-10).

## Verification commands
From `apps/client-app`:
```bash
npm run typecheck
npm run lint
npm run test -- app/provider/__tests__/join.test.tsx app/auth/__tests__/verify.test.tsx src/components/__tests__/OtpInput.test.tsx src/lib/__tests__/otp-code.test.ts
npx expo export --platform web
```

## Important caution
- Do not claim SMS delivery unless AfroMessage/backend logs confirm it.
- Mock mode (`EXPO_PUBLIC_USE_MOCK=true`) skips real OTP — only use for offline UI work.

## Key files
```text
app/auth/login.tsx / verify.tsx
app/provider/join.tsx
app/(tabs)/request.tsx
src/components/OtpInput.tsx / OtpBox.tsx
src/lib/otp-code.ts
src/lib/secure-session.ts
src/lib/provider-session.ts
```
