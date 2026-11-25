# Toy Shop Project Contract

## Product purpose

This is a digital showroom for one physical toy shop. Purchases happen in person.
- V1 has no cart, checkout, online payment, customer account, public like/view/save counts, or swipe-to-like interaction.
- Only Admin and Super Admin authenticate. Public visitors can read public shop/catalogue data, submit enabled engagement forms, and store wishlist IDs on their own device.
- Out-of-stock products remain visible and clearly marked. Never invent shop identity/contact data or offline sales data.

## Shared stack

Next.js App Router, strict TypeScript, Tailwind CSS with shared CSS variables, Supabase PostgreSQL/Auth/Storage, Zod, Route Handlers, `next/image`, Lucide, and npm.
- Node.js 24 LTS pinned in `.nvmrc` and `package.json`; dependencies pinned in `package.json` and `package-lock.json`.
- SQL uses snake_case; TypeScript uses camelCase. IDs are UUIDs. Prices use PostgreSQL `numeric(10,2)`, never floating point.
- API responses: success `{ "data": ... }`; error `{ "error": { "code": "...", "message": "...", "details": ... } }`.

## Ownership and integration

- **Member 1**: Product, Category, Offer, catalogue migrations, APIs, public/admin catalogue UI, search, images, and catalogue flags (`is_rare`, `is_new`, `is_recommended`).
- **Member 2**: shared auth/roles (`requireAdmin()`, `requireSuperAdmin()`, `getCurrentUserRole()` in `src/lib/auth/guards.ts`), shop profile/social links, wishlist, pre-bookings, notification subscriber boundary, contact assistant, theme, shop shell, and login/public-write rate limiting.
- Pre-bookings reference the canonical Product UUID (`public.products.id`).
- Root layout (`src/app/layout.tsx`) provides the Member 2 shop shell (`ShopHeader`, `ShopFooter`, `ContactAssistant`, theme initialization), and `src/app/page.tsx` renders the Member 1 showroom sections.
- Each owner maintains separate ordered migrations (`202611250001_member2_auth_shop.sql`, `202611250002_catalogue.sql`, `202611250003_offers.sql`). Applied migrations are immutable; corrections use forward migrations.

## Security and quality

- Public APIs return published catalogue rows and public shop details only. No public admin registration.
- All writes require server-side Admin or Super Admin authorization and matching RLS. Do not trust browser roles; never expose service-role secrets.
- Validate all write payloads server-side with Zod. Rate-limit login and public writes server-side. Never log credentials, tokens, or personal form payloads.
- Keep `.env.example` names-only; no real credentials or production sample data in source control.
- Use semantic accessible UI, visible focus, responsive layouts, reduced-motion support, stable image fallbacks, and loading/error/empty/success states. Do not claim the 500-concurrent-visitor goal without a staging load test.
