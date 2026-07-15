# SERRALE Basic Mobile - Cursor Handoff

Quick handoff file for starting a new Cursor session in this repo.

## Current focus

- Continue SERRALE Basic mobile production-readiness work.
- Keep scope on Basic mobile + shared backend `https://api.serrale.com/api`.
- Do not expand Plus legacy features; treat Plus issues as maintenance unless
  they impact Basic runtime.

## Read first

1. `AGENTS.md` (this repo, canonical mobile rules)
2. `CLAUDE.md` (pointer)
3. `/Users/terusew/Projects/serrale/AGENTS.md`
4. `/Users/terusew/Projects/serrale/docs/SYSTEM_STATE_CURRENT.md`
5. `/Users/terusew/Projects/serrale/docs/PUBLIC_DIRECTORY_INTEGRATION.md`

## Key deployment/UAT docs

- `apps/client-app/docs/deployment/DEPLOYMENT_READINESS_REPORT.md`
- `apps/client-app/docs/deployment/TEST_EVIDENCE.md`
- `apps/client-app/docs/deployment/RELEASE_CHECKLIST.md`
- `apps/client-app/docs/deployment/REAL_USER_TEST_SCRIPT.md`

## Latest session (2026-07-11)

Completed in the most recent session — see `AGENTS.md` § Session continuity 2026-07-11:

- Request tab production redesign (photo hero, section cards, result cards)
- Home / Categories / Provider Join photo banner slides
- Shared responsive `OtpInput` + provider join + verify reliability fixes
- Provider `session_token` persistence (`provider-session.ts`)
- Web customer session fallback (`secure-session.ts` → AsyncStorage on web)
- Amharic register crash hardening

## Latest APK build for testers

- EAS build id: `12e2d978-8ce4-483b-9f91-ee545bda9d57`
- Build page:
  `https://expo.dev/accounts/nati2328/projects/serrale-basic/builds/12e2d978-8ce4-483b-9f91-ee545bda9d57`
- Direct APK:
  `https://expo.dev/artifacts/eas/rXz-5vnMVMo4rSvJTOAeojzmJWf89Hm-ED5pD3HtMpY.apk`

## Important guardrails

- Mobile must use `EXPO_PUBLIC_API_BASE_URL=https://api.serrale.com/api` for device/simulator production testing.
- Expo **web** dev against production API fails CORS — use `http://127.0.0.1:5000/api` + local backend instead.
- Mock mode must stay off unless explicitly set true.
- Never import Supabase directly in mobile app code.
- Call/WhatsApp must never be blocked by analytics/contact-event logging.
- Keep Basic and Plus auth/session/data boundaries isolated.
