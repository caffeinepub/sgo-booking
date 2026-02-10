# Specification

## Summary
**Goal:** Simplify hotel room management by removing Room Number, adding promo-based pricing, and enabling edit/delete for rooms and individual room photos without affecting other working features.

**Planned changes:**
- Remove the `roomNumber` field end-to-end (backend Motoko types/state + frontend types/UI), including safe upgrade handling to discard legacy `roomNumber` data.
- Add `promoPercent` (0–100) to room data, validate inputs, and compute a deterministic discounted nightly price from base price + promo percent.
- Update guest-facing room display/booking calculations to use the discounted nightly price whenever promoPercent > 0.
- Add Edit and Delete actions to each room entry in the hotel Rooms list, including confirmation on delete and UI refresh after mutations.
- Add per-photo Delete and optional Replace/Edit controls for each uploaded room photo, persisting changes to the backend pictures array and reflecting updates in guest views.
- Update `frontend/src/components/hotel/RoomsPanel.tsx` and related hooks/mutations to match the new room schema (no roomNumber; includes promoPercent and discounted-price display).

**User-visible outcome:** Hotel owners can create rooms using only room type, base price, promo percent, and photos; see the discounted price automatically; edit/delete rooms; and delete/replace individual room photos. Guests see updated room photos and promo-adjusted nightly prices during browsing and booking.
