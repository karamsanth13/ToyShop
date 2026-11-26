# REST API contract

API base path: `/api`. Success responses use `{ "data": ... }`; errors use `{ "error": { "code": "...", "message": "...", "details": ... } }`. Prices serialize as decimal strings. Server input validation uses Zod.

## Public reads

- `GET /api/catalogue/products?q=&category=&flag=&availability=&ageGroup=&minPrice=&maxPrice=&sort=&limit=&cursor=&ids=` returns published products, including out-of-stock products. Sort values are `relevance`, `price-asc`, `price-desc`, `newest`, and `name`.
- `GET /api/catalogue/products/:slug` returns one published product.
- `GET /api/catalogue/categories` and `GET /api/catalogue/categories/:slug` return published categories and products.
- `GET /api/catalogue/offers` returns published offers active at the current server time.
- `GET /api/shop` returns public shop details and social links only.
- `GET /api/health` is the API health endpoint.

## Authentication and protected routes

- `POST /api/auth/login` accepts `{ username, password }` (the identity may be a username or email); successful login sets an HttpOnly, SameSite cookie.
- `POST /api/auth/logout` clears the session cookie; `GET /api/auth/me` returns the verified profile.
- `GET|POST|PATCH|DELETE /api/admins/:id` requires Super Admin. Create accepts `{ fullName, username, email?, password }`; password must be at least 8 characters. Delete deactivates an Admin; Super Admin accounts cannot be changed through this route.
- `/api/admin/catalogue/products`, `/categories`, and `/offers` provide authenticated list/create/update/delete operations. Product image upload uses `POST /api/admin/catalogue/products/images`.
- `POST /api/prebookings`, `POST /api/enquiries`, and `POST /api/subscriptions` accept validated, consented public submissions. The matching GET/PATCH management routes require Admin or Super Admin.
- `GET /api/admin/dashboard` returns live summary counts. `GET /api/admin/activity` requires Super Admin.
- `PATCH /api/admin/shop`, `POST /api/admin/shop/logo`, and `POST|PATCH|DELETE /api/admin/social-links` require Admin or Super Admin.
- `requireAdmin(req,res,next)` allows both roles. `requireSuperAdmin(req,res,next)` allows only Super Admin. `getCurrentUserRole(req)` returns the verified role or null.

Public writes and login are rate-limited. Settings writes are origin checked and authenticated. Product and logo uploads accept JPG, PNG, WebP or AVIF up to 5 MB and store images in Cloudinary; credentials stay server-side. Subscriptions store consent and email address but do not send notifications until a delivery provider is configured.
