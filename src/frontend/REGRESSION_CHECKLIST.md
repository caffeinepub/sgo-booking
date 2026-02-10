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

## Hotel Activation Gating (New in V43)
- [ ] **Unactivated hotel cannot access Hotel Area**
  - Log in as a hotel principal that has NOT consumed an invite token
  - Attempt to navigate to /hotel
  - Verify AccessDeniedScreen is displayed with hotel activation message
  - Verify HotelActivationForm is embedded in the access denied screen

- [ ] **Purged hotel must re-activate**
  - Admin purges a hotel principal via Admin Panel → Purge Hotel Data
  - Log in as the purged hotel principal
  - Attempt to navigate to /hotel
  - Verify AccessDeniedScreen is displayed (hotel is no longer activated)
  - Admin generates a NEW invite token for the same principal
  - Hotel consumes the new token
  - Verify hotel can now access /hotel and create a new profile

- [ ] **Admin bypass for Hotel Area**
  - Log in as admin
  - Navigate to /hotel
  - Verify admin can access Hotel Area even without hotel activation

## Admin Principal Purge (New in V43)
- [ ] **Purge UI visibility**
  - Log in as non-admin user
  - Verify Purge Hotel Data panel is NOT visible
  - Log in as admin
  - Navigate to Admin Panel
  - Verify Purge Hotel Data panel is visible

- [ ] **Purge confirmation flow**
  - Admin enters a hotel Principal ID
  - Click "Initiate Purge"
  - Verify confirmation step appears
  - Verify confirmation requires typing exact Principal ID
  - Type incorrect Principal ID → verify error message
  - Type correct Principal ID → verify purge executes

- [ ] **Purge data removal**
  - Admin purges a hotel principal
  - Verify hotel profile is removed from Browse Hotels
  - Verify all rooms for that hotel are removed
  - Verify all bookings for that hotel are removed
  - Verify invite tokens bound to that principal are removed
  - Verify activation status for that principal is removed

- [ ] **Purge cache invalidation**
  - Admin purges a hotel principal
  - Verify Browse Hotels page updates immediately (no hard refresh needed)
  - Verify Admin Panel → Invite Tokens updates immediately
  - Verify Admin Panel → Bookings Overview updates immediately
  - Verify no ghost/orphan data appears in any view

- [ ] **Purge does not affect other hotels**
  - Admin purges one hotel principal
  - Verify other hotels remain in Browse Hotels
  - Verify other hotels' rooms are intact
  - Verify other hotels' bookings are intact
  - Verify guest booking flow still works for other hotels

## Browse Hotels Hardening (New in V43)
- [ ] **Missing rooms data handling**
  - Verify Browse Hotels page renders without errors when a hotel has no rooms
  - Verify "0 rooms available" is displayed correctly
  - Verify no placeholder/ghost rooms appear

- [ ] **Missing pictures data handling**
  - Verify Browse Hotels page renders without errors when rooms have no pictures
  - Verify "No photos available" placeholder is displayed
  - Verify no broken image icons or console errors

- [ ] **Malformed hotel data handling**
  - Verify Browse Hotels page handles hotels with missing/null fields gracefully
  - Verify no runtime errors or blank screens
  - Verify fallback text is displayed for missing data

## HOTEL DUMMY One-Time Purge Verification (CRITICAL - V40+)
**Context:** This release includes a one-time backend cleanup that removes ALL room data (photos, descriptions, prices, types) for HOTEL DUMMY only. The cleanup runs automatically during canister upgrade and is idempotent (safe to run multiple times).

### Pre-Deployment Verification
- [ ] **Confirm target hotel**
  - Verify the hotel name "HOTEL DUMMY" is correct
  - Verify this is the only hotel that should have rooms purged
  - Verify no other hotels will be affected

### Post-Deployment Verification
- [ ] **HOTEL DUMMY shows zero rooms**
  - Log in as guest → Browse Hotels
  - Locate HOTEL DUMMY in the hotel list
  - Verify HOTEL DUMMY shows "0 rooms available" or similar empty state
  - Navigate to HOTEL DUMMY detail page
  - Verify NO room cards are displayed
  - Verify "No rooms available" or similar message is shown

- [ ] **HOTEL DUMMY hotel profile intact**
  - Log in as admin or HOTEL DUMMY owner
  - Navigate to Hotel Area (if owner) or Admin Panel → Hotel Visibility (if admin)
  - Verify HOTEL DUMMY hotel profile still exists
  - Verify hotel name, location, address, contact info are preserved
  - Verify only the rooms array is empty

- [ ] **Other hotels unaffected**
  - Log in as guest → Browse Hotels
  - Verify all other hotels still display their rooms correctly
  - Select a non-HOTEL DUMMY hotel
  - Verify room photos, descriptions, prices, and types are intact
  - Verify booking flow still works for other hotels

### Ghost Room Prevention Verification
- [ ] **No placeholder rooms appear**
  - Log in as guest → Browse Hotels
  - Verify NO rooms with empty fields (blank room number, $0 price, "No photos available") appear for any hotel
  - Navigate to multiple hotel detail pages
  - Verify all displayed rooms have valid data (room number, type, price, photos)

- [ ] **Hotel Area → Rooms (non-HOTEL DUMMY)**
  - Log in as a different hotel owner (not HOTEL DUMMY)
  - Navigate to Hotel Area → Rooms tab
  - Verify all rooms are displayed correctly
  - Verify room editing and photo upload still work
  - Verify no ghost/placeholder rooms appear

- [ ] **Admin panel hotel visibility**
  - Log in as admin → Admin Panel → Hotel Visibility
  - Verify all hotels are listed
  - Verify hotel visibility toggles still work
  - Verify subscription status updates still work

### Idempotency Check
- [ ] **Subsequent upgrades safe**
  - After initial deployment, trigger another canister upgrade (or wait for next deployment)
  - Verify HOTEL DUMMY still shows zero rooms (no errors)
  - Verify other hotels remain unaffected
  - Verify no duplicate cleanup operations occur

## Legacy Data Cleanup Verification (V39)
**Context:** This release includes backend cleanup to remove ghost room photos and legacy payment methods (GOPAY, email-as-payment-method) that were reported as undeletable. The active hotel token is `HOTEL_17705984310722985941` and must remain intact.

- [ ] **Ghost room photos removed**
  - Log in as guest → Browse Hotels
  - Verify NO old/ghost room photos appear in hotel cards
  - Navigate to hotel detail page for the active hotel
  - Verify ONLY current room photos (uploaded via Hotel Portal) are displayed
  - Verify room cards do not show duplicate or legacy photos

- [ ] **Admin view - ghost photos removed**
  - Log in as admin → Admin Panel → Bookings Overview
  - Browse hotel listings
  - Verify NO old/ghost room photos appear in any hotel view
  - Verify hotel data is consistent with guest view

- [ ] **Legacy payment methods removed**
  - Log in as hotel owner (token `HOTEL_17705984310722985941`)
  - Navigate to Hotel Area → Payments tab
  - Verify GOPAY payment method is NOT present
  - Verify email is NOT listed as a payment method
  - Verify payment methods list is empty or contains only newly added methods

- [ ] **Active hotel data preserved**
  - Log in as hotel owner (token `HOTEL_17705984310722985941`)
  - Navigate to Hotel Area → Rooms tab
  - Verify ALL current rooms and their photos are present and correct
  - Verify room editing and photo upload still work
  - Navigate to Profile tab
  - Verify hotel profile data (name, location, address, contact) is intact

- [ ] **Hotel can add new payment methods**
  - Log in as hotel owner
  - Navigate to Hotel Area → Payments tab
  - Add a new payment method (e.g., "Bank Transfer", "BCA 1234567890")
  - Verify payment method is saved and displayed
  - Log out → log in as guest → view hotel detail
  - Verify new payment method appears in guest view

- [ ] **Legacy token cleanup**
  - Log in as admin → Admin Panel → Invite Tokens
  - Verify legacy token `1-invite-1770546868497298151` is marked as "Used" or "Unbound (Legacy)"
  - Verify it does NOT appear in active/valid token lists
  - Verify no data from this legacy token appears anywhere in the app

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
- **V39 Note:** If ghost photos or legacy payment methods still appear after deployment, use Admin Panel → Data Cleanup Utility to manually remove them by hotel principal and room ID
- **V40+ Note:** The HOTEL DUMMY purge is a one-time operation that runs automatically during upgrade. If HOTEL DUMMY still shows rooms after deployment, contact the development team immediately.
- **V43 Note:** Hotel activation gating is now enforced for /hotel route. Purged hotels must re-activate via new invite token before accessing Hotel Area.
