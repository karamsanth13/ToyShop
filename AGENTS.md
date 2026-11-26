# Toy Shop project rules

## Permanent technology stack

- Frontend: React + Vite, JavaScript (ES6+), Tailwind CSS, React Router DOM, Lucide React, Axios, React Context.
- Backend: Node.js + Express REST API, PostgreSQL + Prisma, JWT + bcrypt, Zod, Cloudinary, Helmet, CORS and express-rate-limit.
- Do not introduce Next.js, TypeScript, MongoDB/Mongoose, Redux, or replacement frameworks/providers without explicit team approval.
- Keep the established `client/`, `server/`, and `prisma/` project structure. Preserve existing behavior and shared product/catalogue contracts.
- Node and npm versions are pinned in `.nvmrc` and `package.json`; preserve `package-lock.json` as the install source of truth.

## Product and ownership rules

- This is a digital showroom for one physical shop. No cart, checkout, online payments, customer accounts, public wishlist/view/pre-booking counts, or swipe-to-like behavior in v1.
- Only Admin and Super Admin authenticate. Never expose public admin registration. Do not trust client-supplied roles.
- Keep out-of-stock products visible and clearly labelled. Wishlist IDs remain in local storage; do not add a wishlist table.
- `Product`, `Category`, and `Offer` are shared catalogue entities. Pre-bookings reference the canonical Product UUID; never create a competing Product model.
- Do not claim to send notifications until a channel and provider are approved and configured. Do not invent shop details or customer consent wording.

## Architecture and security

- Use JavaScript modules and readable, small components/routes. Validate server inputs with Zod and return `{ data }` or `{ error: { code, message, details? } }`.
- `requireAdmin(req,res,next)` authorizes either admin role; `requireSuperAdmin(req,res,next)` authorizes only Super Admin. Role comes from the verified JWT subject and database record.
- Protect all writes on the server. Rate-limit login and public writes. Keep secrets server-only and commit only names in `.env.example`.
- Store prices as PostgreSQL Decimal. Use UUID primary keys, timestamps, foreign keys and indexed lookup fields.
- Use shared CSS variables/design tokens, accessible semantic UI, responsive layouts, visible focus, stable async states and reduced-motion support.
- Do not stage, commit, push, merge, deploy or run production database commands unless the human explicitly requests that operation.
