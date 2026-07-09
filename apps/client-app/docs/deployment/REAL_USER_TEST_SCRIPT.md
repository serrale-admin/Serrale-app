# SERRALE Basic Mobile — Real User Test Script

**Build:** preview APK (internal)  
**Build page:** https://expo.dev/accounts/nati2328/projects/serrale-basic/builds/12e2d978-8ce4-483b-9f91-ee545bda9d57  
**Direct APK:** https://expo.dev/artifacts/eas/rXz-5vnMVMo4rSvJTOAeojzmJWf89Hm-ED5pD3HtMpY.apk

## Before testing

- Use a real Android phone (not emulator).
- Use mobile data or Wi‑Fi (test both if possible).
- Use a real Ethiopian phone number for OTP.
- Do not share OTP codes in group chats.

## Tester info (fill first)

- Tester name:
- Phone model + Android version:
- Network (Wi‑Fi / 4G / 5G):
- Language tested (EN / AM / both):
- Date/time:

## Test flow (mark Pass/Fail)

1. Install APK and open app
2. Home loads categories/providers
3. Open Search/Categories tab
4. Search + suggestions work
5. Open provider detail page
6. Tap **Call** (must open dialer immediately)
7. Tap **WhatsApp** (must open immediately)
8. Go to Request tab
9. OTP request succeeds
10. OTP verify succeeds
11. Submit request-help lead succeeds
12. Kill app, reopen (session restore)
13. Logout works
14. Login again with OTP
15. Switch language EN/AM and repeat one key screen

## Report format (send back)

For each failed step, send:

- Step number
- What you tapped
- Exact error text (screenshot)
- Time it happened
- Whether retry fixed it (yes/no)

## Priority rules

- **P0 (stop release):** OTP fails, request submit fails, Call/WhatsApp blocked
- **P1 (fix before wide rollout):** session not restored, frequent crashes, major Amharic clipping
- **P2 (can defer):** visual polish, minor copy issues
