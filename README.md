# Toy Shop showroom

A responsive product showroom for one physical toy shop. Visitors can browse products, save a local wishlist, and use the shop's configured contact details. Purchases happen in person.

## Stack

React + Vite + JavaScript + Tailwind, React Router, Lucide, Axios and React Context; Node + Express REST API; PostgreSQL + Prisma; JWT + bcrypt; Zod; Cloudinary; Helmet, CORS and express-rate-limit.

## Local setup

1. Install Node `24.17.0` and npm `11.12.1`, then run `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, `RATE_LIMIT_SECRET`, `DEMO_ADMIN_PASSWORD`, and `DEMO_SUPER_ADMIN_PASSWORD`. Use separate random secrets of at least 32 characters for the server secrets and choose local-only demo account passwords. Add Cloudinary credentials to enable image uploads.
3. Create a PostgreSQL database, then run `npm run db:generate` and `npm run db:migrate` (or `npm run db:deploy` for a database with reviewed migrations).
4. For a disposable local demo database, `npx prisma dev --name toyshop` starts Prisma's local Postgres service. Put its printed connection URL in `DATABASE_URL`; add `&pgbouncer=true&connection_limit=1` to the URL for this local service.
5. Run `npm run db:seed` to insert the demo catalogue and accounts, then `npm run dev` to start Vite at `http://localhost:5173` and Express at port `3001`.

The seed creates local demonstration accounts named `admin1` and `superadmin`, using the passwords configured in the local environment. The seed hashes both passwords with bcrypt. Do not use demo accounts or the demo seed in production. To create a production Super Admin, set `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_NAME`, and a unique `BOOTSTRAP_ADMIN_PASSWORD` of at least 12 characters, then run `npm run bootstrap:admin` once and remove those bootstrap values.

Build with `npm run build`; serve the compiled client and API with `npm start`. Run `npm run lint` and `npm test` for code checks.

## Project layout

- `client/` — Vite app, React routes/components, API client and shared styles.
- `server/` — Express API, middleware, validation and service integrations.
- `prisma/` — shared PostgreSQL schema and migrations.
- `docs/` — product, design, API, database, open-decision and QA contracts.

## Functional scope

Visitors can search and filter the seeded catalogue, view product details and active discounts, keep a browser-local wishlist, submit stock requests and enquiries, subscribe with consent, and use the rule-based shop helper. Admins manage products, categories, offers, pre-bookings, enquiries, subscribers, and shop details. Super Admins also manage Admin accounts and view the activity log. Purchases remain in person; subscriptions are stored but no email is sent until a delivery provider is configured.

## Product boundaries

No customer sign-in, cart, checkout, online payment, public counts, or wishlist database. Out-of-stock items remain visible. Notification delivery and pre-booking consent wording require owner approval before those workflows are enabled.
