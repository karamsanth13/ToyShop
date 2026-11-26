# Open Decisions

Statuses below are **OPEN** unless explicitly changed; recommendations are provisional, not approved requirements.

| # | Question | Provisional recommendation | Decision owner | Status / impact |
|---|---|---|---|---|
| 1 | What currency and price display format? | Set explicit ISO currency and locale from shop settings. | Shop owner + both members | OPEN; catalogue formatting; numeric DB values remain currency-neutral. |
| 2 | Which new-arrival notification channel/provider? | Decide the channel before collecting contact/token data; keep provider-neutral boundary. | Shop owner + Member 2 | OPEN; subscription UI, schema, delivery blocked. |
| 3 | Which pre-booking fields beyond name, phone, product, date; is quantity needed? | Keep only name, phone, product, and date until approved. | Shop owner + Member 2 | OPEN; form/schema/privacy. |
| 4 | What admin password recovery method and email provider? | Select a provider and recovery process before implementing delivery. Current local account creation uses Super Admin-set initial passwords. | Super Admin + shop owner | OPEN; no email invitation or password recovery delivery. |
| 5 | Does the contact widget's green dot imply reachability or opening hours? | Omit the dot until meaning and opening hours are approved. | Shop owner + Member 2 | OPEN; widget status indicator. |
| 6 | Do Call and WhatsApp share a number; what greeting/product context? | Read separate configured values from shop settings and use a neutral greeting until confirmed. | Shop owner + Member 2 | OPEN; separate settings and provisional neutral greeting in place. |
| 7 | Who supplies mascot art and final greeting? | Team-created original SVG as a replaceable asset; shop may supply final art/copy. | Shop owner + team | OPEN; original mascot and provisional greeting in place pending owner review. |
| 8 | Do categories need full CRUD? | Yes, per work split; confirm with owner. | Shop owner + Member 1 | OPEN; category admin UI/API. |
| 9 | Is 500 concurrent visitors a confirmed target, and what is the acceptance profile? | Define traffic mix, duration, environment, and latency/error thresholds before load testing. | Product owner + team | OPEN; no performance claim until measured. |
| 10 | Is consent/privacy wording required for pre-bookings and subscriptions? | Obtain owner-approved wording before collecting data. | Shop owner + Member 2 | OPEN; form copy/schema compliance. |
| 11 | Confirm Product schema, slug, and availability contract for pre-bookings and wishlist? | Product UUID, slug, and `in_stock`/`out_of_stock` availability are shared in `prisma/schema.prisma`; catalogue reads are under `/api/catalogue`. | Member 1 + Member 2 | RESOLVED for this repository; confirm catalogue write integration separately. |
| 12 | How should catalogue write routes use the shared guards? | Member 1 should call `requireAdmin()` and `requireSuperAdmin()` from `server/middleware/auth.js` for all catalogue writes. | Member 1 + Member 2 | OPEN; public catalogue reads are implemented, catalogue admin writes are not part of this conversion pass. |
| 13 | What product image upload limits and Cloudinary transformations are required? | Keep product image storage server-side in Cloudinary and agree policy before enabling writes. | Member 1 + Member 2 | OPEN; shop logo upload works through Cloudinary; product upload is pending Member 1 integration. |
| 14 | Confirm shared runtime/dependency pins and homepage integration? | Use the repository Node/npm pins and the shared Vite shell/routes. | Both members | OPEN; coordinate catalogue admin UI and section composition. |
