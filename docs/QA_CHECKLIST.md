# Verification record and manual QA checklist

## Automated checks run in this workspace

- `npm run lint` — passed.
- `npm test` — passed (5 validation tests).
- `npm run build` — passed.

## Local runtime checks

- Prisma migrations applied and demo seed inserted 20 products, 8 categories, two demo accounts, an offer, a sample pre-booking, enquiry, and subscriber.
- Local storefront returned HTTP 200; `/api/health` returned `ok`; catalogue returned 20 products and offers returned one active offer.
- Demo Admin login succeeded and the protected dashboard returned the live 20-product count.
- Both demo accounts signed in through the browser; Admin logout cleared the session, and Super Admin showed its extra account/activity navigation.
- Browser rendered the seeded homepage, active offer, product detail, out-of-stock request form, and mobile navigation at 390px without console errors.
- Admin API checks covered category and product create/edit/delete, offer create/edit/delete, Admin account create/edit/deactivate/reactivate, and role separation. Temporary records were removed afterward.
- Visitor API checks covered search/filter, pre-booking and enquiry submissions with Admin status updates, and duplicate-safe subscription. Temporary records were removed afterward.

## Remaining provider / device checks

- Cloudinary upload needs credentials in `.env`; email delivery is intentionally disabled until a provider is configured.
- Additional viewport/theme, shop settings/social link, image upload, wishlist actions, and keyboard/accessibility checks remain on the manual checklist below.
- 500 concurrent visitors: not load-tested; see `LOAD_TEST_PLAN.md`.

## Manual device and workflow checklist

Inspect 360px, 390px, 768px, 1024px, and 1440px widths and both light/dark themes.

- [ ] Confirm header remains sticky, shop fallback is sensible, and configured logo/name render.
- [ ] Confirm footer uses only configured contact/social/address data; test configured Google Maps location and missing-location fallback.
- [x] Sign in with Admin and Super Admin; verify role-specific navigation and protected access.
- [x] Verify Admin logout clears the session and returns to login.
- [ ] Attempt invalid credentials and verify public registration is unavailable.
- [x] Verify protected-page redirect and that an Admin receives 403 for Super Admin account management.
- [ ] Verify Super Admin cannot be removed through the Admin removal endpoint and an Admin cannot elevate their role.
- [ ] Update shop settings and social links; upload an allowed logo; try unsupported and oversized files.
- [ ] Toggle theme, refresh, reopen, and check first paint and system preference when no saved choice exists.
- [ ] Save/remove wishlist IDs; verify only this device stores them and no count is displayed; test deleted or unpublished product IDs.
- [x] Open the rule-based helper and verify its opening-hours fallback; contact numbers are not configured, so call/WhatsApp remain clearly unavailable.
- [ ] Verify reduced-motion preference, keyboard focus visibility, dialog focus behavior, and screen-reader labels.
- [x] Test search/category/price filters, active offers, and an out-of-stock detail/request form.
- [x] Submit a consented pre-booking request and verify its Admin status can be updated.
- [x] Submit a customer enquiry and update its Admin status.
- [x] Subscribe twice with consent and verify the email resolves to one subscriber record.
