# Pre-Release Regression Checklist

## Authentication & Authorization
- [ ] Login/logout flow works correctly
- [ ] Admin role is properly assigned and persists
- [ ] Hotel owner activation works via invite tokens
- [ ] Guest users can browse without login
- [ ] Protected routes redirect to login when needed

## Hotel Management
- [ ] Hotel profile creation and editing works
- [ ] Hotel contact info (WhatsApp, email) saves correctly
- [ ] Hotel visibility toggles (active/inactive) work
- [ ] Subscription status changes (Paid/Unpaid/TEST) work
- [ ] Only active hotels with paid/test subscriptions are visible to guests

## Room Management (Critical - Detailed Verification)

### Room Creation & Persistence
1. **As Hotel Owner:**
   - [ ] Log in as hotel owner (activated hotel account)
   - [ ] Navigate to Hotel Area > Rooms tab
   - [ ] Click "Add Room" button
   - [ ] Fill in all required fields:
     - Room Number (e.g., "101")
     - Room Type (e.g., "Deluxe")
     - Price per Night (e.g., "500000")
     - Currency (select from dropdown)
     - Upload 2-3 room photos
   - [ ] Click "Create Room" button
   - [ ] Verify success toast appears
   - [ ] Verify room appears immediately in the rooms table without page reload
   - [ ] Verify all fields display correctly (room number, type, price with currency symbol, photo count)
   - [ ] **Reload the page (F5 or Ctrl+R)**
   - [ ] Verify room still appears in the table after reload
   - [ ] Verify all data persists correctly after reload

2. **Room Update Flow:**
   - [ ] Click "Edit" button on an existing room
   - [ ] Modify room details (change price, add/remove photos, etc.)
   - [ ] Click "Update Room" button
   - [ ] Verify success toast appears
   - [ ] Verify changes appear immediately in the table without page reload
   - [ ] Reload the page
   - [ ] Verify updated data persists after reload

3. **Room Visibility - Guest View:**
   - [ ] Log out from hotel owner account
   - [ ] Navigate to Browse Hotels (as guest or log in as different user)
   - [ ] Find and click on the hotel that created rooms
   - [ ] Verify "Available Rooms" section displays the created rooms
   - [ ] Verify room details are correct (number, type, price, currency)
   - [ ] Verify room photos display correctly (click to view full size)
   - [ ] Verify "Book This Room" button is present and functional

4. **Room Visibility - Admin View:**
   - [ ] Log in as admin
   - [ ] Navigate to Browse Hotels
   - [ ] Click on the hotel
   - [ ] Verify all rooms are visible (same as guest view)
   - [ ] Navigate to Hotel Area (if admin is also hotel owner)
   - [ ] Verify rooms appear in the Rooms panel

5. **Error Handling:**
   - [ ] In Hotel Area > Rooms, verify loading state shows spinner with "Loading rooms..." message
   - [ ] If rooms fail to load, verify error alert displays with clear English message
   - [ ] In guest hotel detail page, verify loading state shows spinner
   - [ ] If rooms fail to load on guest page, verify error alert displays with retry option
   - [ ] Verify photo upload failures show error toast with clear message

6. **Data Persistence After Canister Upgrade:**
   - [ ] Create/update rooms as hotel owner
   - [ ] Perform canister upgrade (dfx deploy backend --mode upgrade)
   - [ ] Verify all room data persists after upgrade
   - [ ] Verify rooms still visible in hotel dashboard
   - [ ] Verify rooms still visible in guest hotel detail view

7. **Multi-Currency Support:**
   - [ ] Create rooms with different currencies (IDR, USD, SGD, BRL)
   - [ ] Verify currency symbols display correctly in all views
   - [ ] Verify formatMoney utility displays prices with proper formatting

## Booking Flow
- [ ] Guest can create booking for available room
- [ ] Booking requires user profile completion
- [ ] Payment proof upload works
- [ ] Booking status updates correctly
- [ ] Hotel owner can see bookings for their hotel only
- [ ] Admin can see all bookings
- [ ] Guest can see their own bookings
- [ ] Guest Internet Identity displays in booking details
- [ ] Multi-currency booking prices display correctly

## Payment Methods
- [ ] Hotel can add payment methods
- [ ] Hotel can remove payment methods
- [ ] Payment methods display on hotel detail page for guests
- [ ] Hotel contact info displays alongside payment methods

## Admin Panel
- [ ] Invite token generation works
- [ ] Principal-bound tokens validate correctly
- [ ] Hotel visibility controls work
- [ ] Subscription status management works
- [ ] Admin can view all bookings

## UI/UX
- [ ] No blank screens on default route
- [ ] Loading states display correctly with spinners and messages
- [ ] Error messages are user-friendly and in English
- [ ] Toast notifications appear for actions
- [ ] Forms validate input correctly
- [ ] Dialogs open/close properly
- [ ] Tables display data correctly
- [ ] Currency formatting is consistent across all views

## Data Persistence
- [ ] User profiles persist across sessions
- [ ] Hotel data persists after logout/login
- [ ] Room data persists after canister upgrade
- [ ] Booking data persists correctly
- [ ] Payment methods persist correctly

## Build & Deployment
- [ ] Build completes without errors
- [ ] No console errors in browser
- [ ] All routes are accessible
- [ ] Backend canister deploys successfully
- [ ] Frontend assets load correctly

## Notes
- All user-facing text must be in English
- Error states must be visible (not silent failures)
- Loading states must show clear feedback
- React Query cache invalidation must work automatically after mutations
