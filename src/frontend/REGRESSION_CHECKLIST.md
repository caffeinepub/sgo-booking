# Pre-Release Regression Checklist

This checklist must be completed before each production deployment to ensure critical functionality remains intact.

## Authentication & Authorization

### V24 Verification Steps (Post-Rollback)
- [ ] **Hard-coded admin principal verification**
  - Log in with principal `ayatf-afj3q-z5wvo-4ocoi-x7lve-uel5k-yhe6p-ahp57-ww5ch-bc72g-wae`
  - Verify admin role is automatically assigned
  - Verify Admin Panel link appears in navigation
  - Verify all admin functions are accessible

- [ ] **Role detection accuracy**
  - Admin user: Verify `isCallerAdmin()` returns true
  - Hotel user (activated): Verify hotel activation status is correct
  - Guest user: Verify appropriate access restrictions

- [ ] **Cross-session cache isolation**
  - Log in as admin → verify admin access
  - Log out → log in as guest → verify guest-only access (no admin panel)
  - Log out → log in as hotel → verify hotel-only access
  - Confirm no cross-contamination of cached queries between sessions

### Critical Post-Rollback Test Scenarios
- [ ] **Admin activation flow**
  - Admin creates invite token for a new hotel principal
  - Hotel principal logs in and consumes token
  - Verify hotel is activated and can access Hotel Area
  - Verify hotel appears in admin's hotel list

- [ ] **Hotel profile management**
  - Activated hotel creates/updates profile
  - Verify profile saves correctly
  - Verify profile appears in Browse Hotels for guests

- [ ] **Room management**
  - Activated hotel creates room with photos
  - Verify room appears in hotel's room list
  - Verify room appears in guest Browse Hotels view

## Guest Booking Flow (New in V34)
- [ ] **Booking creation**
  - Guest browses hotels and selects a room
  - Guest fills booking form (check-in, check-out, rooms, guests)
  - Verify form validation (dates, counts)
  - Verify booking is created and booking ID is returned
  - Verify success state is displayed

- [ ] **Guest bookings view**
  - Navigate to My Bookings page
  - Verify all guest bookings are displayed
  - Verify booking details are correct (hotel, dates, guests, price, status)
  - Verify BookingDetailsDialog opens and displays full information

## Hotel Booking Management (New in V34)
- [ ] **Hotel bookings view**
  - Hotel owner navigates to Bookings tab
  - Verify all bookings for the hotel are displayed
  - Verify pending bookings are shown separately
  - Verify booking details include guest principal

- [ ] **Booking confirmation**
  - Hotel owner confirms a pending booking
  - Verify status changes to "Booked"
  - Verify status update is reflected in guest's My Bookings
  - Verify queries are invalidated and UI updates

## Admin Booking Management (New in V34)
- [ ] **Admin bookings overview**
  - Admin navigates to Bookings Overview
  - Verify all bookings across all hotels are displayed
  - Verify hotel names are correctly resolved
  - Verify booking details are accessible

## Payment Methods Management (New in V34)
- [ ] **Add payment method**
  - Hotel owner navigates to Payments tab
  - Add a new payment method (free-form name and details)
  - Verify payment method is saved
  - Verify payment method appears in hotel profile

- [ ] **Remove payment method**
  - Hotel owner removes a payment method
  - Verify payment method is removed from hotel profile
  - Verify guest-facing hotel detail page updates

- [ ] **Guest view of payment methods**
  - Guest views hotel detail page
  - Verify payment methods are displayed
  - Verify contact information (WhatsApp, email) is displayed

## Hotel Email Contact (New in V34)
- [ ] **Hotel email entry**
  - Hotel owner enters email in profile
  - Verify email is saved
  - Verify email appears in Hotel Profile panel after save

- [ ] **Guest view of hotel email**
  - Guest views hotel detail page
  - Verify email is displayed in contact section
  - Verify email link works (mailto:)

## Runtime Error Prevention
- [ ] **Missing backend method handling**
  - Verify booking/payment method hooks gracefully handle missing backend methods
  - Verify user-friendly error messages are shown (not uncaught exceptions)
  - Verify app does not crash when backend methods are unavailable

## General Functionality
- [ ] **Navigation**
  - All routes are accessible and render correctly
  - No blank screens or undefined routes
  - Back buttons and navigation links work

- [ ] **Loading states**
  - All queries show appropriate loading indicators
  - No infinite loading states
  - Proper error handling for failed queries

- [ ] **Data consistency**
  - Profile changes reflect immediately after save
  - Room changes reflect in all views
  - Booking changes reflect in all relevant views
  - Query invalidation works correctly

## Notes
- This checklist should be updated whenever new critical functionality is added
- Any failed check must be resolved before deployment
- Document any known issues or workarounds in this section
</markdown>
