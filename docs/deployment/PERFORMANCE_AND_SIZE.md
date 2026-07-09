# SERRALE Basic — Performance & Build Size (Task 10)

Android-first performance and build-size evidence for the Basic mobile client
(`apps/client-app`). This document owns the asset-optimization work, the
config-verification record, indicative read-latency samples, and the **BLOCKED**
device/AAB measurements handed to T12.

Environment for all measurements below: macOS (Darwin 24.3, arm64), Node v22.20.0,
Expo SDK ~52, branch `feat/serrale-api-client`. Date: 2026-07-09.

---

## 1. Image optimization (highest-value win)

The eight `assets/categories/extended/*.png` photos dominated the bundle: each was a
lossless ~1 MB PNG at 1000 px, rendered into ~90 dp tiles / 58 dp rows (see
`CategoryCard.tsx` — `categoryTile` is `flexBasis: 23%` → 4-col grid; `rowImage` is
58×54). Storing photographs as full-size PNG for a tiny tile was pure waste.

**Method (real conversion — not fabricated):**
No local WebP *encoder* was available (`sips` on this box can *read* WebP but returns
`Can't write format: org.webmproject.webp`; no `cwebp`, ImageMagick, GraphicsMagick,
Pillow, or `sharp`). WebP was produced with the maintained `sharp` prebuilt
(darwin-arm64) via `npx`, resizing to a display-appropriate max dimension. Command
used per file (no repo `node_modules`/`package.json` mutation — npx cache only):

```bash
npx --yes sharp-cli \
  --input  assets/categories/extended/<name>.png \
  --output assets/categories/extended \
  --format webp resize 600 --fit inside --withoutEnlargement -q 80
```

600 px max dimension = ~2.2× the largest realistic tile (≈90 dp × 3× density ≈ 270 px),
so there is generous retina headroom and no visible regression; `resizeMode` is
unchanged. The slug→image mapping in `src/lib/category-images.ts` was preserved — only
the `require()` extensions changed `.png`→`.webp`. Every slug still resolves to the
same photograph.

### Before → after (the 6 referenced extended photos, converted)

| file | before (PNG) | after (WebP 600px/q80) | reduction |
| --- | ---: | ---: | ---: |
| cctv | 1,206,808 | 33,524 | 97.2% |
| phone-computer-repair | 1,181,659 | 43,184 | 96.3% |
| generator-car-mechanics | 1,160,742 | 38,726 | 96.7% |
| moving-delivery | 1,171,194 | 36,208 | 96.9% |
| nurses | 1,134,226 | 29,124 | 97.4% |
| personal-trainer | 1,015,368 | 21,914 | 97.8% |
| **subtotal** | **6,869,997 (6.55 MB)** | **202,680 (198 KB)** | **97.05%** |

### Removed (dead — never `require()`'d anywhere in `src`/`app`)

| file | bytes | action |
| --- | ---: | --- |
| service-collage.png | 1,311,942 | `git rm` (confirmed unreferenced) |
| cctv-alt.png | 1,206,808 | `git rm` (confirmed unreferenced) |
| **subtotal** | **2,518,750 (2.40 MB)** | removed from repo |

Verification of unreferenced status: `grep -rn "extended/" src app` matches only
`category-images.ts`; neither dead file appears there. The 6 originals were removed
with `git rm` once superseded by their `.webp` equivalents.

### Design reference (kept tracked, NOT bundled)

`assets/design-reference/serrale-home-reference.png` (1,248,046 B) is a design
artifact (tracked per AGENTS.md). Confirmed it is **not** `require()`'d anywhere, and
`assetBundlePatterns` is `"assets/*"` (single level — does not match the
`assets/design-reference/` subfolder). Expo only bundles `require()`'d assets plus
`assetBundlePatterns` matches, so this file ships in git for reference but is **not**
included in the app bundle. Left as-is intentionally.

### Net effect

| metric | before | after |
| --- | ---: | ---: |
| `assets/` dir (`du -sh`) | 13 MB | 4.6 MB |
| `assets/categories/extended/` | ~9.4 MB (8 PNGs) | 212 KB (6 WebP) |
| bundled-image repo bytes (6 tiles) | 6.55 MB | 198 KB |
| dead bytes removed | — | 2.40 MB |
| **git-tracked asset reduction** | — | **≈ 8.76 MB removed** |
| largest single bundled image | 1.25 MB PNG | 429 KB (`app-icon-square.png`) / 314 KB (`gardener.webp`) |

**Target met:** no single bundled image exceeds 500 KB. The two largest remaining
(`app-icon-square.png` / `adaptive-icon-square.png`, 429 KB each) are the required
launcher icons; the largest content photo is `gardener.webp` at 314 KB. The existing
`categories/*.webp` (150–314 KB) were left untouched — already WebP, already < 500 KB.

### Web export proof (`npx expo export --platform web`)

Green. Measured `dist` total = **15.63 MB** (`du -sh` = 16 MB) vs the **19 MB** T5
baseline — a ~3.4 MB drop. The web-dist reduction is smaller than the raw asset saving
because `dist` is dominated by the 7.64 MB JS bundle and framework assets; the extended
photo set now contributes ~0.2 MB to it instead of ~6.9 MB.

> Note: WebP at 600 px was chosen for guaranteed availability + zero repo mutation. If
> a stricter/consistent pipeline is wanted later, `cwebp -q 80 -resize 600 0 in.png -o
> out.webp` produces equivalent output; regeneration must keep the same basenames so the
> `require()` paths in `category-images.ts` stay valid.

---

## 2. Config verification checklist (with evidence)

Source: `apps/client-app/app.json`, `apps/client-app/eas.json` (managed workflow — no
`android/`/`ios/` prebuild dirs, no typed `app.config.*`; `app.json` is authoritative).

| Item | Status | Evidence |
| --- | --- | --- |
| Hermes engine | ✅ (default) | No `jsEngine` override in `app.json`; Expo SDK 52 defaults to Hermes on Android **and** iOS. T12 may confirm `hermesEnabled=true` in the EAS-generated `android/gradle.properties`. |
| New Architecture | ✅ | `app.json` → `newArchEnabled: true` (Fabric/TurboModules). |
| ProGuard (release) | ✅ | `expo-build-properties` → `android.enableProguardInReleaseBuilds: true`. |
| Resource shrinking (release) | ✅ | `expo-build-properties` → `android.enableShrinkResourcesInReleaseBuilds: true`. |
| Cleartext traffic off | ✅ | `android.usesCleartextTraffic: false` (T9). |
| Adaptive icon | ✅ | `android.adaptiveIcon.foregroundImage` = `adaptive-icon-square.png` (1024×1024) + `backgroundColor: #075539`. |
| App icon | ✅ | `expo.icon` = `app-icon-square.png` (1024×1024). |
| Splash | ✅ | `expo.splash.image` = `logo.png` (500×246), `resizeMode: contain`, bg `#075539`; `expo-splash-screen` controlled in `app/_layout.tsx`. |
| Android package id | ✅ | `android.package` = `et.serrale.basic`. |
| iOS bundle identifier | ✅ | `ios.bundleIdentifier` = `et.serrale.basic`. |
| App version | ✅ | `expo.version` = `1.0.0`. |
| EAS profiles distinct | ✅ | `eas.json`: `development` (developmentClient, internal) / `preview` (internal, `buildType: apk`, cache, `EX_UPDATES_NATIVE_DEBUG=0`) / `production` (`buildType: app-bundle`). |
| No committed secrets | ✅ | Only non-sensitive env in `eas.json` (`EX_UPDATES_NATIVE_DEBUG`); no keys/tokens/DSNs. |
| No debug code shipping | ✅ | Only `console.*` in shipping code is the single sanctioned sink `src/lib/logger.ts:77`, level-gated on `__DEV__` (`logger.ts:33`) → suppressed in release. No stray `console.log`. |

**Findings / recommendations for T12 (not blockers for a build, but store-submission gaps):**

- `android.versionCode` / `ios.buildNumber` are **not set** in `app.json` (default → 1).
  Set them, or enable EAS remote/auto version management, before each store upload
  (Play rejects duplicate `versionCode`).
- `expo-updates` is a dependency but **no `updates` / `runtimeVersion`** block is
  configured in `app.json` → OTA updates are inert. If OTA is desired, wire
  `updates.url` + `runtimeVersion`; otherwise this is intentional and fine for a pure
  store-binary release.
- iOS parity (bundle id, icons, splash, safe areas, deep-link `scheme: serrale`,
  SecureStore) is configured in shared `app.json` and unchanged by this task.

---

## 3. Actionable performance targets — code-level evidence

These are code facts (cited), not re-measured:

| Target | Status | Evidence |
| --- | --- | --- |
| Search-suggest debounce ~300 ms | ✅ | `src/hooks/useSearchSuggest.ts:7` → `SUGGEST_DEBOUNCE_MS = 300`. |
| Interaction feedback < 100 ms | ✅ | Synchronous `Pressable` press state (no network wait): `src/components/Button.tsx:80`, `src/components/CategoryCard.tsx:22/36/52` (`pressed && styles.pressed`). |
| Responsive shell before network | ✅ | Skeletons render pre-data: `src/components/Skeleton.tsx` used in `app/providers.tsx`, `app/categories/[id].tsx`, `app/bookmarks.tsx` (T6). |
| Non-blocking bootstrap | ✅ | `app/_layout.tsx:47` `SplashScreen.preventAutoHideAsync()`, `:82` `hideAsync()` on font load; session restore is fail-safe (`src/lib/session-manager.ts:223`) and does not block first paint (T2b). |

---

## 4. Live read-latency samples (indicative)

Public GET endpoints only (no OTP / no write endpoints hit). `curl` `time_total`,
n=5 each. **Date:** 2026-07-09 ~09:52 UTC. **Environment:** dev workstation over public
internet → `https://api.serrale.com` (production). This is **indicative** only — not the
release-candidate device network, and n=5 is too small for a robust p95 (see §5).

| Endpoint | samples (s) | median | notes |
| --- | --- | ---: | --- |
| `/api/public-directory/categories` | 32.168, 1.012, 0.936, 1.008, 1.004 | **1.01** | sample 1 = cold-start/first-TLS outlier; warm ≈ 0.94–1.01 s |
| `/api/public-directory/providers?limit=20` | 0.972, 0.495, 1.017, 0.900, 0.907 | **0.91** | range 0.50–1.02 s |
| `/api/public-directory/search/suggest?q=pl` | 0.516, 0.528, 1.476, 0.498, 0.489 | **0.52** | one 1.48 s blip; otherwise ~0.5 s |

All returned HTTP 200. The 32 s first-call figure is a cold serverless / initial TLS
handshake artifact, recorded honestly rather than discarded.

---

## 5. BLOCKED measurements (require EAS / native build / device — owner: user @ T12)

These CANNOT be produced in this environment (no EAS credentials, no native Android
toolchain, no device). **Numbers were NOT fabricated.** Exact recipes:

1. **AAB size + Play download estimate** (target: AAB < 50 MB)
   ```bash
   cd apps/client-app
   eas build -p android --profile production   # produces .aab
   ```
   Record the artifact size from the EAS build page; get the estimated download via
   Play Console → App bundle explorer (or `bundletool build-apks --mode=default` +
   inspect split sizes). Document any documented native-dependency exception if > 50 MB.

2. **Release/profile Android startup + meaningful-Home < 1.5 s**
   ```bash
   eas build -p android --profile preview      # installable APK
   adb install -r <app>.apk
   adb shell am start -W -n et.serrale.basic/.MainActivity   # cold-start TotalTime
   ```
   Measure cold start → first meaningful paint (Home skeleton) on a representative
   mid-range device/emulator (e.g. Pixel 4a / API 33), ≥10 runs, report median. Use
   Perfetto/systrace for the paint marker. This must be a release/profile build, not
   Expo dev mode.

3. **p50/p95 for OTP request, OTP verify, session refresh, service request**
   These are authenticated write flows — deliberately NOT exercised here. On a release
   candidate: capture timings device-side via the app logger/breadcrumbs or a proxy
   (mitmproxy / Charles) over ≥30 samples per endpoint on the release network; record
   status, date, environment, sample size, p50, p95.

4. **Rigorous p50/p95 for categories / providers / suggest** on the release-candidate
   device network (the §4 curl samples are dev-machine, public-internet, n=5 — replace
   with n≥30 on-device for the release record).

---

## 6. Pre-release verification (this task)

Run from `apps/client-app` — all green as of 2026-07-09:

- [x] `npm test` — 37 suites / **327 tests pass** (incl. `category-ontology.test.ts` after the rename)
- [x] `npm run typecheck` — clean
- [x] `npm run lint` — 0 errors / 0 warnings
- [x] `npx expo export --platform web` — succeeds; `dist` = 15.63 MB (vs 19 MB baseline)
