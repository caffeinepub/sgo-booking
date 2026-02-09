# Specification

## Summary
**Goal:** Enable a standard guest hotel booking flow and make bookings manageable/visible across guest, hotel, and admin portals, while letting hotels manage their own payment methods and contact email.

**Planned changes:**
- Replace the Hotel Detail page booking placeholder with a functional booking flow: select a room, enter check-in/check-out dates, number of rooms, and number of guests, then submit a booking and show a success state (booking ID/status).
- Implement/extend backend booking APIs so guests can create bookings, guests/hotels/admin can list bookings with correct access, and hotels can confirm bookings with status synced across portals.
- Extend booking data model to persist room quantity and compute/persist total price as nights × pricePerNight × roomQuantity.
- Replace Guest “My Bookings” placeholder with a real bookings table showing key fields (hotel/room, dates, rooms count, guests, total price/currency, status) and support opening booking details where applicable.
- Replace Hotel “Bookings” placeholder with a real bookings list for the caller hotel and an action to confirm pending bookings.
- Replace Admin “Bookings” placeholder with a real bookings overview across all hotels.
- Add hotel-managed payment methods: backend APIs for hotel owners to add/remove free-form payment methods, persist on hotel profile, and expose via hotel profile queries for guest viewing.
- Replace Hotel “Payment Methods” placeholder with UI to add/list/remove payment methods (free-form name + details; no hardcoded providers).
- Ensure Hotel Profile “email” save/load works end-to-end and appears in guest-facing contact info when present.
- Add a focused regression verification update aligned to the existing regression checklist to ensure bookings/payment/profile changes don’t break existing core flows.

**User-visible outcome:** Guests can book a room with dates/guests/room quantity and see their bookings; hotels can view and confirm bookings and manage payment methods and email; admins can view bookings across hotels, with booking status consistent across portals.
