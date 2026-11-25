# API Contract

All APIs are under `/api`. Success uses `{ "data": value }`; failure uses `{ "error": { "code": string, "message": string, "details": object|null } }`. Public read routes and authenticated write routes are separate. Every input is validated on the server. Catalogue IDs are UUIDs; prices serialize as decimal strings.

## Catalogue routes
- `GET /api/catalogue/products?q=&category=&limit=&cursor=` — published products only; availability does not filter results.
- `GET /api/catalogue/products/{slug}` — one published product by slug.
- `GET /api/catalogue/categories/{slug}` — category and up to 48 published products.
- `GET /api/catalogue/categories` and `GET /api/catalogue/categories/{slug}` — public categories and associated published products.
- `GET /api/catalogue/offers` — published offers whose start is at or before now and end is after now, with linked published products.
- Admin writes: `POST /api/admin/catalogue/products`, `PATCH|DELETE /api/admin/catalogue/products/{id}`, category and offer CRUD under corresponding plural routes. Each must call Member 2's shared `requireAdmin()` before any mutation; reject unauthorized requests with 401/403.
- Image upload route and bucket policy depend on the agreed Supabase Storage bucket and Member 2's auth client. Do not accept arbitrary remote URLs or image bytes in PostgreSQL.

## Example
`GET /api/catalogue/products?limit=1` → `{ "data": { "items": [{ "id":"uuid", "name":"...", "slug":"...", "price":"12.50", "images":[], "availability":"out_of_stock" }], "nextCursor": null } }`.

**PROVISIONAL:** cursor format, maximum page size, image bucket name, and exact projection are pending team agreement.
