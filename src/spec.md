# Specification

## Summary
**Goal:** Provide an admin-only backend maintenance capability to permanently remove specific legacy/stale room photo data and undeletable payment method entries for a targeted hotel, without impacting normal app behavior for other hotels.

**Planned changes:**
- Add an admin-only maintenance method in `backend/main.mo` that accepts a hotel principal and runs a one-off cleanup for that hotel.
- When invoked, permanently remove the identified legacy room photo references for the target hotel so they no longer appear in guest/admin browsing or hotel room listings.
- When invoked, permanently remove legacy/undeletable payment method entries for the target hotel (including the “GOPAY” entry and the email stored as a payment method) so they do not reappear.
- Ensure hotel email remains only in the hotel profile contact email field and is not duplicated/derived into `paymentMethods` during reads or writes.

**User-visible outcome:** After an admin runs the maintenance method for the affected hotel, stale room photos and the legacy “GOPAY”/email payment method entries no longer show up in guest/admin/hotel views, while all existing booking/profile/room/admin flows continue to work as before.
