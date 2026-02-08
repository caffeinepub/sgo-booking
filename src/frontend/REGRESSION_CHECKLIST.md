# SGO-Booking Frontend Regression Checklist

This checklist documents critical user flows and implementation details that must remain functional after code changes.

## Pre-Release Validation

### 1. Authentication & Role Resolution
- [ ] **Login Flow**: User can authenticate with Internet Identity
- [ ] **Anonymous Access**: Unauthenticated users can browse hotels (no login required)
- [ ] **Role Detection**: After login, `useGetCallerUserRole()` correctly returns user/admin role
- [ ] **Admin Detection**: `useIsCurrentUserAdmin()` correctly identifies admin users
- [ ] **Profile Setup**: First-time users are prompted to complete profile (name required)

**Implementation Notes:**
- TopNav uses `useIsCurrentUserAdmin()` to show/hide Admin Panel link
- RequireRole uses `useGetCallerUserRole()` for access control
- Both queries depend on actor initialization and use explicit boolean checks

### 2. Navigation Visibility
- [ ] **Guest User**: Sees Home, Browse Hotels, My Bookings, Account
- [ ] **Hotel Owner (Activated)**: Additionally sees Hotel Area
- [ ] **Admin**: Sees all links including Admin Panel
- [ ] **Hotel Owner (Not Activated)**: Does not see Hotel Area until activated

**Implementation Notes:**
- TopNav conditionally fetches hotel profile only when authenticated
- Hotel Area link shown for admins without waiting on hotel profile loading
- Uses `isAuthenticated && (isAdmin || (hotelProfile && hotelProfile.active))`

### 3. Route Access Control
- [ ] **/browse**: Accessible to all users (no auth required)
- [ ] **/my-bookings**: Requires authentication (RequireAuth)
- [ ] **/account-status**: Requires authentication (RequireAuth)
- [ ] **/hotel-area**: Requires authentication + UserRole.user (RequireRole)
- [ ] **/admin**: Requires authentication + UserRole.admin (RequireRole)

**Implementation Notes:**
- RequireAuth wraps routes requiring login
- RequireRole wraps routes requiring specific roles
- RequireRole conditionally fetches hotel profile only when UserRole.user is in allowedRoles
- Error handling: role/admin query failures show GuardErrorScreen instead of infinite spinner

### 4. Hotel Activation Flow
- [ ] **Admin Creates Token**: Admin can generate principal-bound invite token
- [ ] **Hotel Owner Validates**: Hotel owner can validate token (shows success/error)
- [ ] **Hotel Owner Activates**: Consuming token creates hotel profile and sets active=true
- [ ] **Immediate Unlock**: After activation, Hotel Area link appears without page reload
- [ ] **Admin Direct Activation**: Admin can directly activate hotel via principal ID

**Implementation Notes:**
- InviteTokensPanel requires Hotel Principal input field with client-side validation
- HotelActivationForm shows real-time validation status
- Query invalidation after activation: callerUserRole, hotels, callerHotelProfile, isCurrentUserAdmin
- MainMenuPage uses getCallerHotelProfile for immediate unlock state

### 5. Admin Panel Access
- [ ] **Admin Only**: Non-admin users see AccessDeniedScreen
- [ ] **Invite Tokens**: Admin can create/view principal-bound tokens
- [ ] **Hotel Visibility**: Admin can toggle hotel active/inactive status
- [ ] **Bookings Overview**: Admin can view all bookings across all hotels

**Implementation Notes:**
- Admin routes wrapped with RequireRole allowedRoles={[UserRole.admin]}
- Backend enforces authorization via AccessControl.isAdmin checks
- Frontend shows clear guidance on visibility rules (only active hotels shown to non-admin users)

### 6. Hotel Management (Hotel Area)
- [ ] **Profile Editing**: Hotel owner can update name, location, address, map link
- [ ] **Room Management**: Hotel owner can create/edit rooms with photos
- [ ] **Multi-Image Upload**: File picker allows multiple image selection
- [ ] **Image Preview**: Selected images shown with removal option before save
- [ ] **Bookings View**: Hotel owner sees bookings for their hotel only
- [ ] **Stay Completion**: Hotel owner can mark eligible bookings as completed

**Implementation Notes:**
- HotelAreaPage uses getCallerHotelProfile for activation detection
- RoomsPanel converts selected files to data URLs for persistence in Room.pictures array
- Photo count displayed in table, images removable before save
- All panels fetch their own data internally (no props needed)

### 7. Guest Booking Flow
- [ ] **Browse Hotels**: Guest can view list of active hotels
- [ ] **Hotel Details**: Guest can view hotel info, address, map link, and rooms
- [ ] **Room Photos**: Room photos displayed in grid with lightbox preview
- [ ] **Profile Gate**: Booking requires completed user profile
- [ ] **Booking Creation**: Guest can create booking with check-in/out dates and guest count
- [ ] **Booking Confirmation**: Success toast shown, booking appears in My Bookings

**Implementation Notes:**
- BrowseHotelsPage shows only active hotels (backend filters for non-admin users)
- HotelDetailPage shows address and clickable map link when present
- ProfileCompletionGate blocks booking flow until profile saved
- BookingForm validates dates and guest count (max 2)

### 8. Booking Status Updates
- [ ] **Pending Transfer**: Initial status after booking creation
- [ ] **Payment Proof Upload**: Guest can upload payment proof (status → Booked)
- [ ] **Hotel Owner Actions**: Hotel owner can update booking status
- [ ] **Stay Completion**: Hotel owner can mark booking as Checked In

**Implementation Notes:**
- BookingStatusBadge shows appropriate variant styling for each status
- Backend enforces authorization (only booking owner or hotel owner can update)
- RecordStayPanel filters eligible bookings (Booked or Checked In status)

### 9. Multi-Currency Support
- [ ] **Currency Selection**: Hotel owner can select currency (IDR, USD, SGD, BRL) when creating/editing rooms
- [ ] **Room Price Display**: Room prices shown with correct currency symbol in Hotel Area
- [ ] **Booking Total Calculation**: Booking total computed from room price × nights with correct currency
- [ ] **Booking Display**: Guest/Hotel/Admin booking tables show amounts with correct currency
- [ ] **Backward Compatibility**: Existing bookings without currency default to IDR

**Implementation Notes:**
- RoomsPanel uses Select dropdown for currency (not free-text input)
- formatMoney() utility provides consistent currency formatting
- BookingForm passes room.pricePerNight and room.currency to compute total
- useCreateBooking mutation includes currency parameter
- All booking tables use formatMoney(booking.totalPrice, booking.currency)

### 10. Hotel Payment Methods
- [ ] **Add Payment Method**: Hotel owner can add payment methods (name + details)
- [ ] **Remove Payment Method**: Hotel owner can delete payment methods
- [ ] **Persistence**: Payment methods persist after refresh/login
- [ ] **Guest Display**: Guest sees hotel's payment methods on hotel detail page
- [ ] **Empty State**: Guest sees clear message when hotel has no payment methods
- [ ] **No Admin Contact**: Guest booking UI does not show admin WhatsApp/email/e-wallet

**Implementation Notes:**
- HotelPaymentMethodsPanel in Hotel Area → Payments tab
- useAddPaymentMethod and useRemovePaymentMethod mutations invalidate callerHotelProfile and hotels queries
- HotelPaymentMethodsList shows hotel-specific payment methods or English empty state
- ContactPaymentInstructions component scoped to admin/hotel activation context only

### 11. Guest Internet Identity Display
- [ ] **Guest View**: Guest can view their own booking details with their principal ID
- [ ] **Copy to Clipboard**: Guest can copy their Internet Identity with one click
- [ ] **Hotel Owner View**: Hotel owner can see guest principal for bookings at their hotel
- [ ] **Admin View**: Admin can see guest principal for all bookings
- [ ] **Authorization**: No unauthorized user can view another guest's principal

**Implementation Notes:**
- BookingDetailsDialog component shows booking metadata and guest principal
- showGuestPrincipal prop controls visibility (true for guest/hotel/admin views)
- Copy action uses navigator.clipboard.writeText with toast feedback
- Backend enforces authorization via existing booking visibility rules

### 12. Booking Visibility Scoping
- [ ] **Guest Bookings**: Guest sees only their own bookings in My Bookings
- [ ] **Hotel Bookings**: Hotel owner sees only bookings for their hotel in Hotel Area → Bookings
- [ ] **Admin Bookings**: Admin sees all bookings across all hotels in Admin Panel → Bookings
- [ ] **Cross-Hotel Isolation**: Hotel A owner cannot see Hotel B bookings

**Implementation Notes:**
- GuestAccountPage filters bookings by caller principal (defensive UI safeguard)
- HotelBookingsPanel uses hotelProfile.id (not caller principal) for hotelId filter
- AdminBookingsPanel fetches all bookings without filters
- Backend getBookings enforces authorization based on caller role and ownership

## Testing Procedure

1. **Fresh Login Test**
   - Clear browser storage
   - Login with Internet Identity
   - Verify profile setup prompt appears
   - Complete profile and verify access granted

2. **Role-Based Access Test**
   - Login as guest → verify limited navigation
   - Login as hotel owner → verify Hotel Area access
   - Login as admin → verify Admin Panel access

3. **Hotel Activation Test**
   - Admin creates principal-bound token
   - Hotel owner validates and consumes token
   - Verify Hotel Area link appears immediately
   - Verify hotel profile created and active

4. **Booking Flow Test**
   - Guest browses hotels
   - Guest views hotel details and rooms
   - Guest creates booking (verify profile gate)
   - Verify booking appears in My Bookings
   - Verify booking appears in Hotel Area for hotel owner
   - Verify booking appears in Admin Panel for admin

5. **Multi-Currency Test**
   - Hotel owner creates room with IDR currency and price 500000
   - Guest books room for 1 night
   - Verify booking total shows "Rp 500,000" (not "$100")
   - Verify currency displayed correctly in all booking tables
   - Test with USD, SGD, BRL currencies

6. **Payment Methods Test**
   - Hotel owner adds payment methods in Hotel Area → Payments
   - Guest views hotel detail page and sees payment methods
   - Hotel owner removes payment method
   - Guest views hotel with no payment methods and sees empty state message
   - Verify no admin contact details shown on guest booking UI

7. **Guest Identity Test**
   - Guest creates booking and views details in My Bookings
   - Verify guest can see and copy their Internet Identity
   - Hotel owner views booking in Hotel Area → Bookings
   - Verify hotel owner can see guest principal
   - Admin views booking in Admin Panel
   - Verify admin can see guest principal

8. **Booking Visibility Test**
   - Create bookings for Hotel A and Hotel B
   - Login as Hotel A owner → verify only Hotel A bookings shown
   - Login as Hotel B owner → verify only Hotel B bookings shown
   - Login as guest → verify only own bookings shown
   - Login as admin → verify all bookings shown

## Known Issues & Workarounds

### Issue: Hotel Profile Query Rejection
**Symptom**: Unauthenticated or non-activated users see infinite spinner when hotel profile query fails
**Root Cause**: Backend traps on unauthorized getCallerHotelProfile calls
**Fix**: useGetCallerHotelProfile wraps backend call in try/catch, returns null on rejection
**Verification**: RequireRole shows GuardErrorScreen instead of infinite spinner

### Issue: Profile Setup Modal Flash
**Symptom**: Profile setup modal briefly appears even when user has profile
**Root Cause**: Race condition between actor initialization and profile query
**Fix**: useGetCallerUserProfile returns custom isLoading state that includes actorFetching
**Verification**: Use `isAuthenticated && !profileLoading && isFetched && userProfile === null` for modal trigger

### Issue: Hotel Area Link Visibility Delay
**Symptom**: Hotel Area link doesn't appear immediately after admin activation
**Root Cause**: Query invalidation doesn't trigger re-render in TopNav
**Fix**: TopNav conditionally fetches hotel profile only when authenticated, shows Hotel Area for admins without waiting
**Verification**: After activation, Hotel Area link appears without page reload

### Issue: Hardcoded Booking Total
**Symptom**: Booking total always shows "$100" regardless of room price
**Root Cause**: BookingForm used hardcoded `nights * 100` instead of room.pricePerNight
**Fix**: BookingForm accepts room prop, computes total as `nights * room.pricePerNight`, passes currency to backend
**Verification**: Booking for 500000 IDR room shows "Rp 500,000" total

### Issue: Admin Payment Contact in Guest Booking
**Symptom**: Guest booking UI shows admin WhatsApp/email/e-wallet for payment
**Root Cause**: ContactPaymentInstructions component used on guest booking page
**Fix**: Replace with HotelPaymentMethodsList showing hotel-specific payment methods
**Verification**: Guest sees hotel payment methods or empty state, no admin contact details

## Deployment Checklist

- [ ] All regression tests pass
- [ ] No console errors in browser
- [ ] Build version updated in buildInfo.ts
- [ ] Backend migration.mo handles schema changes (if any)
- [ ] Query invalidation triggers correct re-renders
- [ ] Loading states show appropriate spinners
- [ ] Error states show GuardErrorScreen or toast messages
- [ ] Multi-currency formatting works across all views
- [ ] Hotel payment methods persist and display correctly
- [ ] Guest Internet Identity visible and copyable in booking details
- [ ] Booking visibility scoped correctly (guest/hotel/admin)
