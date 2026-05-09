# SERRALE Mobile Integration Contract

## Backend ownership

Mobile apps call backend APIs for business logic. Supabase is used for auth/session and persistence, while backend enforces:

- Role checks
- Profile completeness rules
- Project posting permissions
- Proposal rules
- Payments
- Notifications
- Matching logic

## Critical endpoint

`GET /api/me` drives role validation and navigation entry for both mobile apps.

## Client app baseline endpoints

- `GET /api/categories`
- `GET /api/providers`
- `GET /api/providers/:providerId`
- `GET /api/providers/recommended`
- `POST /api/projects`
- `GET /api/projects/my`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `DELETE /api/projects/:projectId`
- `GET /api/projects/:projectId/proposals`
- `GET /api/proposals/:proposalId`
- `POST /api/messages/conversations`
- `GET /api/messages/conversations`
- `GET /api/messages/conversations/:conversationId`
- `POST /api/messages/conversations/:conversationId/messages`

## Provider app baseline endpoints

- `GET /api/jobs`
- `GET /api/jobs/recommended`
- `GET /api/jobs/:jobId`
- `POST /api/jobs/:jobId/proposals`
- `GET /api/proposals/my`
- `GET /api/proposals/:proposalId`
- `PATCH /api/proposals/:proposalId`
- `DELETE /api/proposals/:proposalId`
- `GET /api/provider/profile`
- `PATCH /api/provider/profile`
- `GET /api/provider/portfolio`
- `POST /api/provider/portfolio`
- `PATCH /api/provider/portfolio/:itemId`
- `DELETE /api/provider/portfolio/:itemId`
- `GET /api/provider/services`
- `POST /api/provider/services`
- `PATCH /api/provider/services/:serviceId`
- `DELETE /api/provider/services/:serviceId`
- `GET /api/provider/stats`
- `PATCH /api/provider/availability`

## Mobile home aggregation

Preferred high-performance client endpoint:

- `GET /api/mobile/client/home`
