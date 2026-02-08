# Specification

## Summary
**Goal:** Fix incorrect booking total prices and ensure guests see hotel-specific payment/contact info, while adding admin subscription controls that govern hotel visibility and booking eligibility.

**Planned changes:**
- Calculate and persist `booking.totalPrice` on the backend using the stored room nightly rate × number of nights (derived from check-in/check-out), ignoring any client-submitted `totalPrice`, and validate date ranges/currency.
- Extend hotel profile data to store hotel-specific WhatsApp number and email, allow hotel owners to update these fields, and expose them in guest-facing hotel queries.
- Update guest booking/payment UI to show the selected hotel’s own contact details and payment methods, and avoid showing the admin activation contact card in guest flows (show a clear “not provided yet” message when missing).
- Add per-hotel subscription flags (Paid/Unpaid and optional TEST) with admin controls, and enforce rules so only Active+Paid+not TEST hotels are visible to guests and bookable.
- Add a conditional backend migration to safely add the new hotel contact fields and subscription fields to existing persisted data.

**User-visible outcome:** Guests will see correct total prices and the hotel’s own payment/contact details during booking; admins can mark hotels Paid/Unpaid (and TEST) and control whether hotels appear to guests and can be booked.
