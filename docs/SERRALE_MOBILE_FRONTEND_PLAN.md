# SERRALE Mobile Frontend Plan

## Purpose

This document is the frontend source of truth for the SERRALE mobile project.
It defines build scope, non-negotiable product boundaries, implementation phases,
and the required design authority for future frontend work.

Required design authority:
- `.codex/skills/serrale-design-guidelines/SKILL.md`
- `.codex/skills/serrale-design-guidelines/references/client-home-guideline.md`

## Scope

- Frontend only
- Mobile only
- React Native / Expo Router only
- Client app first
- Provider app later

Out of scope for this track:
- Backend changes
- Database migrations
- Supabase schema changes
- Real payment implementation
- New production API contracts unless already represented by an existing client

## Product Rules

### App experiences

1. Client App
2. Service Provider App

Current priority is the Client App frontend.

### Client app non-negotiables

- Bottom navigation must be exactly:
  - `Home`
  - `Categories`
  - `Post`
  - `Messages`
  - `Profile`
- Do not put `Jobs` or `Proposals` in the Client App bottom navigation.
- Client app must focus on:
  - Finding service providers
  - Browsing categories
  - Posting projects
  - Messaging providers
  - Managing client profile and settings
- Client app must not include:
  - Provider jobs feed
  - Provider proposals
  - Earnings
  - Available-for-work toggle
  - Provider dashboard statistics

### Data and mock rules

- Use existing API clients only when the relevant client already exists and the task
  explicitly requires wiring UI.
- Use mock data for screens without confirmed or reusable endpoints.
- Keep mock data isolated under `apps/client-app/src/data`.

## Design Direction

SERRALE visual style:
- Premium light theme
- White and very light blue surfaces
- Strong SERRALE blue accents
- Dark navy text
- Rounded cards
- Soft shadows
- Clean modern typography
- Warm Ethiopian and community-oriented feel where appropriate
- Highly usable and uncluttered layouts

Implementation rule:
- Use the repo-local skill `.codex/skills/serrale-design-guidelines` before
  building or reviewing UI.
- Prefer shared tokens from `packages/ui/src/theme`.
- Prefer shared components from `packages/ui` and extend them intentionally.

## Build Phases

### Phase 1: Theme/design system foundation

Goal:
- Align shared theme tokens and semantic styling primitives with the SERRALE
  client direction.

Allowed surface area:
- `packages/ui/src/theme/*`
- Shared styling primitives and token exports
- No screen redesigns beyond what is needed to support the theme foundation

Expected reusable components:
- Semantic color tokens
- Updated spacing and radius guidance
- Shadow presets
- Typography hierarchy definitions

Mock/API policy:
- No new backend usage
- No screen-specific mock data yet unless required for theme previews

Verification target:
- Shared theme compiles cleanly
- Tokens reflect premium light SERRALE styling
- No provider-only concepts leak into shared naming

### Phase 2: Shared UI components

Goal:
- Standardize the shared component layer used by client screens.

Allowed surface area:
- `packages/ui/src/components/*`
- Supporting exports in `packages/ui/src/index.ts`

Expected reusable components:
- Buttons
- Inputs
- Cards
- Avatars
- Ratings
- Verified badges
- Bottom tab shell primitives

Mock/API policy:
- No real data required
- Use small local examples only if needed to validate component states

Verification target:
- Shared components follow repo skill guidance
- No emoji or text-glyph placeholders remain in reusable UI primitives when a
  proper icon strategy is available

### Phase 3: Client app navigation shell

Goal:
- Stabilize the Expo Router structure and client tab navigation.

Allowed surface area:
- `apps/client-app/app/_layout.tsx`
- `apps/client-app/app/tabs/*`
- Client navigation helpers and tab bar integration

Expected reusable components:
- `ClientBottomTabBar`
- Client route mapping helpers

Mock/API policy:
- No new backend usage
- Use placeholder routes where later phases are still pending

Verification target:
- Client bottom nav order is exactly:
  - `Home`
  - `Categories`
  - `Post`
  - `Messages`
  - `Profile`
- All tab routes render without broken navigation props

### Phase 4: Client auth UI screens

Goal:
- Bring login and signup into visual and structural alignment with the client
  app direction.

Allowed surface area:
- `apps/client-app/app/auth/login.tsx`
- `apps/client-app/app/auth/signup.tsx`
- Auth-specific presentational helpers

Expected reusable components:
- Auth hero or illustration block
- Form section wrappers
- Secondary auth actions

Mock/API policy:
- Existing auth client may be used
- No new auth backend work
- Google actions may remain clearly labeled placeholders until a confirmed flow exists

Verification target:
- Copy matches product direction
- Layout feels premium and calm
- Client signup does not ask the user to choose provider role

### Phase 5: Role validation UI screen

Goal:
- Make account verification and wrong-app handling clear and role-correct.

Allowed surface area:
- `apps/client-app/app/auth/role-validation.tsx`
- Role-gating hooks or presentational wrappers

Expected reusable components:
- Minimal loading state
- Wrong-app state card or section

Mock/API policy:
- Use existing `/api/me` client only
- Do not add backend role logic

Verification target:
- Loading, wrong-app, and client-pass states are all explicit
- Client app does not silently admit provider users

### Phase 6: Client home screen

Goal:
- Implement the client-first home experience around discovery, trust, and
  project posting.

Allowed surface area:
- `apps/client-app/src/screens/ClientHomeScreen.tsx`
- Existing client home components
- Client home hooks
- Client home mock data if needed

Expected reusable components:
- `ClientHomeHeader`
- `SearchFilterBar`
- `CommunityHeroBanner`
- `ClientCategoryCard`
- `RecommendedProviderCard`
- `ClientProjectCard`
- `PostProjectCTA`
- `ClientBottomTabBar`

Mock/API policy:
- Use mock data for:
  - categories
  - recommended providers
  - recent project
  - notification count
- Keep mock data in `apps/client-app/src/data`
- Existing home API clients may remain optional enhancements, not blockers

Verification target:
- Home order matches the repo skill reference
- Popular Categories contains exactly 4 cards:
  - `Design`
  - `Development`
  - `Home Services`
  - `Marketing`
- No provider dashboard concepts appear

### Phase 7: Categories screen

Goal:
- Build the client category browsing surface.

Allowed surface area:
- `apps/client-app/app/tabs/categories.tsx`
- Category-specific client components
- Category mock data

Expected reusable components:
- Category list or grid sections
- Reusable category cards from earlier phases

Mock/API policy:
- Use existing category client if helpful
- Otherwise use isolated mock data until the UI contract is stable

Verification target:
- Screen supports browsing service categories, not jobs
- Layout matches client visual direction

### Phase 8: Provider list screen

Goal:
- Build the client-facing browse-results view for service providers.

Allowed surface area:
- Client provider listing routes and screens
- Client provider list components
- Provider list mock data

Expected reusable components:
- Provider list rows or cards
- Filter and empty-state UI

Mock/API policy:
- Use mock provider data unless the existing provider listing client is explicitly
  being wired for this screen

Verification target:
- Trust signals are clear
- Content is framed as hiring and discovery, not provider management

### Phase 9: Provider detail screen

Goal:
- Build the client-facing provider profile view.

Allowed surface area:
- Client provider detail route and screen
- Supporting profile sections

Expected reusable components:
- Provider hero/header
- Specialty and rating blocks
- Service list sections
- Call-to-action section

Mock/API policy:
- Use mock detail data unless an existing provider detail client is intentionally wired

Verification target:
- Screen supports viewing and contacting a provider
- Does not inherit provider self-management patterns

### Phase 10: Post project flow

Goal:
- Build the client project-posting entry point and form flow.

Allowed surface area:
- Client post-project routes
- Client project form components
- Local form state and validation

Expected reusable components:
- Project form fields
- Stepper or staged entry layout if needed
- Success or confirmation state

Mock/API policy:
- Existing project creation client may be wired if stable
- Otherwise keep submission local and clearly marked as mock or placeholder

Verification target:
- Flow is client-first and action-oriented
- Language centers on posting a need and getting matched

### Phase 11: Messages placeholder/UI

Goal:
- Build the client messages shell and placeholder states.

Allowed surface area:
- Client messages route and screen
- Conversation list placeholders

Expected reusable components:
- Message list items
- Empty conversation state
- Conversation header shell

Mock/API policy:
- Use mock conversations unless a confirmed messages client is explicitly needed

Verification target:
- Navigation works
- Messaging is framed as client-provider communication

### Phase 12: Client profile/settings screen

Goal:
- Build the client identity and settings surface.

Allowed surface area:
- Client profile route
- Client settings sections and profile UI

Expected reusable components:
- Profile header
- Settings rows
- Sign-out action

Mock/API policy:
- Use mock profile/settings data unless an existing client is already available

Verification target:
- Screen supports managing the client account
- No provider business controls appear

### Phase 13: Polish, empty states, loading states, responsiveness

Goal:
- Tighten the overall client experience and remove rough edges.

Allowed surface area:
- Any client frontend surface already introduced in prior phases
- No new feature scope

Expected reusable components:
- Loading states
- Error states
- Empty states
- Responsive spacing refinements

Mock/API policy:
- Reuse existing mocks and clients from earlier phases
- Do not expand backend scope during polish

Verification target:
- Mobile layouts feel consistent and intentional
- Empty and loading states are covered across the client app
- Visual consistency matches the repo skill

## Current Execution State

- Kickoff docs initialization is the current completed setup step.
- Next executable build phase: `Phase 1: Theme/design system foundation`
