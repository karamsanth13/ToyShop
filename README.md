# Toy Shop showroom

A responsive product showroom for one physical toy shop. Visitors can browse products, save a local wishlist, and use the shop's configured contact details. Purchases happen in person.

## Stack

React + Vite + JavaScript + Tailwind, React Router, Lucide, Axios and React Context; Node + Express REST API; PostgreSQL + Prisma; JWT + bcrypt; Zod; Cloudinary; Helmet, CORS and express-rate-limit.

## Local setup

1. Install Node `24.17.0` and npm `11.12.1`.
2. Run `npm install`.
3. Copy `.env.example` to `.env`; set `DATABASE_URL`, separate random secrets for `JWT_SECRET` and `RATE_LIMIT_SECRET`, and Cloudinary credentials for logo uploads.
4. Create a local PostgreSQL database, then run `npm run db:generate` and `npm run db:migrate`.
5. Start with `npm run dev` (Vite on port 5173, Express on port 3001).
6. Set `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, and `BOOTSTRAP_ADMIN_PASSWORD` (12+ characters) in `.env`, then run `npm run bootstrap:admin` once. Remove those bootstrap values after the account is created. Public signup is disabled.

Build with `npm run build`; serve the compiled client and API with `npm start`. Run `npm run lint` and `npm test` before handing off changes.

## Project layout

- `client/` — Vite app, React routes/components, API client and shared styles.
- `server/` — Express API, middleware, validation and service integrations.
- `prisma/` — shared PostgreSQL schema and migrations.
- `docs/` — product, design, API, database, open-decision and QA contracts.

## Product boundaries

No customer sign-in, cart, checkout, online payment, public counts, or wishlist database. Out-of-stock items remain visible. Notification delivery and pre-booking consent wording require owner approval before those workflows are enabled.
