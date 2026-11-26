# PostgreSQL and Prisma contract

`prisma/schema.prisma` is the canonical schema. SQL identifiers are snake_case; Prisma fields are camelCase. Primary keys are UUIDs except the single-shop row (`shop_details.id = 1`). Prices use `Decimal(10,2)`. Prisma migrations are applied in the order shown in `prisma/migrations/`.

## Models

- `AdminProfile`: unique username, verified account identity, bcrypt hash, active status, last login, and Admin/Super Admin role. No public registration.
- `ShopDetails`: one configurable public shop record; logo URL and Cloudinary public ID are server managed.
- `SocialLink`: configurable shop links.
- `Category`, `Product`, `Offer`, `OfferProduct`: catalogue entities. Product uses UUID and tracks age group, stock quantity, availability, and featured flags; both in-stock and out-of-stock items remain visible.
- `PreBooking`: product UUID, customer contact details, optional message, status, and timestamps. This is a stock enquiry, not an order.
- `Enquiry`: customer contact details, optional product, message, status, and timestamps.
- `NotificationSubscriber`: unique email, consent timestamp, and active/unsubscribed status. Delivery is not configured by the demo app.
- `AdminActivity`: records administrative changes and links to the acting account when it still exists.
- `LoginRateLimit`: stores only an HMAC of the rate-limit key, hit count, and expiry. The login limiter uses PostgreSQL, so counters are shared across API instances; raw IP addresses are not stored.

## Migration

On an empty local PostgreSQL database, run `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed`. Production uses `npm run db:deploy` after a reviewed migration and must not use the demo seed. Do not edit already-applied SQL; add a forward migration.

The API never returns admin password hashes, rate-limit keys, or pre-booking data publicly. This Express architecture does not use Supabase RLS; authorization is enforced by server middleware and database queries.

At deployment, set `TRUST_PROXY_HOPS` to the exact number of trusted reverse proxies in front of Express. Leave it at `0` for direct access; do not trust arbitrary forwarded headers.
