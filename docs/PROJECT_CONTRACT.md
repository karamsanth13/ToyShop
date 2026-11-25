# Toy Shop Project Contract

## Product purpose
One physical toy shop uses this site as a digital showroom. Purchases happen in person. Version 1 has no cart, checkout, payment, customer login, public engagement counts, or swipe-to-like interaction. Out-of-stock items remain visible.

## Stack
- Next.js App Router, TypeScript strict mode, Tailwind CSS, Supabase PostgreSQL/Auth/Storage, Zod, Route Handlers, `next/image`, Lucide, npm.
- Node.js 24 LTS, pinned by `.nvmrc` and `engines`; dependencies pinned exactly in `package.json` and `package-lock.json`.
- SQL uses snake_case; TypeScript uses camelCase. IDs are UUIDs. Prices use PostgreSQL `numeric`, never floating point.
- API responses: success `{ "data": ... }`; error `{ "error": { "code": "...", "message": "...", "details": ... } }`.

## Ownership
- Member 1: Product, Category, Offer, catalogue migrations, APIs, public/admin catalogue UI and product image handling.
- Member 2: shared auth/roles, shop settings and layout, social links, wishlist, pre-booking, notifications, contact assistant and theme preference.
- Member 2 owns `requireAdmin()` / `requireSuperAdmin()` and must publish their server interface before catalogue write routes are enabled. The homepage composition owner must be agreed; catalogue sections are reusable and do not own global layout.
- Catalogue schema proposed on 2026-11-25: `products.id` UUID primary key; `name`, unique `slug`, `category_id`, `price numeric(10,2)`, `images text[]`, `description`, `availability` (`in_stock`/`out_of_stock`), `is_published`, `is_rare`, `is_new`, `is_recommended`, `created_at`, `updated_at`; categories have UUID `id`, unique `slug`, `name`, `description`, `sort_order`, timestamps; offers have UUID `id`, `title`, `description`, `starts_at`, `ends_at`, `is_published`, timestamps and `offer_products` links to products. **PROVISIONAL: Member 2 and the owner must confirm fields, visibility and slug usage before integration.**

## Security and operations
- Public APIs return published catalogue rows only. All writes require server-side Admin or Super Admin authorization and matching RLS. Do not trust browser roles; never expose service-role secrets.
- Validate all write payloads server-side with Zod. Use safe error messages and correct HTTP status codes. No real credentials or production sample data in source control.
- Wishlist stays on the visitor's device and has no public count. Recommendations and rare/new flags are owner-managed. Only active offers appear. Do not invent notification delivery or shop details.
- Feature branches only. Never push, merge, rebase, deploy, run production migrations, stage or commit without explicit instruction.

## Foundation state
This workspace was empty and had no Git repository. The foundation is being created on `feature/member-1-catalogue`. No second app or existing code was present. Member 2 is not connected here; auth and storage integrations remain explicit dependencies.
