# Open Decisions

Status values: **OPEN** unless explicitly changed. No provisional option is an approved requirement.

| # | Question | Recommended option (provisional) | Owner | Status | Implementation impact |
|---|---|---|---|---|---|
| 1 | What currency and price display format? | Set explicit ISO currency and locale from shop settings. | Shop owner + both members | OPEN | Formatting; numeric DB values remain currency-neutral. |
| 2 | What new-arrival notification channel/provider? | Provider-neutral adapter until chosen. | Member 2 + shop owner | OPEN | No delivery claims or provider implementation yet. |
| 3 | Which pre-booking fields beyond name/phone, and is quantity needed? | Keep only name, phone, product and date until approved. | Shop owner + Member 2 | OPEN | Catalogue exposes product ID/name/slug/availability. |
| 4 | Admin password recovery method and email provider? | Supabase Auth recovery with approved provider. | Member 2 + owner | OPEN | Auth configuration. |
| 5 | Does the contact green dot mean always reachable or opening hours? | Hide availability claim until hours are configured. | Shop owner + Member 2 | OPEN | Contact widget status. |
| 6 | Do Call and WhatsApp share a number; greeting and product-name message? | Read both numbers from shop settings; no hard-coded values. | Shop owner + Member 2 | OPEN | Contact actions and copy. |
| 7 | Who supplies mascot art and final greeting? | Original team artwork only if owner approves. | Shop owner + Member 2 | OPEN | Contact widget assets/copy. |
| 8 | Do categories need full CRUD? | Yes, per work split. | Shop owner + Member 1 | OPEN | Category admin UI/API. |
| 9 | Confirm target of 500 concurrent visitors? | Define workload and test on staging before claiming. | Both members + owner | OPEN | Load plan and hosting capacity. |
| 10 | What privacy/consent wording is required for pre-bookings and notifications? | Obtain owner-approved copy before collecting data. | Shop owner + Member 2 | OPEN | Forms and retention policy. |
| 11 | Confirm Product schema, product slug and availability contract with Member 2? | Use proposed schema in `PROJECT_CONTRACT.md`; confirm before integration. | Both members | OPEN | Migration, pre-booking, API types. |
| 12 | Which role claim and shared `requireAdmin()` interface does Member 2 provide? | Server-only function returning authorized principal or throwing/response. | Member 2 | OPEN | Catalogue write routes remain disabled until integrated. |
| 13 | What Supabase Storage bucket and image limits? | Private upload authorization with public optimized reads, pending policy. | Member 2 + Member 1 | OPEN | Image upload and `next/image` host config. |
| 14 | Who owns final homepage composition? | Catalogue supplies sections; one named integrator composes them. | Both members | OPEN | Avoid competing edits to `src/app/page.tsx`. |
