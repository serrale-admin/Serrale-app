# SERRALE Basic — Phone Auth Foundation (2026-07-11)

Phone number is the **primary identity** for SERRALE Basic. Customers and providers are separate account types with separate OTP purposes, JWT scopes, and database tables — but they share one backend (`/api/public-directory/*`).

## Account model

| Role | Table | OTP purposes | Session | Profile name field |
|------|-------|--------------|---------|-------------------|
| **Customer** (hire / request help) | `directory_customers` | `directory_customer_request` | access + refresh (`POST /customers/session`) | `display_name` / `company_name` |
| **Provider** (listed professional) | `directory_providers` | `directory_provider_join`, `directory_provider_login` | provider JWT (`session_token`) | `full_name` |

**Important:** The same E.164 phone may exist in **both** tables (customer + provider). That is allowed today. Auth flows must make the **role** explicit (login chooser on web; separate mobile routes).

## Backend rules (implemented 2026-07-11)

### OTP request pre-checks (`POST /otp/request`)

Before SMS is sent:

- **`directory_provider_join`** → `409 PHONE_ALREADY_REGISTERED` if provider exists
- **`directory_provider_login`** → `404 PROVIDER_NOT_FOUND` if no provider (saves SMS)
- **`directory_customer_request`** → always proceeds (upsert on session exchange)

### OTP response `account` hint (additive)

Success payload now includes:

```json
{
  "challenge_id": "...",
  "expires_at": "...",
  "account": {
    "has_customer": true,
    "has_provider": false,
    "customer_profile_complete": true
  }
}
```

No names in the hint (privacy). Names come from `GET /customers/me` or provider `full_name` after login.

### Customer profile

- Session exchange returns full `customer` row (`CUSTOMER_OWNER_FIELDS`) including `display_name`, `profile_complete`.
- **`GET /customers/me`** is the source of truth for customer display name after login.
- JWT access token carries only `customer_id`, `phone`, `scope` — not the name.

## Mobile app (Phase 1 + 2 — 2026-07-11)

- Removed hardcoded **"SERRALE user"** placeholder.
- After login / refresh / bootstrap: **`GET /customers/me`** via `syncCustomerProfile()`.
- Display name: `display_name` → `company_name` → formatted phone.
- **`/auth/chooser`** — customer vs provider login.
- **`/auth/profile-setup`** — hiring profile form (`PATCH /customers/me`).
- **`/auth/provider-login`** + **`/auth/provider-verify`** — provider OTP login.
- Incomplete profiles redirect to profile-setup after customer verify.
- Profile tab: complete-profile banner (tappable), provider session card.

**Still TODO:**

- Use OTP `account` hint in UI before sending SMS
- Full provider account screen (`GET/PATCH /providers/me`)
- Cross-role UX when same phone is customer + provider

## Basic web (implemented 2026-07-11)

- Provider **Join**: `PHONE_ALREADY_REGISTERED` shows link to `/login/provider` (also blocked at OTP request on backend).
- Provider **Login**: existing `PROVIDER_NOT_FOUND` → register link.

**Still TODO:**

- Unify customer token model (access+refresh vs legacy 30-day `session_token` from `/customers/register`)
- Map `SESSION_REPLAY`, `PROFILE_INCOMPLETE`, `CUSTOMER_NOT_FOUND` in `apiErrors.ts`
- Provider name edit on account page
- Explicit UX when customer joins with existing phone (upsert vs “welcome back”)

## Verification

```bash
# Backend
cd /Users/terusew/Projects/serrale/backend
npm test -- directoryPhoneAccount.service.test.ts

# Mobile
cd /Users/terusew/Projects/SERRALE-Basic-Mobile-App-feat-api/apps/client-app
npm run typecheck
npm run test -- src/lib/__tests__/session-manager.test.ts src/lib/__tests__/customer-profile.test.ts

# Web
cd /Users/terusew/Projects/serrale/frontend/public-directory
npm run typecheck
npm run build
```

## Do not break

- Plus auth namespaces remain separate.
- OTP security unchanged (purpose binding, rate limits, no logged codes).
- Existing customer refresh sessions and provider JWTs keep working.
- Additive API fields only (`account` on OTP request).
