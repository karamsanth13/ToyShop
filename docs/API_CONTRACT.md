# API contract

## Response envelope

Success: `{ "data": <payload> }`

Error: `{ "error": { "code": "...", "message": "...", "details": ... } }`

Use accurate HTTP status codes. Validate all untrusted input server-side with Zod. Error messages must not expose secrets, private records, or whether an account exists where avoidable.

## Route ownership

- Member 1: public catalogue reads and protected catalogue writes.
- Member 2: auth/session/admin management, public shop profile reads and protected settings writes, protected social-link management, public pre-booking create and protected pre-booking reads, notification subscriber flow only after channel approval.
- Shared guards: `requireAdmin()`, `requireSuperAdmin()`, `getCurrentUserRole()` from `src/lib/auth/`. The verified session/profile role is authoritative.

## Implemented Member 2 routes

- `POST /api/auth/login`: JSON `{ "email", "password" }`; returns a generic credential error or `{ "data": { "user": { "id", "email", "role" } } }`. Login attempts are rate limited by hashed client IP.
- `POST /api/auth/logout`: ends the Supabase session.
- `GET /api/shop`: public shop profile and social links.
- `PATCH /api/admin/shop`: Admin/Super Admin shop settings update.
- `POST /api/admin/social-links`, `PATCH/DELETE /api/admin/social-links/{id}`: Admin/Super Admin social link management.
- `GET/POST /api/admins`, `DELETE /api/admins/{id}`: Super Admin-only listing, invitation, and removal. Invitation delivery depends on the configured Supabase email provider.
- `GET /auth/callback`: exchanges a Supabase invite code and returns the invited Admin to the protected dashboard.
- Wishlist IDs and theme choice are device-local and have no API or database table.

All responses follow the shared `{data}` / `{error}` envelope. Some routes return field validation details; credentials and private profile records are never returned to public callers.

## Product integration dependency

Not yet agreed. Member 1 must publish the canonical Product UUID and public product lookup contract including name/slug, availability/out-of-stock/upcoming representation, and deletion behavior. Pre-booking creation and wishlist resolution depend on this. Do not create a duplicate Product schema or production mock. A typed local-only mock is permitted only if clearly isolated and the production path remains disabled.

Pre-booking API and Admin list are not implemented until that contract exists. Notification subscriber endpoints/UI are also not implemented until the channel and consent fields are approved; only a provider-neutral type boundary exists.

## Security

Keep public reads separate from admin writes. Enforce role checks in Route Handlers/server actions and matching database RLS. Public callers may create only validated, rate-limited enabled submissions; they cannot enumerate submissions, subscribers, profiles, or other customers. Do not return public counts. Keep service-role credentials server-only.
