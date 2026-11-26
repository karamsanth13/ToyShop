# Verification record and manual QA checklist

## Automated checks run in this workspace

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm test` — passed (4 validation tests).
- `npm run build` — passed.

## Not verified here

- Supabase migration application, RLS allow/deny behavior, Auth login/invite flows, storage upload policies, login throttling, or private data access: no configured Supabase project or credentials were supplied.
- Product integration, pre-booking writes/admin reads, and notification delivery: blocked by the missing Product contract and unresolved notification channel/consent decisions.
- Manual browser/device visual and functional review: not performed. The member must perform and record it before proposing a push.
- 500 concurrent visitors: not load-tested; see `LOAD_TEST_PLAN.md`.

## Manual device and workflow checklist

Inspect 360px, 390px, 768px, 1024px, and 1440px widths and both light/dark themes.

- [ ] Confirm header remains sticky, shop fallback is sensible, and configured logo/name render.
- [ ] Confirm footer uses only configured contact/social/address data; test configured Google Maps location and missing-location fallback.
- [ ] Sign in with Admin and Super Admin; verify visitor, Admin, and Super Admin permissions separately. Try invalid and repeated logins.
- [ ] As Super Admin, edit an Admin name, deactivate and reactivate the account, then verify the deactivated account cannot sign in or access protected pages.
- [ ] Verify no public sign-up, password recovery behavior, invitation email callback, and logout cookie clearing.
- [ ] Try unauthorized direct requests to shop updates, social CRUD, admin list/create/remove, and verify 401/403 responses.
- [ ] Verify the last Super Admin cannot be removed/demoted and an Admin cannot elevate their own role.
- [ ] Update shop settings and social links; upload/remove an allowed logo; try unsupported and oversized files.
- [ ] Set opening hours; verify they appear in the public footer and the contact helper.
- [ ] Toggle theme, refresh, reopen, and check first paint and system preference when no saved choice exists.
- [ ] Save/remove wishlist IDs; verify products resolve, state survives refresh, and only this device stores the IDs. No saved count is displayed.
- [ ] Contact helper: dismiss greeting, open, close from outside/Escape/button, copy phone, test `tel:` and WhatsApp encoding, missing numbers, and footer overlap.
- [ ] Verify reduced-motion preference, keyboard focus visibility, dialog focus behavior, and screen-reader labels.
- [ ] After Member 1 integration, test an in-stock and out-of-stock product, wishlist resolution, pre-booking validation/rate limit, and Admin-only pre-booking list.
- [ ] Once the notification channel is approved, test consent, subscriber privacy, and real provider delivery without claiming a send before it occurs.
