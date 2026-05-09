# SERRALE Mobile Build Audit

## Purpose

This document records the current frontend baseline, known gaps, and the next
approved build target for the SERRALE mobile project.

Required design authority:
- `.codex/skills/serrale-design-guidelines/SKILL.md`
- `.codex/skills/serrale-design-guidelines/references/client-home-guideline.md`

## Current Frontend Baseline

Repo status from inspection:
- Expo Router client app exists under `apps/client-app`
- Client auth screens already exist:
  - `apps/client-app/app/auth/login.tsx`
  - `apps/client-app/app/auth/signup.tsx`
  - `apps/client-app/app/auth/role-validation.tsx`
- Client home route and screen already exist:
  - `apps/client-app/app/tabs/home.tsx`
  - `apps/client-app/src/screens/ClientHomeScreen.tsx`
- Shared UI package exists under `packages/ui`
- Shared API clients exist under `packages/api`
- Provider app directories exist, but provider frontend implementation is
  effectively unbuilt in this repo state

## Confirmed Product Constraints

Client app:
- Must focus on hiring, discovery, project posting, messaging, and profile/settings
- Must not include provider jobs, proposals, earnings, availability, or provider stats
- Must keep bottom navigation exactly:
  - `Home`
  - `Categories`
  - `Post`
  - `Messages`
  - `Profile`

## Current Findings and Risks

### 1. Client components still use emoji or text-glyph stand-ins

Observed in the current client implementation:
- notification icon in `ClientHomeHeader`
- search/filter glyphs in `SearchFilterBar`
- category icons and rating star output in current component code

Risk:
- The UI will read as placeholder-grade instead of premium and production-ready.

### 2. Home hero still uses remote placeholder imagery

Observed in:
- `apps/client-app/src/components/CommunityHeroBanner.tsx`

Risk:
- The client home emotional anchor does not yet reflect the intended SERRALE
  community identity and depends on an external URL instead of a local branded asset.

### 3. Mock data is not isolated in a dedicated client data folder

Observed state:
- Client home currently mixes fetch composition and inline fallback data in hooks.
- No dedicated `apps/client-app/src/data` folder exists yet.

Risk:
- Mock content will spread across screens and hooks, making later cleanup harder.

### 4. Client tab wiring has a structural mismatch

Observed in:
- `apps/client-app/app/tabs/_layout.tsx`
- `apps/client-app/src/components/ClientBottomTabBar.tsx`

Current issue:
- The tabs layout passes an `onSelect` prop into `ClientBottomTabBar`, but the
  component interface currently exposes only `activeKey`.

Risk:
- Navigation shell work is not yet stable and should be corrected before later
  client phases depend on it.

### 5. Several client phases remain missing or placeholder-level

Observed state:
- Categories is present but thin
- Post, Messages, and Profile tab routes are referenced but not implemented to
  the target product level
- Provider list, provider detail, and post-project flow are not yet established
  as complete client experiences

Risk:
- The client app has a partial shell but not a complete end-to-end frontend flow.

### 6. Provider app is intentionally not the current build target

Observed state:
- Provider app folders exist but do not yet represent a parallel finished frontend

Risk:
- Future work could accidentally bleed provider navigation or dashboard concepts
  into client-facing surfaces unless the repo skill remains enforced.

## Phase Status

| Item | Status | Notes |
| --- | --- | --- |
| Docs initialization | Complete | This audit and the frontend plan are now the required kickoff docs. |
| Phase 1: Theme/design system foundation | Next | First executable frontend build phase. |
| Phase 2: Shared UI components | Pending | Depends on Phase 1 token alignment. |
| Phase 3: Client app navigation shell | Pending | Includes client tab stabilization. |
| Phase 4: Client auth UI screens | Pending | Existing auth screens need refinement. |
| Phase 5: Role validation UI screen | Pending | Existing role gate needs product-level polish. |
| Phase 6: Client home screen | Pending | Existing home needs mock-data isolation and polish. |
| Phase 7: Categories screen | Pending | Present but not complete to target. |
| Phase 8: Provider list screen | Pending | Not built to target. |
| Phase 9: Provider detail screen | Pending | Not built to target. |
| Phase 10: Post project flow | Pending | Not built to target. |
| Phase 11: Messages placeholder/UI | Pending | Not built to target. |
| Phase 12: Client profile/settings screen | Pending | Not built to target. |
| Phase 13: Polish, empty states, loading states, responsiveness | Pending | Final frontend pass only after prior phases. |

## Publish Readiness

Current environment blocker:
- `git` tooling is not currently available in this execution environment
- `gh` tooling is not currently available in this execution environment

Impact:
- Docs can be created locally in the repo
- Staging, committing, pushing, and PR creation cannot be completed from this
  session unless git tooling becomes available

## Next Build Target

Next approved frontend task:
- `Phase 1: Theme/design system foundation`

Execution note:
- Future frontend work should read both kickoff docs first, then use the repo
  skill `.codex/skills/serrale-design-guidelines` before implementing UI changes.
