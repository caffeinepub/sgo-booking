# Specification

## Summary
**Goal:** Restore the previously working admin invite-token generation and role-gated navigation (Home/My Bookings/Account/Hotel Area/Admin Panel) so the app matches the provided screenshots and does not error at runtime.

**Planned changes:**
- Re-introduce the Motoko backend API methods the frontend expects for hotel invite tokens: `createInviteToken(maxUses, boundPrincipal)`, `getInviteTokens()`, `validateInviteToken(token)`, and `consumeInviteToken(token)`, including admin-only access for token creation/listing.
- Fix/align backend role & admin detection used by frontend guards (e.g., admin access to `/admin`, activated hotel access to `/hotel`, guest restrictions) to prevent permission-check spinners and incorrect AccessDenied states.
- Restore TopNav entries and labels to match screenshots: Home, Browse Hotels, My Bookings, Account, Hotel Area (when permitted), and Admin Panel (admin-only).
- Add/adjust routing for an explicit “My Bookings” route (e.g., `/bookings`) that reuses the existing bookings table currently shown in the Account/Guest area, with the same auth/profile-completion protection as `/account`.
- Verify the impacted flows (admin token management, guest bookings view, hotel area access, role-based link visibility) match the screenshots and do not regress.

**User-visible outcome:** Admins can generate and view hotel invite tokens without errors, and users see the correct navigation (including My Bookings) with pages accessible/hidden based on their role (admin/hotel/guest) as shown in the screenshots.
