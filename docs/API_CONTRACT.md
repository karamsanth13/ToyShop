# REST API contract

API base path: `/api`. Success responses use `{ "data": ... }`; errors use `{ "error": { "code": "...", "message": "...", "details": ... } }`. Prices serialize as decimal strings. Server input validation uses Zod.

## Public reads

- `GET /api/catalogue/products?q=&category=&flag=&limit=&cursor=&ids=` returns published products, including out-of-stock products.
- `GET /api/catalogue/products/:slug` returns one published product.
- `GET /api/catalogue/categories` and `GET /api/catalogue/categories/:slug` return published categories and products.
- `GET /api/catalogue/offers` returns published offers active at the current server time.
- `GET /api/shop` returns public shop details and social links only.
- `GET /api/health` is the API health endpoint.

## Authentication and protected routes

- `POST /api/auth/login` accepts `{ email, password }`; successful login sets an HttpOnly, SameSite cookie.
- `POST /api/auth/logout` clears the session cookie; `GET /api/auth/me` returns the verified profile.
- `GET|POST|DELETE /api/admins` requires Super Admin. Create accepts `{ fullName, email, password }`; password must be at least 12 characters. Only Admin records can be removed; Super Admin removal is blocked.
- `PATCH /api/admin/shop`, `POST /api/admin/shop/logo`, and `POST|PATCH|DELETE /api/admin/social-links` require Admin or Super Admin.
- `requireAdmin(req,res,next)` allows both roles. `requireSuperAdmin(req,res,next)` allows only Super Admin. `getCurrentUserRole(req)` returns the verified role or null.

## Pending engagement routes

Pre-booking creation and protected pre-booking lists are not enabled until the owner approves consent/privacy copy. Notification collection and delivery are pending a channel/provider decision. No endpoint should imply that notifications are being sent.

Login is rate-limited. Settings writes are origin checked and authenticated. Logo uploads accept JPG, PNG, WebP or AVIF up to 5 MB and store the image in Cloudinary; credentials stay server-side.
