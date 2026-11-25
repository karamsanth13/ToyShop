# Open Decisions

Statuses below are **OPEN** unless explicitly changed; recommendations are provisional, not approved requirements.

| # | Question | Provisional recommendation | Decision owner | Status / impact |
|---|---|---|---|---|
| 1 | What currency and price display format? | Set explicit ISO currency and locale from shop settings. | Shop owner + both members | OPEN; catalogue formatting; numeric DB values remain currency-neutral. |
| 2 | Which new-arrival notification channel/provider? | Decide the channel before collecting contact/token data; keep provider-neutral boundary. | Shop owner + Member 2 | OPEN; subscription UI, schema, delivery blocked. |
| 3 | Which pre-booking fields beyond name, phone, product, date; is quantity needed? | Keep only name, phone, product, and date until approved. | Shop owner + Member 2 | OPEN; form/schema/privacy. |
| 4 | What admin password recovery method and email provider? | Configure the Supabase email provider for Admin invitations; approve a recovery flow before exposing password recovery. | Super Admin + shop owner | OPEN; invitations cannot deliver until email is configured; recovery flow remains blocked. |
| 5 | Does the contact widget's green dot imply reachability or opening hours? | Omit the dot until meaning and opening hours are approved. | Shop owner + Member 2 | OPEN; widget status indicator. |
| 6 | Do Call and WhatsApp share a number; what greeting/product context? | Read separate configured values from shop settings and use a neutral greeting until confirmed. | Shop owner + Member 2 | OPEN; separate settings and provisional neutral greeting in place. |
| 7 | Who supplies mascot art and final greeting? | Team-created original SVG as a replaceable asset; shop may supply final art/copy. | Shop owner + team | OPEN; original mascot and provisional greeting in place pending owner review. |
| 8 | Do categories need full CRUD? | Yes, per work split; confirm with owner. | Shop owner + Member 1 | OPEN; category admin UI/API. |
| 9 | Is 500 concurrent visitors a confirmed target, and what is the acceptance profile? | Define traffic mix, duration, environment, and latency/error thresholds before load testing. | Product owner + team | OPEN; no performance claim until measured. |
| 10 | Is consent/privacy wording required for pre-bookings and subscriptions? | Obtain owner-approved wording before collecting data. | Shop owner + Member 2 | OPEN; form copy/schema compliance. |
| 11 | Confirm Product schema, slug, and availability contract for pre-bookings and wishlist? | Use the `public.products` schema in `202611250002_catalogue.sql`; confirm before pre-booking FK migration. | Member 1 + Member 2 | OPEN; pre-booking FK and wishlist resolution. |
| 12 | Connect catalogue write routes and RLS to `requireAdmin()` / `public.is_admin()`? | Wire Member 1 admin write routes to `src/lib/auth/guards.ts` and add forward RLS policies. | Member 1 + Member 2 | OPEN; catalogue write routes remain disabled until wired. |
| 13 | What Supabase Storage bucket and image limits for product images? | Private upload authorization with public optimized reads, pending policy. | Member 1 + Member 2 | OPEN; image upload and `next/image` host config. |
| 14 | Confirm shared runtime/dependency pins and homepage/layout integration? | Both members' foundations merged on `main`; verify exact dependency alignment. | Both members | OPEN; merged on `main` using Node 24.12.0 / Next 15.5.6 baseline. |
