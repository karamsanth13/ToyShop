# Toy Shop Showroom

Catalogue-first Next.js App Router foundation for one physical toy shop. Purchases happen in store; this v1 has no cart, checkout, payment or customer account.

## Setup

1. Install Node.js `24.12.0` and npm `11.6.x` (see `.nvmrc` and `package.json`).
2. Copy `.env.example` to `.env.local` and fill the Supabase URL and anon key when the project is provisioned. Never use service-role keys in browser code.
3. Run `npm ci`, then `npm run dev`.
4. Apply catalogue migrations only to a development database after Member 2 confirms the shared Product fields, role claim and RLS helper.

Without Supabase configuration, catalogue pages intentionally show empty states; no production fixture data or authentication bypass is provided.

## Scripts

- `npm run dev` — local server
- `npm run lint` — ESLint
- `npm run typecheck` — strict TypeScript check
- `npm test` — unit tests
- `npm run build` — production build

See `docs/` for project, design, API, database and open-decision contracts. Member 2 must integrate the shared auth boundary and Storage configuration before catalogue administration or uploads can be enabled.
