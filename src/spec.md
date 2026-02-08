# Specification

## Summary
**Goal:** Restore Version 24 role-based access behavior so Admin and Hotel accounts are no longer treated as Guests, and the Admin Panel (/admin) and Hotel Area (/hotel) are accessible to the correct roles again.

**Planned changes:**
- Restore frontend role detection and routing/guards so Admin users see the Admin navigation and can access `/admin`, Hotel owners can access `/hotel`, and Guests are denied for both.
- Fix backend role/authorization checks and any related APIs to return the same Admin/Hotel/Guest results as Version 24 without wiping or reinitializing existing authorization state during deploy/upgrade.
- Update the frontend build/version identifier to clearly indicate Version 24 is running, and ensure all auth/access user-facing text remains in English.
- Run and ensure existing regression checks for Authentication & Authorization, Admin Panel access, and Hotel Area access pass after the rollback behavior is restored.

**User-visible outcome:** Admins can access the Admin Panel and see admin navigation, Hotel owners can access the Hotel Management area and its tabs, and Guests remain blocked from both areas with an access denied screen—matching Version 24 behavior.
