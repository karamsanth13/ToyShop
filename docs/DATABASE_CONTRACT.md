# PostgreSQL and Prisma contract

`prisma/schema.prisma` is the canonical schema. SQL identifiers are snake_case; Prisma fields are camelCase. Primary keys are UUIDs except the single-shop row (`shop_details.id = 1`). Prices use `Decimal(10,2)`. Prisma migrations are applied in the order shown in `prisma/migrations/`.

## Models

- `AdminProfile`: verified account identity, bcrypt hash and `ADMIN`/`SUPER_ADMIN` role. No public registration.
- `ShopDetails`: one configurable public shop record; logo URL and Cloudinary public ID are server managed.
- `SocialLink`: configurable shop links.
- `Category`, `Product`, `Offer`, `OfferProduct`: shared Member 1 catalogue entities. Product uses UUID; availability remains visible for both in-stock and out-of-stock products.
- `PreBooking`: schema supports Product UUID, customer name, phone, and created date. Collection APIs/UI remain disabled pending approved consent/privacy wording.
- `LoginRateLimit`: stores only an HMAC of the rate-limit key, hit count, and expiry. The login limiter uses PostgreSQL, so counters are shared across API instances; raw IP addresses are not stored.

## Migration

On an empty local PostgreSQL database, run `npm run db:generate`, then `npm run db:migrate`. Production uses `npm run db:deploy` after a reviewed migration. This initial migration is for an empty database; existing Supabase data/auth accounts need a separately planned export/import and migration baseline before applying it. No migration is applied by this repository change. Do not edit already-applied SQL; add a forward migration.

The API never returns admin password hashes, rate-limit keys, or pre-booking data publicly. This Express architecture does not use Supabase RLS; authorization is enforced by server middleware and database queries.

At deployment, set `TRUST_PROXY_HOPS` to the exact number of trusted reverse proxies in front of Express. Leave it at `0` for direct access; do not trust arbitrary forwarded headers.
