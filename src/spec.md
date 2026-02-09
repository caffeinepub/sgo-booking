# Specification

## Summary
**Goal:** Purge all room data for the single hotel named “HOTEL DUMMY” (photos + all room details) and prevent “ghost” rooms from appearing due to stale room references.

**Planned changes:**
- Add an admin-only backend maintenance operation that fully deletes every room record belonging to a specified hotel and removes those room IDs from the hotel’s stored room list so the hotel ends with zero rooms.
- Run a safe, one-time backend upgrade cleanup that finds the hotel named “HOTEL DUMMY”, performs the full room purge, and persists a flag so it is not re-run on subsequent upgrades.
- Update hotel-to-room view construction so missing/orphan room IDs are excluded from room results (no placeholder/empty rooms returned) across `getCallerHotelProfile()`, `getHotelProfile(hotelId)`, and `getHotels()`.
- Perform and record a targeted regression verification pass (manual acceptable) using relevant sections of `frontend/REGRESSION_CHECKLIST.md` to ensure unrelated flows still work.

**User-visible outcome:** After deployment, “HOTEL DUMMY” shows zero rooms everywhere in the UI (no empty “No photos available” room cards), other hotels’ room data remains intact, and normal browsing/admin flows continue to work.
