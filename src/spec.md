# Specification

## Summary
**Goal:** Restore the validated/activated hotel account experience so that, after invite-token validation, the hotel profile loads and the UI shows the Hotel Area menu and Hotel Management dashboard (matching the provided screenshot).

**Planned changes:**
- Fix backend hotel activation so consuming an invite token sets and persists an “activated hotel account” state and returns a non-null caller hotel profile for that account.
- Ensure backend methods used by the current frontend for hotel gating (get caller role, is caller admin, get caller hotel profile) are present and work without traps for valid users.
- Update frontend navigation gating so “Hotel Area” appears in the TopNav for activated hotel accounts and routes to `/hotel`.
- Ensure `/hotel` renders the Hotel Management dashboard with header/description and tabs in this order: Profile, Rooms, Payments, Bookings, Record Stays, Subscription; ensure Rooms supports adding rooms and uploading room photos via the existing upload flow.
- After successful invite-token activation, automatically invalidate/refetch relevant cached queries (role/admin/hotel profile) and redirect to `/hotel` so the updated state is visible immediately.

**User-visible outcome:** After validating an invite token, a hotel user is immediately taken to the Hotel Management dashboard, sees the “Hotel Area” menu in the top navigation, and can manage hotel details including creating rooms and uploading room photos.
