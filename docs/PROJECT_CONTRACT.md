# Toy Shop project contract

## Repository baseline (2026-11-25)

The supplied workspace was empty: it contains no Git metadata, application, dependency manifest, migrations, tests, PRD, or prior team decisions. There is therefore no working implementation to preserve and no current branch to report. The two pasted briefs are the only requirements available here.

## Product rules

- This is a digital showroom for one physical toy shop. Purchases happen in person.
- V1 has no cart, checkout, online payment, customer account, public like/view/save counts, or swipe-to-like interaction.
- Only Admin and Super Admin authenticate. Public visitors can read public shop/catalogue data, submit enabled engagement forms, and store wishlist IDs on their own device.
- Out-of-stock products remain visible and clearly marked. Never invent shop identity/contact data or offline sales data.
- Wishlist is device-local; no public engagement counts are shown.

## Proposed shared stack

The briefs propose Next.js App Router, strict TypeScript, Tailwind CSS with shared CSS variables, Supabase PostgreSQL/Auth/Storage, Zod, Route Handlers, `next/image`, Lucide, and npm. This is the common baseline used provisionally for the foundation because no existing app or conflicting decision was present. Both members should explicitly confirm it before feature work. Exact dependency versions are in `package.json` and `package-lock.json`; Node 24.17.0 and npm 11.12.1 are pinned in `.nvmrc` and `package.json`. Major upgrades require team agreement.

## Ownership and integration

- Member 1 owns Product, Category, Offer, catalogue APIs/UI/admin, search, images, and catalogue flags.
- Member 2 owns auth/roles, shop profile/social links, wishlist, pre-bookings, notification subscriber boundary, contact assistant, theme, shop shell, and login/public-write rate limiting.
- Member 2 publishes `requireAdmin()`, `requireSuperAdmin()`, and `getCurrentUserRole()` as the shared server auth interface. Member 1 consumes these guards; neither member creates a separate auth system.
- Shared guard signatures: `requireAdmin(): Promise<AuthenticatedAdmin>` (Admin or Super Admin), `requireSuperAdmin(): Promise<AuthenticatedSuperAdmin>` (Super Admin only), and `getCurrentUserRole(): Promise<AdminRole | null>`. They must derive identity/role from the verified server session and trusted profile record; exact redirect/error behavior is set by the calling page/Route Handler, never by browser-supplied role data. The implementation awaits Supabase SSR/Auth setup.
- Pre-bookings reference the canonical Product UUID. Member 1 must supply the product table, public API, and availability contract before the dependent migration or production workflow is implemented.
- The homepage combines Member 1 catalogue sections and Member 2 shell. Assign one integrator to the homepage and root layout before either edits them.
- Each owner creates separate ordered migrations. Applied migrations are immutable; corrections use forward migrations.

## Structure and conventions

Use the proposed `src/app`, `src/components/{ui,layout}`, `src/features/{catalogue,shop,auth,engagement}`, `src/lib/{supabase,auth,validation}`, `src/types`, `supabase/migrations`, `public`, and `docs` structure. Keep pages thin. SQL uses snake_case; TypeScript uses camelCase. UUID keys, timestamps, foreign keys/indexes, and decimal price storage are standard.

API success is `{ "data": ... }`; errors are `{ "error": { "code": "...", "message": "...", "details": ... } }`. Validate all server inputs with Zod. Use appropriate HTTP status codes. Separate public reads from protected writes; enforce authorization in server code and RLS. Never trust browser-supplied roles or expose service-role keys. Keep `.env.example` names-only.

## Security and quality

No public admin registration. Supabase Auth owns passwords; an initial Super Admin must be bootstrapped through a documented secure server-only procedure. Enable and document RLS for private/writable tables. Rate-limit login and public writes server-side. Never log credentials, tokens, or personal form payloads. Use semantic accessible UI, visible focus, responsive layouts, reduced-motion support, stable image fallbacks, and loading/error/empty/success states. Do not claim the 500-concurrent-visitor goal without a staging load test.

## Migration order

1. `202611250001_member2_auth_shop.sql`: Member 2 auth/profile, shop/social schema, logo bucket and login-rate-limit policies.
2. Member 1 catalogue schema, including the canonical Product table and UUID/availability contract (coordinate next sequence with Member 1).
3. Member 2 pre-booking schema with FK to Member 1 Product, only after the product contract is agreed.
4. Member 2 notification subscriber schema only after channel/contact/consent fields are agreed.

Use timestamp-prefixed filenames and coordinate exact ordering before applying. The Member 2 auth/shop migration exists but no migration has been applied in this workspace.

## Current implementation boundary

The initial foundation and part of Member 2's independent scope now exist: shared contracts, tokenized Next.js/Tailwind starter, root font/layout and shared UI, auth guards/session endpoints, profile/shop/social schema and policies, shop settings APIs/UI, theme, local wishlist ID store, original contact mascot/widget, login throttling, and Super Admin account APIs. Pre-bookings/product resolution and notification subscriptions remain blocked on team decisions/contracts. The migration is un-applied and requires cross-member sequence agreement.
