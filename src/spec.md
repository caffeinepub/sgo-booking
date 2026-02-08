# Specification

## Summary
**Goal:** Restore the pre-v25/26 role-based Guest/Hotel/Admin experiences (routes, menus, and panels), and fix the Admin invite token generation and bookings views that regressed.

**Planned changes:**
- Restore role detection and authorization/route-guard behavior so Admin and Hotel accounts are no longer treated as Guests, and /admin, /hotel, and /guest (and/or /account) render the correct role pages.
- Restore missing role-specific frontend navigation/panels:
  - Guest: “Guest Account” and “My Bookings”
  - Hotel: “My Bookings”, “Guest Account”, and “Hotel Area”
  - Admin: “My Bookings” and Admin panels including invite token management
- Fix Admin “Generate Token” by restoring/implementing backend APIs used by the Invite Token UI (createInviteToken, getInviteTokens), enforcing Admin-only access, and ensuring the token list refreshes after generation.
- Verify and restore bookings querying behavior (getBookings with filters) so “My Bookings” works correctly for Guest, Hotel, and Admin views, including details/status rendering without runtime errors.
- Run and pass the existing regression checklist items related to authentication/authorization/admin/hotel/booking flows and fix any failures found.

**User-visible outcome:** After login, Guests, Hotels, and Admins see the correct menus and dashboards for their roles; “My Bookings” is available and loads correctly for each role; Admins can access /admin and successfully generate and view invite tokens without “FAILED”.
