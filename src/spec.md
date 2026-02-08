# Specification

## Summary
**Goal:** Ensure rooms created/updated by hotel accounts persist under the correct hotel and are visible consistently to hotel owners and guests (not just admins).

**Planned changes:**
- Fix backend room create/update to store rooms under the correct hotel principal and ensure room reads use a single source of truth (roomsMap/hotelsMap) without admin-only dependencies.
- Align backend hotel/room visibility rules so guest hotel discovery and hotel detail room lists correctly show hotels/rooms needed for booking (consistent rules across getHotels/getRooms).
- Update frontend hotel dashboard and guest hotel detail flows to reliably query rooms using the correct hotelId, show loading states, and refresh room lists after create/update (React Query refetch/invalidation).
- Add and document a focused regression verification checklist for: hotel room upload (with photos), post-reload persistence, guest browse/detail visibility, and admin consistency; surface save/load errors in English.

**User-visible outcome:** Hotel owners can upload rooms and still see them after reloading in Hotel Area > Rooms, and guests can discover the hotel and view its available rooms on the hotel detail page for booking; admin/hotel/guest views remain consistent.
