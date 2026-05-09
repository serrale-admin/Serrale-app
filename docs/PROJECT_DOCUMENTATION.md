# SERRALE Mobile Project Documentation

## 1. Project Overview
**SERRALE** is a premium mobile marketplace platform designed to connect clients with service providers. It focuses on Ethiopian and regional markets, offering a high-quality user experience for hiring, service discovery, and project management.

The project is structured as a **monorepo** to maximize code reuse across multiple mobile applications (Client and Provider) and shared internal packages.

---

## 2. Monorepo Structure
The project uses **pnpm workspaces** to manage dependencies and link internal packages.

### Root Directory
- `apps/`: Main mobile applications (Expo/React Native).
- `packages/`: Shared logic, UI components, and configurations.
- `backend-integration/`: Documentation for backend API contracts.
- `docs/`: Technical audits, frontend plans, and project documentation.
- `scripts/`: Internal utility scripts for development.
- `package.json`: Root configuration, scripts, and workspace definitions.
- `pnpm-workspace.yaml`: Defines the `apps/*` and `packages/*` workspaces.
- `tsconfig.base.json`: Base TypeScript configuration shared by all packages.

---

## 3. Detailed File Structure & Implementation Status

### 📱 Applications (`apps/`)

#### `client-app/` (Active Development)
The primary application for clients to find and hire providers.
- **`app/`**: Expo Router file-based routing.
  - `_layout.tsx`: Root layout with context providers and global navigation.
  - `index.tsx`: Initial entry point / redirection logic.
  - `tabs/`: Bottom navigation tabs.
    - `home.tsx`: Main dashboard for discovery.
    - `categories.tsx`: Browse services by category.
    - `post-project.tsx`: Interface to create new service requests.
    - `messages.tsx`: Chat and communication hub.
    - `profile.tsx`: User settings and account management.
  - `auth/`: Screens for login, signup, and onboarding.
  - `projects/`: Project management and tracking screens.
  - `providers/`: Provider profiles and search results.
- **`src/`**: Application-specific logic.
  - `components/`: App-specific UI elements (e.g., specific headers, custom cards).
  - `hooks/`: Custom hooks for data fetching and app state.
  - `lib/`: Third-party library initializations (e.g., Supabase client).
  - `state/`: Zustand store definitions for local app state.

#### `provider-app/` (Early Development)
The application for service providers.
- *Status*: Initialized with Expo Router; core structure mirrored from `client-app`.
- *Focus*: Future implementation of proposal management, service listings, and earnings dashboard.

---

### 📦 Shared Packages (`packages/`)

#### `@serrale/ui` (Design System)
The "Source of Truth" for the SERRALE visual identity.
- **`src/theme/`**: Design tokens.
  - `colors.ts`: SERRALE Blue (`#2563EB`), Surface (`#FFFFFF`), Text (`#0B1F3A`), etc.
  - `typography.ts`: Font families, sizes, and weights.
  - `spacing.ts`: Standardized padding and margin increments.
  - `radius.ts`: Standardized corner rounding.
- **`src/components/`**: Atomic and molecular UI components.
  - `AppButton.tsx`: Customizable button with primary, secondary, and ghost variants.
  - `AppInput.tsx`: Form inputs with validation styling.
  - `AppCard.tsx`: Standardized container for lists and content.
  - `ProviderCard.tsx`: Complex card for displaying provider profiles, ratings, and skills.
  - `JobCard.tsx` / `ProjectCard.tsx`: Displays for active and past service requests.
  - `Rating.tsx`: Star rating component.
  - `VerifiedBadge.tsx`: Visual indicator for verified users/providers.

#### `@serrale/auth` (Authentication)
Shared authentication logic.
- **`src/supabase.ts`**: Supabase client initialization.
- **`src/session.ts`**: Logic for managing user sessions and tokens.
- **`src/types.ts`**: TypeScript definitions for user profiles and auth states.

#### `@serrale/database` (Data Models)
Centralized types and persistence logic.
- **`src/types.ts`**: Core domain types (Project, Proposal, User, Service, etc.).
- **`src/mapping.ts`**: Helpers for transforming database responses to frontend models.

#### `@serrale/api` (Networking)
- *Status*: Initialized. Planned to contain TanStack React Query hooks and Axios/Fetch interceptors for the SERRALE Backend.

---

## 4. Technology Stack
- **Framework**: Expo (React Native)
- **Language**: TypeScript (Strict Mode)
- **Navigation**: Expo Router (v3+)
- **Styling**: Standard React Native `StyleSheet` with design tokens from `@serrale/ui`.
- **State**: Zustand (Local) & React Query (Server)
- **Backend**: Supabase (Auth/DB) + Custom Node.js/Go Backend API
- **Tooling**: pnpm, ESLint, Prettier

---

## 5. Implementation Roadmap

### Completed / In Progress
- [x] Monorepo boilerplate and package linking.
- [x] SERRALE Design System (Theme & Core Components).
- [x] Client App navigation structure (Tabs & Stacks).
- [/] Shared Auth package (Supabase integration).
- [/] Client App Profile and Settings screens.

### Upcoming Focus
1. **Service Discovery**: Implementing the Category and Search interfaces in `client-app`.
2. **Project Posting**: Connecting the `post-project` flow to the backend.
3. **Provider Dashboard**: Bootstrapping the core experience in `provider-app`.
4. **Real-time Messaging**: Implementing chat using Supabase Realtime or similar.

---

## 6. How to Contribute
1. **Package Logic**: Place reusable logic in `packages/`.
2. **UI Changes**: Modify `@serrale/ui` for global changes; use `apps/*/src/components` for app-specific ones.
3. **Routing**: Add new screens in the `app/` directory of the respective app.
