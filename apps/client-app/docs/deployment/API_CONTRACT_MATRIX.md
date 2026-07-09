# SERRALE Basic Mobile — API Contract Matrix (Baseline)

Status: baseline snapshot for Task 1 of the deployment-readiness plan
(`docs/superpowers/plans/2026-07-04-serrale-mobile-deployment-readiness.md`).
Generated: 2026-07-04.

Scope: this document records the **currently deployed** `/api/public-directory/*`
contract as implemented in the web/API repository
(`/Users/terusew/Projects/serrale`, read-only for this task) and how the mobile
client (`apps/client-app`, this repository) currently models it. It does not
change any source code. Mismatches are recorded for later tasks to fix.

A concurrent agent may be adding new customer-session endpoints/refresh code in
the web/API repo while this snapshot was taken. Everything below is sourced
from the **committed, currently-executing** route handlers in
`backend/src/routes/publicDirectory.ts` as read for this task — not from any
in-progress/half-added session work. Where the deployed contract already
includes session-related fields (e.g. `session_token` on `POST /leads/request`,
`GET /customers/me`), that is called out explicitly as **pending consumption**
by Task 2 ("Secure persistent Basic customer sessions"), not as something this
task adds or fixes.

---

## 1. Endpoint matrix

All routes are mounted under `https://api.serrale.com/api/public-directory`.
Route/method/line citations are against
`/Users/terusew/Projects/serrale/backend/src/routes/publicDirectory.ts` (web
repo, read-only). Mobile citations are against this repo,
`apps/client-app/src/api/serrale/*` and `apps/client-app/src/lib/http.ts`.

### GET /public-directory/categories

| Field | Value |
|---|---|
| Backend route | `router.get('/categories', ...)` — `publicDirectory.ts:1037` |
| Request | No params. |
| Response envelope | `{ success: true, data: { counts: Record<string, number> } }` — built at `publicDirectory.ts:1040` via `categoryCounts()` (`directoryProvider.service.ts:334-346`), which is `{ [category_slug]: activeProviderCount }`. |
| Auth | None (public). |
| Mobile client | `getCategories()` — `apps/client-app/src/api/serrale/categories.ts:11-15`. Calls `http<CategoryCountsPayload>('${DIRECTORY}/categories')`, reads `payload.counts`. |
| Mobile timeout | 15000 ms default (`http.ts:77`, no override passed). |
| Mobile retry rule | Global `QueryClient` default: `retry: 1` (one retry on failure), `staleTime: 60_000 ms`, `gcTime: 300_000 ms`, `refetchOnWindowFocus: false` (`apps/client-app/src/lib/queryClient.ts:3-11`). No per-hook override in `useCategories` (`apps/client-app/src/hooks/queries.ts:20-21`). |
| Rate limit | Global only: `apiRateLimiter`, 1000 req / 15 min per IP (`backend/src/middleware/rateLimiter.ts:57-68`), applied to all of `/api/*` in `app.ts:204`. No route-specific limiter. |
| Consuming screens | `app/(tabs)/search.tsx:44` (Categories tab), `app/(tabs)/home.tsx:38` (Home). |
| Live sample (2026-07-04) | `{"success":true,"data":{"counts":{"painters":3,"plumbers":4,"electricians":4,"cleaners":3,"nannies":2,"carpenters":3,"gardeners":1,"home-repair":1,"drivers":1,"car-mechanics":1}}}` |

### GET /public-directory/providers

| Field | Value |
|---|---|
| Backend route | `router.get('/providers', ...)` — `publicDirectory.ts:868` |
| Request query params (read) | `category`, `area`, `q`, `limit`, `offset`, `lat`, `lng`, `radius_km` (`publicDirectory.ts:870-879`, `ListProvidersQuery` in `directoryProvider.service.ts:206-218`). |
| Response envelope | `{ success: true, data: { providers: ProviderRow[], total: number, limit: number, offset: number, nearby: boolean } }` — `directoryProvider.service.ts:315` (geo mode) and `:331` (classic mode). |
| Provider row fields (`PUBLIC_FIELDS`) | `id, full_name, phone, whatsapp, category_slug, area, experience, bio, photo_url, created_at` (+ `distance_km` only in geo/nearby mode) — `directoryProvider.service.ts:56-57`, geo addition at `:311-314`. |
| Auth | None (public). |
| Mobile client | `getProviders()` — `apps/client-app/src/api/serrale/providers.ts:48-60`; also used by `getNearbyProviders()` (`:68-73`) and `getVerifiedProviders()` (`:75-80`). |
| Mobile query params sent | `page`, `page_size`, `category`, `sort`, plus `filterParams()` output: `area`, `available_today`, `verified`, `has_past_work`, `min_rating`, `price_level`, `min_experience` (`providers.ts:31-45, 49-55`). |
| Mobile timeout | 15000 ms default. |
| Mobile retry rule | Global `QueryClient` default: `retry: 1` (`src/lib/queryClient.ts:3-11`); no per-hook override in `useProviders` (`hooks/queries.ts:29-30`), `useNearbyProviders` (`:35-36`), or `useVerifiedProviders` (`:38-39`). |
| Rate limit | Global only (1000/15min/IP). No dedicated limiter on this route. |
| Consuming screens | `app/providers.tsx:46` (Providers/search results), `app/categories/[id].tsx:33` (Category detail), `app/(tabs)/home.tsx:35-36` (nearby + verified rails), `src/components/FilterSheet.tsx:41` (live filter count preview). |
| Live sample (2026-07-04, `?limit=2`) | `{"success":true,"data":{"providers":[{"id":"318d4b90-...","full_name":"Abenezer","phone":"+251985306704","whatsapp":null,"category_slug":"car-mechanics","area":"Yeka","experience":"5","bio":null,"photo_url":"https://...","created_at":"2026-06-19T..."}],"total":23,"limit":2,"offset":0,"nearby":false}}` — confirms no `rating`/`verified`/`portfolio`/`reviews`/`available_today`/`price_level` fields exist on the live row. |

### GET /public-directory/providers/:id

| Field | Value |
|---|---|
| Backend route | `router.get('/providers/:id', ...)` — `publicDirectory.ts:887` |
| Request | Path param `id` (must match `/^[0-9a-f-]{36}$/i`, else `400 INVALID_ID`). |
| Response envelope | `{ success: true, data: { provider: ProviderRow | null } }` — `publicDirectory.ts:893`; `404 PROVIDER_NOT_FOUND` if missing (`:892`). Row shape is the same `PUBLIC_FIELDS` as the list endpoint (`getPublicProviderById`, `directoryProvider.service.ts:149-159`) — **no embedded `portfolio` or `reviews`.** |
| Auth | None (public). |
| Mobile client | `getProvider()` (`providers.ts:62-66`), `getProviderPastWork()` (`:83-87`), `getProviderReviews()` (`:95-100`) — all three call the same endpoint and read `.portfolio`/`.reviews` off the response, which the backend never sends. |
| Mobile timeout | 15000 ms default. |
| Mobile retry rule | Global `QueryClient` default: `retry: 1` (`src/lib/queryClient.ts:3-11`); no per-hook override in `useProvider` (`hooks/queries.ts:32-33`), `useProviderWork` (`:44-45`), or `useProviderReviews` (`:47-48`). |
| Rate limit | Global only (1000/15min/IP). |
| Consuming screens | `app/provider/[id].tsx:21,24,25` (Provider detail — used three times per screen visit, once per hook: `useProvider`, `useProviderWork`, `useProviderReviews`, each issuing its own network call for the same resource). |

### POST /public-directory/providers/:id/contact-events

| Field | Value |
|---|---|
| Backend route | `router.post('/providers/:id/contact-events', contactEventLimiter, ...)` — `publicDirectory.ts:914` |
| Request body | `{ event_type: 'profile_view'|'phone_click'|'whatsapp_click'|'copy_phone', source_platform, source_flow?, search_query?, user_area?, request_id?, session_id? }` (`publicDirectory.ts:904-912`). |
| Response envelope | `{ success: true, data: { recorded: true } }`. |
| Auth | None (public, but rate-limited). |
| Mobile client | **Not called by mobile at all.** Mobile uses `POST /leads/provider` (below) for Call/WhatsApp logging instead — see Mismatches §M-6. |
| Rate limit | `contactEventLimiter`: 60 req/min per IP (`rateLimiter.ts:147-160`), plus global. |
| Consuming screens | None (mobile). The Basic web client calls this from `trackProviderContactEvent()` (`frontend/public-directory/src/services/serralePublicApi.ts:445-469`). |

### GET /public-directory/search/suggest

| Field | Value |
|---|---|
| Backend route | `router.get('/search/suggest', searchSuggestLimiter, ...)` — `publicDirectory.ts:955` |
| Request query | `q` (string). |
| Response envelope | `{ success: true, data: { query: string, normalizedQuery: string, suggestions: SearchSuggestion[] } }` — `publicDirectory.ts:961`. `SearchSuggestion = { type, label, label_am?, slug?, categorySlug?, reason?, providerCount? }` (`publicDirectorySearch.service.ts:167-185`). **`data` is an object, not a bare array.** |
| Auth | None (public). |
| Mobile client | `searchSuggest()` — `apps/client-app/src/api/serrale/search.ts:5-16`. Calls `http<(string|{label,text,name})[]>(...)` and does `(rows || []).map(...)` directly on the unwrapped `data`. |
| Mobile timeout | 15000 ms default. |
| Rate limit | `searchSuggestLimiter`: 60 req/min per IP, plus global. |
| Consuming screens | **None currently.** `searchSuggest` is exported from the API facade (`apps/client-app/src/api/index.ts:23`) but is not imported by any screen or component — confirmed via repo-wide search of `app/` and `src/components/`. It is dead/unwired client code today. |
| Live sample (2026-07-04, `?q=pl`) | `{"success":true,"data":{"query":"pl","normalizedQuery":"pl","suggestions":[{"type":"fallback_request_help","label":"Request help","label_am":"እርዳታ ይጠይቁ","reason":"We could not match your search. Tell us what you need and we will help."}]}}` |

### GET /public-directory/search

| Field | Value |
|---|---|
| Backend route | `router.get('/search', searchSuggestLimiter, ...)` — `publicDirectory.ts:971` |
| Request query | `q`, `area`, `category`, `limit`, `offset`, `lat`, `lng`, `radius_km` (`publicDirectory.ts:973, 990-1003`). |
| Response envelope | `{ success: true, data: { query, normalizedQuery, matchedCategories: {slug,label,label_am,score}[], providers: ProviderRow[], suggestions: SearchSuggestion[], total: number } }` — `publicDirectory.ts:1029`. Provider rows are the same `PUBLIC_FIELDS` shape as `/providers`. |
| Auth | None (public). |
| Mobile client | Reached via `getProviders({ search: '...' })` — `providers.ts:56-58` routes to this path when `query.search` is set, sending `q`, `page`, `page_size`, plus filter params. |
| Mobile retry rule | Global `QueryClient` default: `retry: 1` (`src/lib/queryClient.ts:3-11`); no per-hook override in `useProviders` (`hooks/queries.ts:29-30`), which also serves this route when `query.search` is set. |
| Rate limit | `searchSuggestLimiter` (shared with `/search/suggest`): 60 req/min per IP, plus global. |
| Consuming screens | `app/providers.tsx:46` (free-text search results). |

### POST /public-directory/otp/request

| Field | Value |
|---|---|
| Backend route | `router.post('/otp/request', otpRequestIpLimiter, ...)` — `publicDirectory.ts:273` |
| Request body (zod) | `{ phone: string, purpose: 'directory_provider_join'|'directory_customer_request'|'directory_provider_login'|'directory_provider_phone_change' }` (`publicDirectory.ts:268-271`). |
| Response envelope | Success: `{ success: true, data: { challenge_id: string, expires_at: string, reused?: boolean } }` (`publicDirectory.ts:297`). Failure: `400 INVALID_PHONE` / `400 VALIDATION_ERROR` / `429 OTP_COOLDOWN` / `429 OTP_PHONE_RATE_LIMITED` / `429 OTP_DAILY_LIMIT` / `502 OTP_REQUEST_FAILED`, all via the `fail()` envelope with `error.code`, `error.message`, and for 429s `error.retry_after_seconds` + `error.next_allowed_at` (`publicDirectory.ts:222-242`). |
| Auth | None. |
| Mobile client | `requestOtp()` — `apps/client-app/src/api/serrale/auth.ts:9-17`. Sends `{ phone: normalized, purpose }`, reads `data.challenge_id`/`data.expires_at`/`data.reused`. |
| Mobile timeout | 15000 ms default. |
| Rate limit | Route: `otpRequestIpLimiter`, 20 req/hour per IP (`rateLimiter.ts:95-108`). Layered per-phone limits inside the handler (`otp.service.ts`): 60 s cooldown between requests to the same phone+purpose, max `OTP_PHONE_MAX=3` requests per `OTP_PHONE_WINDOW_MINUTES=10` window, daily cap `OTP_DAILY_CAP_PER_PHONE=10` per phone. Plus the global 1000/15min/IP limiter. |
| Consuming screens | `app/auth/login.tsx:20` (mobile login gate), `app/auth/verify.tsx:21` (resend). |

### POST /public-directory/otp/verify

| Field | Value |
|---|---|
| Backend route | `router.post('/otp/verify', otpVerifyIpLimiter, ...)` — `publicDirectory.ts:319` |
| Request body (zod) | `{ challenge_id: string (uuid), code: string (4-8 chars), phone: string, purpose: DirectoryPurpose }` (`publicDirectory.ts:312-317`). |
| Response envelope | Success: `{ success: true, data: { verified: true, verify_token: string } }` (`publicDirectory.ts:339`). `verify_token` is a JWT with a **15-minute TTL** (`VERIFY_TOKEN_TTL_SECONDS = 15*60`, `publicDirectory.ts:75`), scoped to `directory_verified` and bound to phone+purpose+challenge_id. Failure via `fail()` with backend-chosen status/code (`:342`). |
| Auth | None (this endpoint mints the token). |
| Mobile client | `verifyOtp()` — `apps/client-app/src/api/serrale/auth.ts:20-30`. Rejects with a generic Error if `data.verified`/`data.verify_token` are falsy, otherwise returns `{ verified: true, verifyToken: data.verify_token }`. |
| Mobile timeout | 15000 ms default. |
| Rate limit | `otpVerifyIpLimiter`: 30 req/15min per IP, plus global. |
| Consuming screens | `app/auth/verify.tsx:22`. |
| Token persistence (mobile) | Stored as `verifyToken` in the Zustand store (`apps/client-app/src/store/appStore.ts`, persisted key `serrale-basic-app` per `AGENTS.md` §6) with **no expiry tracking against the 15-minute backend TTL** — see Mismatches §M-7. |

### POST /public-directory/leads/request

| Field | Value |
|---|---|
| Backend route | `router.post('/leads/request', ...)` — `publicDirectory.ts:413` |
| Request body (zod) | `{ verify_token: string, phone: string, serviceNeed: string, serviceCategory: string, location: string, timing: 'emergency'|'today'|'this_week'|'flexible', note?: string }` (`publicDirectory.ts:403-411`). Requires a `verify_token` minted for purpose `directory_customer_request` (`requireVerifyToken`, `:420`). |
| Response envelope | `{ success: true, data: { ok: true, duplicate: boolean, customer: DirectoryCustomerAccount, session_token: string } }` — `publicDirectory.ts:471`. `session_token` is a **30-day** JWT (`CUSTOMER_SESSION_TTL_SECONDS = 30*24*60*60`, `:134`) scoped to `directory_customer_session`, minted unconditionally on every successful call (`issueCustomerSessionToken`, `:470`). This is the currently-deployed shape; **consuming `session_token` into a real mobile login session is the explicit scope of Task 2**, not this task. |
| Auth | Bearer/body `verify_token` (one-time, from `/otp/verify`). |
| Mobile client | `createServiceRequest()` — `apps/client-app/src/api/serrale/requests.ts:21-43`. Sends `{ verify_token, phone, serviceNeed: input.description, serviceCategory: slugFor(...), location: input.area, timing, note }`. Reads the response as `{ id?, status?, created_at? }` and falls back to synthesized values (`'request'`, `'new'`, `new Date().toISOString()`) when those fields are absent — **which they always are**, since the backend never returns `id`/`status`/`created_at` on this route. See Mismatches §M-1. |
| Mobile timeout | 15000 ms default. |
| Rate limit | Global only (1000/15min/IP). No dedicated limiter (unlike `/otp/*`). |
| Consuming screens | `app/(tabs)/request.tsx:29` (Service request form). |

### POST /public-directory/leads/provider

| Field | Value |
|---|---|
| Backend route | `router.post('/leads/provider', ...)` — `publicDirectory.ts:358` |
| Request body (zod) | `{ verify_token: string, fullName: string, phone: string, serviceCategory?, area?, whatsappNumber?, experience?, description? }` (`publicDirectory.ts:347-356`). Requires a `verify_token` minted for purpose `directory_provider_join` (`:365`). |
| Response envelope | `{ success: true, data: { ok: true, duplicate: boolean } }` — `publicDirectory.ts:395`. |
| Auth | Bearer/body `verify_token`. |
| Mobile client | `createProviderLead()` — `apps/client-app/src/api/serrale/requests.ts:49-61`. Sends `{ verify_token, providerId, fullName, phone }` and ignores the response beyond resolving `{ ok: true }`. |
| Mobile timeout | 15000 ms default. |
| Rate limit | Global only (1000/15min/IP). |
| Consuming screens | `src/components/ContactSheets.tsx:20` (fire-and-forget on Call/WhatsApp tap; failures are swallowed via `.catch(() => {})` by design, per `AGENTS.md` §5 — "Call and WhatsApp actions must not be blocked by analytics/lead logging"). |
| Behavioral note | Backend schema requires `verify_token` bound to purpose `directory_provider_join` (a *provider onboarding* OTP purpose), but mobile's Call/WhatsApp flow is a *customer* contacting a provider — it passes whatever `verifyToken` happens to be in the Zustand store (from the customer's `directory_customer_request` OTP verification, if any) or `undefined` if the user never verified. See Mismatches §M-2. |

---

## 2. Endpoints that exist on the backend but mobile does not call

For completeness, per AGENTS.md §4 these are mounted under the same namespace
but are provider-account/internal routes, not part of the mobile customer
surface, so they are out of scope for the mobile contract but listed here so
nothing is missed:

- `GET /public-directory/customers/me` (`publicDirectory.ts:481`) — reads a `directory_customer_session` Bearer session (see Task 2 scope above).
- `POST /public-directory/internal/notify-request` (`:519`) — server-to-server, shared-secret guarded.
- `POST /public-directory/providers/register`, `/providers/login`, `GET/PATCH /providers/me`, `/providers/me/photo`, `/providers/me/national-id`, `/providers/me/phone` (`:635` onward) — provider-account flows; AGENTS.md §7 confirms "Provider-only Manage/onboarding is not part of the current mobile tab set."

---

## 3. Mismatches (mobile types/adapters vs. real backend envelopes)

Severity scale: **Critical** (breaks or silently degrades a core user-facing
feature today), **High** (wrong data shape but currently masked by defensive
code / defaults), **Medium** (dead code, ignored params, no functional bug yet
observed), **Low** (cosmetic / future-proofing).

### M-1 — `createServiceRequest()` reads fields the backend never sends (Critical)

- Backend: `POST /leads/request` returns `{ ok, duplicate, customer, session_token }` (`publicDirectory.ts:471`). No `id`, `status`, or `created_at`.
- Mobile: `apps/client-app/src/api/serrale/requests.ts:23-42` types the response as `{ id?, status?, created_at? }` and synthesizes `id: 'request'`, `status: 'new'`, `createdAt: new Date().toISOString()` when absent. Every live call takes the synthesized branch — the returned `CreatedRequest.id` is always the literal string `"request"`, never a real identifier.
- Impact: any UI/telemetry keyed on the created request's real ID cannot work. The `session_token` the backend already issues here is currently dropped entirely (not read, not stored) — this is the "pending session-exchange" gap `Task 2` will close.

### M-2 — `createProviderLead()` uses the wrong OTP purpose scope (High)

- Backend: `POST /leads/provider` requires `verify_token` minted for purpose `directory_provider_join` (`publicDirectory.ts:365`, `requireVerifyToken`).
- Mobile: `ContactSheets.tsx:20` passes `verifyToken` from `useAppStore` — which is only ever populated by the **customer** flow (`directory_customer_request`, via `app/auth/verify.tsx`). A mobile user who has never submitted a service request (no `directory_customer_request` verify token) will have `verifyToken === undefined`; a user who has one holds a token scoped to the wrong purpose.
- Impact: `requireVerifyToken` will throw `400 VERIFY_PURPOSE_MISMATCH` for verified customers, or `providerLeadSchema.parse` will fail (`verify_token` required, non-empty) for never-verified users, so `POST /leads/provider` fails on effectively every real mobile call today. This is masked because the call is fire-and-forget (`.catch(() => {})`, `ContactSheets.tsx:20`) and never blocks the actual `tel:`/`whatsapp:` action — by design (`AGENTS.md` §5) — so the failure is invisible to the user and to this task's other checks, but the lead is never actually recorded server-side.

### M-3 — Provider trust/rating/portfolio fields do not exist on the backend row (Critical)

- Backend: `PUBLIC_FIELDS = 'id, full_name, phone, whatsapp, category_slug, area, experience, bio, photo_url, created_at'` (`directoryProvider.service.ts:56-57`), confirmed on both `/providers` (list) and `/providers/:id` (detail), and confirmed live in the 2026-07-04 sample response above. Schema (`supabase/migrations/20260611_001_directory_providers.sql:6-32`) has no `rating`, `review_count`, `verified`/`verification_status`, `admin_reviewed`, `available_today`, `has_past_work`, `price_level`, `portfolio`, or `reviews` columns anywhere.
- Mobile: `ApiProvider` (`apps/client-app/src/api/serrale/types.ts:58-93`) declares all of the above as optional fields, and `adaptProvider()` (`apps/client-app/src/api/serrale/adapters.ts:47-74`) defaults every one of them (`api.rating ?? 0`, `api.verified ?? api.is_verified ?? [...].includes(...) ` → always `false`, `api.available_today ?? false`, `adaptPrice(undefined)` → always `'Standard'`, `api.portfolio?.length ?? 0` → always `0`).
- Impact: every provider card and detail screen in live mode currently renders `0.0` rating, `0` reviews, unverified badge, no "available today" tag, "Standard" price tier, and empty "Recent work"/"Reviews" sections — **for every provider, regardless of real-world status** — because these values are structurally unavailable from the API, not just unpopulated for some rows. This is the single largest gap between the current mobile UI (which prominently displays rating stars, verified badges, and past-work/review rails per `AGENTS.md` §8) and what the live backend can supply. `getProviderPastWork()` and `getProviderReviews()` (`providers.ts:83-100`) always resolve to empty arrays live, consistent with `AGENTS.md` §5's note that "Live mode has no global recent-work endpoint" — but the per-provider portfolio/reviews sections have the same limitation, which AGENTS.md does not currently call out.

### M-4 — Provider list filter/sort params are silently ignored server-side (High)

- Backend: `applyListFilters()` (`directoryProvider.service.ts:244-271`) only reads `category`, `area`, `q` from `ListProvidersQuery`. `ListProvidersQuery` (`:206-218`) has no `available_today`, `verified`, `has_past_work`, `min_rating`, `price_level`, `min_experience`, or `sort` field at all — consistent with M-3 (there is no such column to filter/sort on).
- Mobile: `filterParams()` (`apps/client-app/src/api/serrale/providers.ts:31-45`) builds `available_today`, `verified`, `has_past_work`, `min_rating`, `price_level`, `min_experience` query params from the Filters UI state; `getProviders()` (`:48-60`) also sends `sort`. `getVerifiedProviders()` (`:75-80`) sends `verified: true` specifically to try to get only verified providers.
- Impact: the Filter sheet (`FilterSheet.tsx`) and the "Verified providers" home rail apply no actual server-side filtering/sorting today — the backend returns the same `created_at desc`-ordered (or distance-ordered, in geo mode) result regardless of these params, and the client-perceived "filtering" is 100% illusory until the schema/backend catches up to M-3.

### M-5 — Pagination param names do not match (`page`/`page_size` vs. `limit`/`offset`) (High)

- Backend: `GET /providers` and `GET /search` read `limit` and `offset` (`publicDirectory.ts:874-875, 999-1000`; `ListProvidersQuery.limit/offset`).
- Mobile: `getProviders()` sends `page` and `page_size` (`providers.ts:49-51`, `PAGE_SIZE = 20` from `apps/client-app/src/api/shared.ts:3`). Neither `page` nor `page_size` is read by the backend at all.
- Impact: every mobile provider list request is served with the backend's **default** `limit` (`24`, clamped 1-50, `directoryProvider.service.ts:275`) and `offset=0` (`:276`), regardless of what page the mobile UI thinks it is requesting. Client-side "page 2" requests silently re-fetch the same first ~24 rows from `offset 0`, not the next page. `toProviderPage()`'s `hasMore` calculation (`adapters.ts:103-105`) is computed against the mobile's assumed `PAGE_SIZE=20` and the backend's real `total`, so it can report `hasMore: true` while the "next page" request returns identical data forever. Confirmed live: `?limit=2` in the sample above returns exactly 2 rows and echoes `limit:2, offset:0` — the backend clearly keys off `limit`/`offset`, not `page`/`page_size`.

### M-6 — Contact-event analytics endpoint exists but mobile never calls it (Medium)

- Backend: `POST /providers/:id/contact-events` (`publicDirectory.ts:914-950`) is the purpose-built, unauthenticated, rate-limited (60/min) endpoint for recording `phone_click`/`whatsapp_click`/`profile_view` — this is what the Basic web client uses (`serralePublicApi.ts:445-469`, `trackProviderContactEvent`).
- Mobile: `ContactSheets.tsx:20` instead calls `POST /leads/provider` (a `verify_token`-gated, provider-onboarding-purpose endpoint — see M-2) to log Call/WhatsApp taps.
- Impact: mobile Call/WhatsApp taps are not recorded through the contact-event analytics path the backend actually built for this purpose, and (per M-2) are largely failing silently against the endpoint mobile does call instead. Admin-facing contact analytics for the Basic Intelligence Layer likely undercounts mobile-originated contact attempts.

### M-7 — `searchSuggest()` expects a bare array; backend returns an object (Critical, but currently unreachable — see consuming screens)

- Backend: `GET /search/suggest` → `data = { query, normalizedQuery, suggestions: SearchSuggestion[] }` (`publicDirectory.ts:961`), confirmed live in the 2026-07-04 sample above.
- Mobile: `searchSuggest()` (`apps/client-app/src/api/serrale/search.ts:8-15`) types the unwrapped `data` as `(string | {label,text,name})[]` and immediately calls `(rows || []).map(...)` on it.
- Impact: since `data` is a plain object (not an array, and not iterable), `.map` is not a function on it — this call would throw a `TypeError` at runtime the moment it executes against live data. **It has not been observed to break anything today only because no screen currently imports/calls `searchSuggest()`** (confirmed via repo-wide search — see the endpoint's "Consuming screens" entry above). This is a live landmine for whichever future screen wires up search-as-you-type suggestions.

### M-8 — `getNearbyProviders()` never sends GPS coordinates, so "nearby" is really "same area" (Medium)

- Backend: `GET /providers` supports true GPS-nearest-first ranking with `lat`/`lng`/`radius_km`, returning `distance_km` per row and `nearby: true` (`directoryProvider.service.ts:278-317`), backed by the geo columns added in `supabase/migrations/20260702100003_directory_provider_geo.sql`.
- Mobile: `getNearbyProviders(area, limit)` (`providers.ts:68-73`) only ever sends `area` (plus `page`/`page_size`, per M-5) — it never supplies `lat`/`lng`. The mobile app has no location-permission/GPS-read code path feeding this function (not found anywhere in `apps/client-app/src`).
- Impact: the Home screen's "Nearby providers" rail (`app/(tabs)/home.tsx:35,150-169`) is always classic area-filtered, never true-GPS-distance-ranked, despite the backend already supporting it. Not a bug (area fallback is an intentional, documented backend behavior for callers with no GPS), but a real feature gap versus what "Nearby" implies and what the backend can already do.

### M-9 — No wired `X-Serrale-Source: mobile_app` header (Medium — known/intended gap)

- Backend: `resolvePlatform(req, fallback)` (`backend/src/utils/requestContext.ts:22-26`) reads `X-Serrale-Source` to attribute System Log events / lead rows / search events to the correct originating platform (`KNOWN_PLATFORMS = ['web','mobile_app','telegram','admin','n8n','api']`). CORS already allows this header (`backend/src/app.ts:102`).
- Mobile: `apps/client-app/src/lib/http.ts:85-94` builds the fetch `headers` object with only `Accept`, `Content-Type` (conditional), and `Authorization` (conditional) — no `X-Serrale-Source` header is ever set anywhere in the mobile codebase (confirmed via repo-wide search for `X-Serrale-Source`/`x-serrale-source` — zero matches in `apps/client-app`).
- Impact: every mobile-originated request is attributed to the `resolvePlatform` fallback (`'web'` in most call sites, e.g. `publicDirectory.ts:390, 450`), so leads, contact events, and search events created from the mobile app are currently indistinguishable from Basic-web-originated ones in analytics/admin. **This is a known, intended change** per this task's brief — wiring the header is explicitly out of scope for Task 1 and is recorded here as a gap for a later task, not fixed now.

### M-10 — No explicit error/offline UI state on the main data screens (Medium)

- Mobile: `app/(tabs)/home.tsx:45-49` uses `nearby.isLoading`/`verified.isLoading`/`recent.isLoading` to show local mock arrays (`PROV`, `PASTWORK`) **only while the query has never yet succeeded or failed** (React Query's `isLoading`). Once a query fails, `isLoading` becomes `false`, `data` stays `undefined`, and `data ?? []` correctly renders an **empty** rail — not mock data — but no screen anywhere (`home.tsx`, `app/providers.tsx`, `app/categories/[id].tsx`, `app/provider/[id].tsx`) reads `.isError` or branches on it. Confirmed via repo-wide search: `NetworkError`/`HttpError`/`ApiBusinessError`/`isError` handling exists only in the OTP mutation flows (`app/auth/login.tsx`, `app/auth/verify.tsx`), not in any read-only data screen.
- Impact: a failed live `/providers`, `/categories`, or `/providers/:id` request today degrades to the same UI as "zero results" (an empty rail or `EmptyState`/"No providers found" component) rather than a distinct "something went wrong, try again" or "you're offline" state. This satisfies "never silently replace with fake data" (confirmed — no error path renders mock content) but does not satisfy the brief's requirement for "explicit loading, empty, offline, and error states" as four distinct states. `@react-native-community/netinfo` is a declared dependency (`apps/client-app/package.json:18`) but is not imported or used anywhere in the app — no offline detection exists today.

---

## 4. Production configuration confirmation

**Claim: production base resolves to `https://api.serrale.com/api`.**

- `apps/client-app/src/lib/env.ts:7-8`: `API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ?? 'https://api.serrale.com/api'` — the hardcoded fallback is the production URL.
- `apps/client-app/.env:1`: `EXPO_PUBLIC_API_BASE_URL=https://api.serrale.com/api` — the checked-in `.env` also sets it explicitly to the same value.
- No `app.config.ts`/`app.config.js`/`app.json` exists in `apps/client-app` that overrides `EXPO_PUBLIC_API_BASE_URL` (confirmed: `find . -maxdepth 1 -iname "app.config*"` and `-iname "app.json"` return nothing).
- **Confirmed.**

**Claim: mock mode is disabled unless explicitly `"true"`.**

- `apps/client-app/src/lib/env.ts:14-15`: `USE_MOCK = (process.env.EXPO_PUBLIC_USE_MOCK ?? 'false').toLowerCase() !== 'false'` — any value other than the literal string `'false'` (case-insensitive) is treated as mock-on, and an *unset* env var defaults to the string `'false'` first, so mock is off by default. Note this means an accidental typo like `EXPO_PUBLIC_USE_MOCK=1` or `=yes` would also enable mock mode (anything not exactly `'false'` turns it on) — worth tightening to an explicit `=== 'true'` check in a later task, but today's actual checked-in value is unambiguous:
- `apps/client-app/.env:2`: `EXPO_PUBLIC_USE_MOCK=false`.
- `apps/client-app/src/api/index.ts:7-11`: `const impl = USE_MOCK ? mock : real;` — the facade selects the real `./serrale` implementation whenever `USE_MOCK` is false.
- **Confirmed.**

**Claim: production code never silently substitutes fake data for a failed live request.**

- No screen or API module falls back to `src/data/mock` (`CATS`/`PROV`/`PASTWORK`) or `src/api/mock/*` on a request **failure**. The only place mock arrays appear inside a live-mode screen is `app/(tabs)/home.tsx:40,45-49`, gated on `.isLoading` (query in flight, never yet resolved) — not on error. Confirmed by reading `home.tsx` in full and grepping the whole `app/` tree for `CATS|PROV|PASTWORK` usage outside `src/data/mock.ts`/`src/api/mock/*` themselves.
- On a genuine failure (post-loading), `.data` stays `undefined` and every consumer does `x.data ?? []`/`x.data?.length ? x.data : CATS` **only for the loading case**, or `x.data?.items ?? []` (`app/providers.tsx:47`, `app/categories/[id].tsx:34`) which resolves to an empty array either way (loading or error) since `.data` is undefined in both states until first success — meaning provider list screens show an empty result set on error, and home.tsx shows empty rails on error (mock arrays are loading-only there too, since `.isLoading` is `false` once an error lands).
- Caveat recorded in Mismatch M-10: there is no **distinct** error-state UI (banner, retry button, offline indicator) separate from "zero results" — the behavior is "fail closed to empty," not "fail to fake data," which satisfies this specific claim but is weaker UX than the brief's four-state (loading/empty/offline/error) requirement.
- **Confirmed: no fake-data substitution on failure.** Gap recorded separately: no distinct error/offline UI (M-10).

---

## 5. Baseline metrics

All commands run from `apps/client-app` on 2026-07-04. `node_modules` was
already present (no `npm install` was required).

### npm run typecheck

```
> serrale-client-app@1.0.0 typecheck
> tsc --noEmit
```

Exit code: **0**. No type errors.

### npm run lint

```
> serrale-client-app@1.0.0 lint
> expo lint
> npx eslint .
```

Exit code: **0**. No lint errors or warnings printed.

### npx expo export --platform web

Exit code: **0**. Summary output:

```
Web Bundled 11676ms node_modules/expo-router/entry.js (4154 modules)
› Assets (43): [category/provider webp+png images, Inter font weights, expo-router/navigation icons]
› web bundles (1): _expo/static/js/web/entry-<hash>.js (7.56 MB)
› Files (2): index.html (1.17 kB), metadata.json (49 B)
Exported: dist
```

Export bundle size (`du -sh dist` immediately after a clean export):

```
15M    dist
7.2M   dist/_expo/static/js/web/entry-<hash>.js
```

### npm audit --omit=dev

Exit code: 0 (audit reports vulnerabilities but does not fail the command).
Summary (`npm audit --omit=dev --json` → `metadata.vulnerabilities`):

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 17 |
| Moderate | 5 |
| Low | 0 |
| Info | 0 |
| **Total** | **22** |

Dependency counts scanned: `prod: 930, dev: 243, optional: 39, peer: 34, total: 1218`.

All 22 findings trace back to the Expo CLI/tooling dependency chain
(`@xmldom/xmldom`, `postcss`, `tar`/`cacache`, `uuid` — pulled in transitively
via `@expo/cli` → `@expo/config-plugins` → `@expo/plist`/`xcode`/`@expo/rudder-sdk-node`),
not first-party SERRALE code. `npm audit fix --force` would upgrade `expo` to
`57.0.2`, a breaking change, and was **not** run as part of this task (Task 1
is baseline-only; no dependency upgrades were performed).

### Android build size / startup time

Not yet measured — captured in Task 10 ("Android-first performance and build
size" per `docs/superpowers/plans/2026-07-04-serrale-mobile-deployment-readiness.md`).

### Critical API response times (production, public GET endpoints only)

Measured with `curl -s -o /dev/null -w '%{http_code} %{time_total}s'`, 3
samples each, 2026-07-04. No OTP or write endpoints were touched.

**GET /public-directory/categories**

| Run | HTTP | time_total |
|---|---|---|
| 1 | 200 | 23.756 s |
| 2 | 200 | 1.402 s |
| 3 | 200 | 1.170 s |

Run 1's 23.8 s is consistent with a cold serverless/DB-connection-pool start;
runs 2-3 (~1.1-1.4 s) reflect warm latency.

**GET /public-directory/providers?limit=5**

| Run | HTTP | time_total |
|---|---|---|
| 1 | 200 | 1.241 s |
| 2 | 200 | 0.819 s |
| 3 | 200 | 1.123 s |

**GET /public-directory/search/suggest?q=pl**

| Run | HTTP | time_total |
|---|---|---|
| 1 | 200 | 1.173 s |
| 2 | 200 | 1.598 s |
| 3 | 200 | 0.760 s |

All 9 samples returned `200`. Warm-latency range across all three endpoints:
roughly 0.76 s-1.6 s per request. No sample was made against `/otp/*`,
`/leads/*`, or any other write/mutating endpoint, per the task's constraint.

---

## 6. Internal consistency check

- Every endpoint row above cites a `file:line` in the actual route/service code
  read for this task (not README/AGENTS.md prose) — cross-checked against a
  live curl sample for the three endpoints allowed to be hit.
- Every mismatch (§3) traces a specific mobile file:line against a specific
  backend file:line, and states its currently-observed runtime impact.
- The "pending session-exchange" note (customer `session_token` /
  `customers/me`) is stated once in the scope note and referenced (not
  re-derived) from every place it recurs (M-1, endpoint table, §2), and is
  explicitly scoped to Task 2's plan section rather than treated as an M-1 fix
  target for this task.
- Baseline numbers (§5) are pasted from actual command output/curl results
  captured during this session, not estimated.
- No source file was modified as part of this task; this document and its
  parent `docs/deployment/` directory are the only new paths.
