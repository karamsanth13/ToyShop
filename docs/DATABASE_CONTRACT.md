# Database contract

## Shared rules

- PostgreSQL; UUID primary keys; `created_at`/`updated_at` where appropriate; foreign keys and lookup indexes.
- SQL identifiers use snake_case; TypeScript fields use camelCase.
- Prices use numeric/decimal types, never floating point.
- One canonical generated or maintained database type source; no competing hand-written schemas.
- Enable RLS on private or writable tables. Document each policy and verify both allowed and denied paths.
- Keep Member 1 and Member 2 migrations separate, timestamp ordered, and immutable after application; use forward migrations for changes.

## Ownership and migration order

Member 1 owns Product, Category, and Offer. Member 2 owns profile/role data linked to Supabase Auth, singleton shop details, social links, pre-bookings, and notification subscribers. Wishlist IDs remain on the visitor's device and have no database table.

Current coordinated sequence proposal:
1. `202611250001_member2_auth_shop.sql` (this workspace): Admin profiles/role policies, shop/social tables, public shop logo bucket policies, and login rate limit.
2. Member 1's catalogue migration, including the Product UUID/availability contract.
3. A future Member 2 pre-booking migration that references Member 1's Product UUID; not created yet.
4. A future subscriber migration after channel/contact/consent decisions; not created yet.

Both members must confirm the sequence before applying migrations. Do not apply this migration to production from this workspace.

## RLS policy summary

- `admin_profiles`: authenticated user reads own profile; verified Super Admin can read profiles. No client writes; server service-role operations only.
- `shop_details`: public read; Admin/Super Admin update only.
- `social_links`: public read; Admin/Super Admin insert/update/delete only.
- `login_rate_limits`: RLS enabled; no anon/authenticated grants or policies. Server-only service-role RPC calls manage keyed hashes and failure windows.
- `storage.objects` in `shop-assets`: public reads; Admin/Super Admin can write/delete only within the `logo/` prefix. Bucket restricts file size and image MIME types.

Profile and role mutations through service-role routes still require `requireSuperAdmin()`; RLS cannot protect against a leaked service key, so that key remains server-only.

`src/types/database.ts` is the current canonical TypeScript source for Member 2's migration types. Regenerate or update it when agreed SQL changes land; Member 1 should extend the same shared canonical type after their catalogue schema is merged rather than adding a competing database type.

## Local first Super Admin bootstrap

1. Apply the agreed migrations to a local Supabase project and create the initial Auth user through the local Supabase Auth dashboard/administrative tooling. Public admin signup stays disabled.
2. Put the local project URL, server-only service-role key, and that Auth user's UUID in the ignored `.env.local` file (`SUPABASE_BOOTSTRAP_USER_ID`). Set a random `SUPABASE_RATE_LIMIT_SECRET` with at least 32 characters.
3. Run `node --env-file=.env.local scripts/bootstrap-super-admin.mjs` once. The script refuses to run if a Super Admin profile already exists and never handles a password.
4. Do not run this bootstrap against production from this workspace.

Login throttling allows fewer than five failed attempts in a 15-minute window per hashed client IP and locks the bucket for 15 minutes at five failures. Configure the deployment proxy to overwrite `x-real-ip` or `x-forwarded-for`; this header trust boundary must be verified before deployment. Raw IPs are not stored.

## Integration blocker

The Product table primary key and availability fields/API are not supplied in the current workspace. Member 2 must not create the Product table or pre-booking FK until Member 1 shares the canonical contract. Notification channel and consent/contact fields also remain undecided; do not create a speculative subscriber schema.

## Initial Super Admin

Bootstrap through a documented, server-only operational process using Supabase Auth Admin APIs and an explicitly assigned role. No public signup, plaintext passwords, service-role credentials in client code, or seeded real credentials.
