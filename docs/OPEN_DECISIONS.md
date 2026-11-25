# Open decisions

Statuses below are **OPEN**; recommendations are provisional, not approved requirements. Decision owners should record the approved choice and date here before dependent implementation.

| # | Question | Provisional recommendation | Decision owner | Status / impact |
|---|---|---|---|---|
| 1 | What currency and price display format? | Use the shop's local currency and locale after confirmation. | Shop owner | OPEN; catalogue formatting. |
| 2 | Which new-arrival notification channel/provider? | Decide the channel before collecting contact/token data; keep provider-neutral boundary. | Shop owner + team | OPEN; subscription UI, schema, delivery blocked. |
| 3 | Which pre-booking fields beyond name, phone, product, date; is quantity needed? | Start with only the named fields; add no quantity absent approval. | Shop owner | OPEN; form/schema/privacy. |
| 4 | What admin password recovery method and email provider? | Configure the Supabase email provider for Admin invitations; approve a recovery flow before exposing password recovery. | Super Admin + shop owner | OPEN; invitations are implemented but cannot deliver until email is configured; recovery flow remains blocked. |
| 5 | Does the contact widget's green dot imply reachability or opening hours? | Omit the dot until meaning and opening hours are approved. | Shop owner | OPEN; widget status indicator. |
| 6 | Do Call and WhatsApp share a number; what greeting/product context? | Read separate configured values and use a neutral greeting until confirmed. | Shop owner | OPEN; separate settings and a provisional neutral greeting are implemented. |
| 7 | Who supplies mascot art and final greeting? | Team-created original SVG as a replaceable asset; shop may supply final art/copy. | Shop owner + team | OPEN; original mascot and provisional greeting are in place pending owner review. |
| 8 | Do categories need full CRUD? | Work split says yes; confirm with owner. | Shop owner + Member 1 | OPEN; catalogue admin scope. |
| 9 | Is 500 concurrent visitors a confirmed target, and what is the acceptance profile? | Define traffic mix, duration, environment, and latency/error thresholds before load testing. | Product owner + team | OPEN; no performance claim until measured. |
| 10 | Is consent/privacy wording required for pre-bookings and subscriptions? | Obtain owner-approved wording before collecting data. | Shop owner | OPEN; form copy/schema compliance. |
| 11 | What are the canonical Product UUID, fields, public API, and availability values? | Member 1 supplies schema/API on Day 1; pre-bookings reference that primary key. | Member 1 + Member 2 | OPEN; blocks FK migration and production pre-booking/wishlist integration. |
| 12 | Who owns root layout and final homepage composition? | One integrator composes the two members' sections after shell interfaces are agreed. | Both members | OPEN; prevents conflicting edits. |
| 13 | Are the exact shared runtime/dependency pins accepted? | Node 24.17.0, npm 11.12.1, exact package versions in `package.json`/lockfile. | Both members | PROVISIONALLY PINNED; confirm before feature work. |
| 14 | Is the supplied stack formally approved? | Next.js App Router, strict TypeScript, Tailwind tokens, Supabase, Zod, Route Handlers, `next/image`, Lucide, npm. | Both members | OPEN pending explicit team confirmation; foundation follows this proposal provisionally. |
