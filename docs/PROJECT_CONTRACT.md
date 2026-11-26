# Toy Shop Project Contract

## Product purpose

This is a digital showroom for one physical toy shop. Purchases happen in person.
- V1 has no cart, checkout, online payment, customer account, public like/view/save counts, or swipe-to-like interaction.
- Only Admin and Super Admin authenticate. Public visitors can read public shop/catalogue data, submit enabled engagement forms, and store wishlist IDs on their own device.
- Out-of-stock products remain visible and clearly marked. Never invent shop identity/contact data or offline sales data.

## Shared stack

React + Vite, JavaScript ES modules, Tailwind CSS with shared CSS variables, React Router DOM, Lucide, Axios and React Context. The API uses Node + Express REST, PostgreSQL + Prisma, JWT + bcrypt, Zod, Cloudinary, Helmet, CORS, express-rate-limit, and npm.
- Node.js and npm are pinned in `.nvmrc` and `package.json`; `package-lock.json` is the install source of truth.
- SQL uses snake_case and JavaScript uses camelCase. IDs are UUIDs. Prices use PostgreSQL `numeric(10,2)`, never floating point.
- API responses: success `{ "data": ... }`; error `{ "error": { "code": "...", "message": "...", "details": ... } }`.

## Ownership and integration

- **Member 1**: Product, Category, Offer, catalogue migrations, APIs, public/admin catalogue UI, search, images, and catalogue flags (`is_rare`, `is_new`, `is_recommended`).
- **Member 2**: shared auth/roles (`requireAdmin(req,res,next)`, `requireSuperAdmin(req,res,next)`, `getCurrentUserRole(req)` in `server/middleware/auth.js`), shop profile/social links, wishlist, pre-bookings, notification boundary, contact assistant, theme, shop shell, and rate limiting.
- Pre-bookings reference the canonical Product UUID (`public.products.id`).
- `client/src/app.jsx` composes the shared shop shell and catalogue routes. `server/routes/` owns REST route groups.
- Prisma schema and ordered `prisma/migrations/` are the canonical database definition. Applied migrations are immutable; corrections use forward migrations.

## Security and quality

- Public APIs return published catalogue rows and public shop details only. No public admin registration.
- All writes require server-side Admin or Super Admin authorization. Do not trust browser roles; never expose secrets.
- Validate all write payloads server-side with Zod. Rate-limit login and public writes server-side. Never log credentials, tokens, or personal form payloads.
- Keep `.env.example` names-only; no real credentials or production sample data in source control.
- Use semantic accessible UI, visible focus, responsive layouts, reduced-motion support, stable image fallbacks, and loading/error/empty/success states. Do not claim the 500-concurrent-visitor goal without a staging load test.
