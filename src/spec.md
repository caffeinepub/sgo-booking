# Specification

## Summary
**Goal:** Fix backend canister API regressions so hotel profile saving, room CRUD, admin hotel visibility controls, and guest hotel browsing work without missing-method runtime errors.

**Planned changes:**
- Align the backend Candid API with the frontend `ExtendedBackendInterface` to eliminate missing method errors (e.g., `updateHotelProfile`, `createRoom`, `updateRoom`, and other referenced hooks).
- Implement `updateHotelProfile(name, location, address, mapLink, whatsapp, email)` in `backend/main.mo` with the exact parameter order expected by the frontend, persisting updates to the caller’s hotel record (initializing a default record if missing).
- Restore/implement room APIs in `backend/main.mo` to match frontend signatures: `getRooms(filters: RoomQuery)`, `createRoom(roomNumber, roomType, pricePerNight, currency, pictures)`, and `updateRoom(roomId, roomNumber, roomType, pricePerNight, currency, pictures)`, including persistence and returning `RoomView`.
- Ensure consistent hotel record initialization/maintenance so activated hotels can create rooms and appear in admin/guest hotel lists even if the profile was never saved (including associating room IDs with the hotel).
- Implement/restore `getHotels()` so active hotels appear in guest browsing and admin tools, including returning hotel rooms and their `pictures` for rendering.
- Implement admin-only hotel management methods required by the existing admin UI: `setHotelActiveStatus(hotelId, active)` and `setHotelSubscriptionStatus(hotelId, status)`.
- Restore/implement additional backend methods referenced by frontend auth/role/invite flows (at minimum: `getCallerUserRole`, `isCallerAdmin`, `makeMeAdmin`, `validateInviteToken`) to avoid runtime errors.
- Run a focused regression check using `frontend/REGRESSION_CHECKLIST.md` covering hotel profile saving, room create/update with photos, guest browse visibility, and admin visibility toggles.

**User-visible outcome:** Hotel owners can save their hotel profile and create/update rooms (including photos) without errors; guests can browse active hotels instead of seeing “No Hotels Available”; admins can view hotels and toggle active/subscription status successfully.
