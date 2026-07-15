# SERRALE iOS App Store Release Plan

> **For Hermes:** Use subagent-driven-development skill to execute this plan task-by-task once Apple-side access is available.

**Goal:** Ship the SERRALE Basic Expo app to Apple TestFlight first, then App Store review/production.

**Architecture:** Use the existing Expo/EAS project and keep the current single app config lane in `apps/client-app/app.json`. Build an iOS archive with EAS, submit it to App Store Connect, validate TestFlight distribution, then complete App Store metadata/compliance and submit for review.

**Tech Stack:** Expo SDK 52, EAS Build, EAS Submit, App Store Connect, Apple Developer Program.

---

## Current verified repo state

Verified on 2026-07-10 from this machine:

- Expo account is logged in: `nati2328`
- Account email returned by EAS: `natnaelasnake16@gmail.com`
- Existing EAS project id: `c0bdd64b-34fa-44d2-aef0-a1290ab29a1a`
- iOS bundle identifier in repo: `et.serrale.basic`
- iOS build number in repo: `1`
- App version in repo: `1.0.0`
- `eas.json` has Android build config only in practice; no iOS-specific build profile overrides yet
- No prior iOS builds found via `eas build:list --platform ios`
- No Apple/App Store Connect env vars are configured in this shell:
  - `APPLE_ID`
  - `ASC_APP_ID`
  - `EXPO_APPLE_APP_SPECIFIC_PASSWORD`
  - `EXPO_ASC_API_KEY_PATH`
  - `EXPO_ASC_KEY_ID`
  - `EXPO_ASC_ISSUER_ID`
- No local `.mobileprovision`, `.p8`, or `.p12` artifacts were found in the checked locations

## What is needed from here before iOS can ship

### Apple-side access required
1. **Apple Developer Program membership** on the account that will publish the app
2. **App Store Connect access** with permission to create apps, TestFlight builds, and submit for review
3. One of these auth lanes:
   - **Preferred:** App Store Connect API key (`.p8`) + key id + issuer id
   - **Fallback:** Apple ID login + app-specific password for EAS submit
4. If the app record does not exist yet in App Store Connect:
   - app name: `SERRALE`
   - bundle id: `et.serrale.basic`
   - platform: iOS
   - SKU: choose a stable internal identifier, e.g. `serrale-basic-ios`

### Product/review inputs required
5. iPhone screenshots for required sizes
6. App description, subtitle, keywords, support URL, marketing URL (optional), privacy policy URL
7. App Privacy answers (what data is collected, linked, used for tracking, etc.)
8. Age rating answers
9. Review notes for OTP login so Apple reviewers can access the app without getting blocked
10. A working review phone / OTP path or a reviewer-safe access method

---

## Recommended release strategy

### Phase 1: Unlock Apple credentials and app record

**Objective:** Make this machine able to build and submit iOS artifacts

**Files:**
- Modify: `apps/client-app/app.json` only if Apple-side values force changes
- Modify: `apps/client-app/eas.json` for iOS build/submit profiles if needed
- Create locally only (do not commit): ASC API key file / secret env vars

**Steps:**
1. Confirm Apple Developer membership is active
2. Confirm App Store Connect role has app-management permissions
3. Create or verify the iOS app record in App Store Connect using bundle id `et.serrale.basic`
4. Create an App Store Connect API key with appropriate access
5. Store these locally (not in git):
   - `EXPO_ASC_API_KEY_PATH`
   - `EXPO_ASC_KEY_ID`
   - `EXPO_ASC_ISSUER_ID`
6. If API key is unavailable, prepare fallback envs:
   - `APPLE_ID`
   - `EXPO_APPLE_APP_SPECIFIC_PASSWORD`
   - likely `ASC_APP_ID`

**Verification:**
- `eas whoami` still works
- the app record exists in App Store Connect
- Hermes can see the local `.p8` path or configured submit env vars

---

### Phase 2: Add explicit iOS release config

**Objective:** Make the iOS build lane deterministic instead of relying on Expo defaults

**Files:**
- Modify: `apps/client-app/eas.json`
- Inspect if needed: `apps/client-app/app.json`

**Steps:**
1. Add an explicit iOS `simulator`/`preview` lane only if useful for testing
2. Add an explicit iOS `production` lane in `eas.json`
3. Keep Android config untouched
4. Ensure the production iOS lane builds an App Store archive, not a simulator build

**Suggested shape:**
```json
{
  "build": {
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios": {
        "enterpriseProvisioning": "universal"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {}
    }
  }
}
```

> Exact iOS keys may be trimmed if Expo defaults are sufficient; keep config minimal.

**Verification:**
- `npx --yes eas-cli@latest config --platform ios` if needed
- `npx --yes eas-cli@latest build:list --platform ios --limit 1 --json` still runs cleanly

---

### Phase 3: Build the first iOS archive

**Objective:** Produce the first real iOS release build

**Files:**
- No committed code changes required if config already correct

**Steps:**
1. Decide whether `ios.buildNumber` should stay `1` or be bumped before first upload
2. Run:
```bash
npx --yes eas-cli@latest build --platform ios --profile production --non-interactive
```
3. Wait for the archive to finish
4. Capture:
   - build id
   - artifact URL
   - bundle id
   - build number

**Verification:**
- build status is `finished`
- artifact exists
- no signing/provisioning failures

---

### Phase 4: Submit to TestFlight

**Objective:** Get the iOS build into App Store Connect / TestFlight

**Files:**
- No committed code changes required unless submit config needs a patch

**Steps:**
1. Preferred lane:
```bash
npx --yes eas-cli@latest submit --platform ios --profile production --latest --non-interactive --wait --verbose
```
2. If non-interactive fails, fall back to interactive submit with the configured Apple credentials
3. Capture:
   - submission id
   - App Store Connect result
   - any blocking compliance message

**Verification:**
- build appears in App Store Connect
- build is available in TestFlight processing or ready state

---

### Phase 5: Complete App Store Connect metadata/compliance

**Objective:** Clear the console-side blockers that often appear after the first upload

**Files:**
- No repo file changes unless reviewer access instructions or URLs require code/docs updates

**Steps:**
1. Fill app metadata:
   - subtitle
   - description
   - keywords
   - support URL
   - privacy policy URL
2. Upload iPhone screenshots
3. Complete App Privacy questionnaire
4. Complete age rating questionnaire
5. Set pricing/availability
6. Add review notes for OTP access

**Verification:**
- no missing required metadata on the App Store Connect app page
- no unresolved compliance blockers

---

### Phase 6: External beta or App Review

**Objective:** Choose the fastest safe release lane after TestFlight lands

**Two options:**

#### Option A — TestFlight first (recommended)
- add internal testers
- validate OTP flow, request flow, call/WhatsApp flow, crash-free startup
- then submit for App Review

#### Option B — Direct App Review after upload
- only if confidence is high and all metadata/review access is ready

**Verification:**
- testers can install from TestFlight
- Apple reviewers have clear access instructions

---

## Exact blockers right now

These are the real blockers from this machine today:

1. **No App Store Connect auth configured locally**
2. **No prior iOS build exists**
3. **No evidence yet that the iOS app record exists in App Store Connect**
4. **No iOS screenshots / App Privacy / review notes prepared in this execution lane**
5. **OTP reviewer access path is not yet documented for Apple review**

---

## Fastest path to ship iOS

If the goal is speed, do this in order:

1. Create/confirm the iOS app record in App Store Connect
2. Give Hermes the ASC API key (`.p8`) path + key id + issuer id
3. Run the first iOS production EAS build
4. Submit to TestFlight
5. Fill App Store Connect metadata/compliance
6. Add reviewer notes for OTP
7. Submit for App Review

---

## What I need from you to do it from here

Send/provide these:

1. **App Store Connect API key** (`.p8`) file path on this Mac
2. **Key ID**
3. **Issuer ID**
4. Confirmation whether the iOS app record already exists in App Store Connect for bundle id `et.serrale.basic`
5. If it does not exist, permission for me to guide the exact fields you should create there
6. Later: iPhone screenshots and reviewer-access notes for OTP

---

## Success condition

This task is actually done only when:
- an iOS EAS production build exists
- it is submitted successfully to App Store Connect
- it appears in TestFlight
- required App Store metadata/compliance is complete
- reviewer access for OTP is documented
- the app is submitted for Apple review or ready for that final step
