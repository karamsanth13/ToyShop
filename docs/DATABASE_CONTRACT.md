# Database Contract

## Shared rules

- PostgreSQL; UUID primary keys; `timestamptz` (`created_at`/`updated_at`) where appropriate; foreign keys and lookup indexes.
- SQL identifiers use snake_case; TypeScript fields use camelCase.
- Prices use `numeric(10,2)` / decimal types, never floating point.
- `src/types/database.ts` is the canonical TypeScript source for database types across both members.
- Enable RLS on all tables. Document each policy and verify both allowed and denied paths.
- Keep Member 1 and Member 2 migrations separate, timestamp ordered, and immutable after application; use forward migrations for changes. Never use the service-role key in client code.

## Ownership and migration order

Member 1 owns Product, Category, and Offer. Member 2 owns profile/role data linked to Supabase Auth, singleton shop details, social links, pre-bookings, and notification subscribers. Wishlist IDs remain on the visitor's device and have no database table.

Current migration sequence:
1. `202611250001_member2_auth_shop.sql` (Member 2): Admin profiles/role policies, shop/social tables, public shop logo bucket policies, and login rate limit.
2. `202611250002_catalogue.sql` (Member 1): `categories` and `products` (category FK).
3. `202611250003_offers.sql` (Member 1): `offers` and `offer_products` (FKs to products).
4. Future Member 2 pre-booking migration referencing `public.products(id)` once the product contract is finalized.
5. Future Member 2 subscriber migration after channel/contact/consent decisions.

Catalogue write RLS policies currently fail closed until Member 1's write policies are wired to Member 2's `public.is_admin()` helper in a forward migration. Review and confirm the full sequence before applying to a shared database.

## RLS policy summary

- `admin_profiles`: authenticated user reads own profile; verified Super Admin can read profiles. No client writes; server service-role operations only.
- `shop_details`: public read; Admin/Super Admin update only.
- `social_links`: public read; Admin/Super Admin insert/update/delete only.
- `login_rate_limits`: RLS enabled; no anon/authenticated grants or policies. Server-only service-role RPC calls manage keyed hashes and failure windows.
- `storage.objects` in `shop-assets`: public reads; Admin/Super Admin can write/delete only within the `logo/` prefix. Bucket restricts file size and image MIME types.
- `categories`, `products`, `offers`, `offer_products`: public reads restricted to published categories/products and active published offers; writes currently denied by default pending forward Admin RLS policies.

Profile and role mutations through service-role routes still require `requireSuperAdmin()`; RLS cannot protect against a leaked service key, so that key remains server-only.

## Local first Super Admin bootstrap

1. Apply the agreed migrations to a local Supabase project and create the initial Auth user through the local Supabase Auth dashboard/administrative tooling. Public admin signup stays disabled.
2. Put the local project URL, server-only service-role key, and that Auth user's UUID in the ignored `.env.local` file (`SUPABASE_BOOTSTRAP_USER_ID`). Set a random `SUPABASE_RATE_LIMIT_SECRET` with at least 32 characters.
3. Run `node --env-file=.env.local scripts/bootstrap-super-admin.mjs` once. The script refuses to run if a Super Admin profile already exists and never handles a password.
4. Do not run this bootstrap against production from this workspace.

Login throttling allows fewer than five failed attempts in a 15-minute window per hashed client IP and locks the bucket for 15 minutes at five failures. Configure the deployment proxy to overwrite `x-real-ip` or `x-forwarded-for`; this header trust boundary must be verified before deployment. Raw IPs are not stored.
