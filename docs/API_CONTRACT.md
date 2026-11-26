# API Contract

## Response envelope

All APIs are under `/api`.
- Success: `{ "data": <payload> }`
- Error: `{ "error": { "code": string, "message": string, "details": object | null } }`

Use accurate HTTP status codes. Validate all untrusted input server-side with Zod. Error messages must not expose secrets, private records, or whether an account exists where avoidable. Catalogue IDs are UUIDs; prices serialize as decimal strings.

## Route ownership

- **Member 1**: public catalogue reads and protected catalogue writes.
- **Member 2**: auth/session/admin management, public shop profile reads and protected settings writes, protected social-link management, public pre-booking create and protected pre-booking reads, notification subscriber flow only after channel approval.
- **Shared guards**: `requireAdmin()`, `requireSuperAdmin()`, `getCurrentUserRole()` from `src/lib/auth/guards.ts`. The verified session/profile role is authoritative.

## Catalogue routes (Member 1)

- `GET /api/catalogue/products?q=&category=&limit=&cursor=` — published products only; availability does not filter results.
- `GET /api/catalogue/products/{slug}` — one published product by slug.
- `GET /api/catalogue/categories` and `GET /api/catalogue/categories/{slug}` — public categories and up to 48 associated published products.
- `GET /api/catalogue/offers` — published offers whose start is at or before now and end is after now, with linked published products.
- Admin writes (pending integration): `POST /api/admin/catalogue/products`, `PATCH|DELETE /api/admin/catalogue/products/{id}`, category and offer CRUD under corresponding plural routes. Each must call `requireAdmin()` before any mutation and reject unauthorized requests with 401/403.
- Image upload route and bucket policy depend on the agreed Supabase Storage bucket. Do not accept arbitrary remote URLs or image bytes in PostgreSQL.

Example:
`GET /api/catalogue/products?limit=1` → `{ "data": { "items": [{ "id":"uuid", "name":"...", "slug":"...", "price":"12.50", "images":[], "availability":"out_of_stock" }], "nextCursor": null } }`.

**PROVISIONAL:** cursor format, maximum page size, image bucket name, and exact projection remain subject to team confirmation.

## Auth, shop & engagement routes (Member 2)

- `POST /api/auth/login`: JSON `{ "email", "password" }`; returns a generic credential error or `{ "data": { "user": { "id", "email", "role" } } }`. Login attempts are rate limited by hashed client IP.
- `POST /api/auth/logout`: ends the Supabase session.
- `GET /api/shop`: public shop profile and social links.
- `PATCH /api/admin/shop`: Admin/Super Admin shop settings update.
- `POST /api/admin/social-links`, `PATCH/DELETE /api/admin/social-links/{id}`: Admin/Super Admin social link management.
- `GET/POST /api/admins`, `PATCH/DELETE /api/admins/{id}`: Super Admin-only listing, invitation, Admin name edits, and reversible activation/deactivation. Invitation delivery depends on the configured Supabase email provider. Super Admin profiles cannot be modified through these routes.
- `GET /auth/callback`: exchanges a Supabase invite code and returns the invited Admin to the protected dashboard.
- Wishlist IDs and theme choice are device-local and have no API or database table.

Pre-booking API/Admin list and notification subscriber endpoints remain unimplemented until the Product integration contract and notification channel/consent decisions are finalized.

## Security

Keep public reads separate from admin writes. Enforce role checks in Route Handlers/server actions and matching database RLS. Public callers may create only validated, rate-limited enabled submissions; they cannot enumerate submissions, subscribers, profiles, or other customers. Do not return public counts. Keep service-role credentials server-only.
