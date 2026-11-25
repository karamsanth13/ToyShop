# Database Contract

PostgreSQL UUID keys, snake_case columns, `timestamptz` timestamps, `numeric(10,2)` prices, foreign keys and indexes. Migrations are forward-only and ordered; each member owns distinct files. Enable RLS for every table. Public reads are restricted to published products/categories and active published offers. Catalogue writes are Admin/Super Admin only, enforced both by RLS and server authorization. Never use the service-role key in client code.

## Catalogue migration order
1. `202611250001_catalogue.sql`: categories and products (category FK).
2. `202611250002_offers.sql`: offers and offer_products (FKs to products).

RLS policies currently depend on the auth schema/role claim convention Member 2 owns. The migrations deliberately fail closed for writes and must be reviewed with Member 2 before applying to a shared database. Confirm `auth.jwt()` role claim and policy helper before application. Image binary storage belongs in Supabase Storage, not these tables.
