# Specification

## Summary
**Goal:** Ensure room photos uploaded by Hotel accounts persist correctly and display consistently for Admin, the owning Hotel, and Guests.

**Planned changes:**
- Fix backend room create/update so the `pictures : [Text]` array is persisted exactly as provided and remains associated with the correct `hotelId`.
- Fix backend room retrieval/listing so Admin, owning Hotel, and Guests receive consistent room records including the full `pictures` array (without role-based stripping or unintended filtering).
- Update Hotel Area Rooms UI to distinguish between empty results vs fetch/authorization/filter issues, showing an explicit error + retry on failures and only showing “No rooms yet...” when a successful fetch returns an empty list.
- Ensure the guest-facing Hotel Detail page reliably renders room photos from returned `pictures` values and shows a clear fallback when a room has zero valid/unloadable pictures while keeping booking actions available.

**User-visible outcome:** Hotel owners and guests can reliably see the same room photos that admins see; when photos are missing or a fetch fails, the UI communicates the issue clearly without hiding rooms or showing misleading empty states.
