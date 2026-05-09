# SERRALE Mobile Monorepo

SERRALE mobile is organized as two Expo apps with shared packages:

- `apps/client-app`
- `apps/provider-app`
- `packages/ui`
- `packages/api`
- `packages/auth`
- `packages/database`
- `packages/utils`
- `packages/config`

## Quick Start

1. Install dependencies: `pnpm install`
2. Copy envs from `.env.example`
3. Start client app: `pnpm client`
4. Start provider app: `pnpm provider`

## Architecture

Mobile apps call SERRALE backend APIs; backend owns business rules and uses Supabase as persistence/auth infrastructure:

`Mobile App -> SERRALE Backend API -> Supabase`
