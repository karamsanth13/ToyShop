# Verification record and manual QA checklist

## Automated checks run in this workspace

- `npm run lint` — passed.
- `npm test` — passed (5 validation tests).
- `npm run build` — passed.

## Not verified here

- Database migration application, login/role flows against live PostgreSQL, Cloudinary upload, and private-data denial: no local database or provider credentials were configured.
- Pre-booking writes/admin reads: not enabled until consent/privacy wording is approved. Notification delivery is pending the channel/provider decision.
- Manual browser/device visual and functional review: not performed. The member must perform and record it before proposing a push.
- 500 concurrent visitors: not load-tested; see `LOAD_TEST_PLAN.md`.

## Manual device and workflow checklist

Inspect 360px, 390px, 768px, 1024px, and 1440px widths and both light/dark themes.

- [ ] Confirm header remains sticky, shop fallback is sensible, and configured logo/name render.
- [ ] Confirm footer uses only configured contact/social/address data; test configured Google Maps location and missing-location fallback.
- [ ] Sign in with Admin and Super Admin; verify visitor, Admin, and Super Admin permissions separately. Try invalid and repeated logins.
- [ ] Verify no public sign-up, temporary password handoff, and logout cookie clearing.
- [ ] Try unauthorized direct requests to shop updates, social CRUD, admin list/create/remove, and verify 401/403 responses.
- [ ] Verify Super Admin cannot be removed through the Admin removal endpoint and an Admin cannot elevate their role.
- [ ] Update shop settings and social links; upload an allowed logo; try unsupported and oversized files.
- [ ] Toggle theme, refresh, reopen, and check first paint and system preference when no saved choice exists.
- [ ] Save/remove wishlist IDs; verify only this device stores them and no count is displayed; test deleted or unpublished product IDs.
- [ ] Contact helper: dismiss greeting, open, close from outside/Escape/button, copy phone, test `tel:` and WhatsApp encoding, missing numbers, and footer overlap.
- [ ] Verify reduced-motion preference, keyboard focus visibility, dialog focus behavior, and screen-reader labels.
- [ ] Test an in-stock and out-of-stock product, published-category filters, active offers, and wishlist resolution. Catalogue admin writes remain Member 1 work.
- [ ] Once privacy wording is approved, implement and test pre-booking validation, public rate limiting, and the Admin-only list.
- [ ] Once the notification channel is approved, test consent, subscriber privacy, and real provider delivery without claiming a send before it occurs.
