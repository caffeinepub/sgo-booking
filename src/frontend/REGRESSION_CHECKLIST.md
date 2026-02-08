# SGO-Booking Frontend Regression Checklist

## Pre-Release Validation Checklist

### Authentication & Authorization (V24 Restored)

#### Login/Logout Flow
- [ ] Login with Internet Identity works without errors
- [ ] After logout, all cached queries are cleared (queryClient.clear())
- [ ] After logout → login with different account, new account's role/admin/hotel data loads correctly
- [ ] No stale data from previous session appears after switching accounts

#### Admin Account Verification
- [ ] Admin account shows "Is Admin: Yes" in Account Status page
- [ ] Admin account can access /admin route (Admin Panel visible)
- [ ] Admin account can access /hotel route (Hotel Management visible)
- [ ] TopNav shows both "Admin Panel" and "Hotel Area" links for admin
- [ ] Admin Panel displays: Invite Tokens, Hotel Visibility, Bookings sections

#### Hotel Account Verification
- [ ] Hotel owner account shows role as "Hotel" in Account Status
- [ ] Activated hotel owner can access /hotel route
- [ ] Hotel Management shows all tabs: Profile, Rooms, Payments, Bookings, Record Stays, Subscription
- [ ] TopNav shows "Hotel Area" link for activated hotel owner
- [ ] Unactivated hotel owner sees activation form when accessing /hotel

#### Guest Account Verification
- [ ] Guest account shows role as "Guest" in Account Status
- [ ] Guest cannot access /admin (shows Access Denied)
- [ ] Guest cannot access /hotel (shows Access Denied)
- [ ] TopNav does NOT show "Admin Panel" or "Hotel Area" for guests
- [ ] Guest can browse hotels and view hotel details

#### Role Query Caching (Critical V24 Fix)
- [ ] Role queries (callerUserRole, isCurrentUserAdmin, callerHotelProfile) are scoped to principal ID
- [ ] After logout, role queries are disabled (enabled: !!identity)
- [ ] After login, role queries refetch with new principal's data
- [ ] No "flash" of wrong role/access level when switching accounts

### Room Management

#### Room Creation
- [ ] Hotel owner can create a new room via Rooms tab
- [ ] Room form validates all required fields (number, type, price, currency)
- [ ] Room photos can be uploaded (multiple files)
- [ ] After successful creation, room appears in Rooms table immediately
- [ ] After successful creation, room appears in Browse Hotels (guest view) immediately
- [ ] Error messages surface clearly if creation fails

#### Room Photo Display
- [ ] Room photos display as thumbnails in Rooms table (hotel view)
- [ ] Room photos display in hotel cards on Browse Hotels page (guest view)
- [ ] Room photos display in Hotel Detail page (guest view)
- [ ] Click on thumbnail opens full-size preview dialog
- [ ] Invalid/failed images show fallback placeholder
- [ ] All valid data: URL formats are supported (data:image/*, data:application/*, http://, https://, blob:)

#### Room Editing
- [ ] Hotel owner can edit existing room details
- [ ] Hotel owner can add/remove room photos
- [ ] After successful update, changes reflect immediately in all views (hotel table, browse page, detail page)
- [ ] No page reload required to see updated photos

#### Room Persistence
- [ ] After creating/editing room, refresh page → changes persist
- [ ] After logout → login, rooms and photos still display correctly
- [ ] After canister upgrade/restart, rooms and photos still display correctly

### Booking Flow

#### Guest Booking
- [ ] Guest can view hotel details and room list
- [ ] Guest can select dates, guest count, and create booking
- [ ] Booking appears in "My Bookings" (Guest Account page)
- [ ] Booking appears in hotel owner's Bookings tab
- [ ] Booking appears in Admin Panel bookings overview

#### Payment Proof Upload
- [ ] Guest can upload payment proof for pending booking
- [ ] Payment proof displays in booking details dialog
- [ ] Hotel owner can see payment proof in their bookings view

#### Hotel Owner Actions
- [ ] Hotel owner can update booking status (e.g., mark as booked, checked-in)
- [ ] Hotel owner can record stay completion for eligible bookings
- [ ] Status changes reflect immediately in all views

### Admin Functions

#### Invite Token Management
- [ ] Admin can generate principal-bound invite tokens
- [ ] Generated tokens display with bound principal
- [ ] Tokens table shows all active/inactive tokens

#### Hotel Visibility Control
- [ ] Admin can toggle hotel active/inactive status
- [ ] Admin can change subscription status (Paid/Unpaid/TEST)
- [ ] Inactive hotels do not appear in guest Browse Hotels view
- [ ] Active hotels with Paid/TEST subscription appear in Browse Hotels

#### Hotel Activation
- [ ] Admin can activate hotel owner via "Activate Hotel Owner" button
- [ ] After activation, hotel owner can immediately access /hotel
- [ ] After activation, hotel profile loads without errors

### UI/UX

#### Navigation
- [ ] All navigation links work correctly (no 404s)
- [ ] Role-based navigation visibility is correct (admin/hotel/guest)
- [ ] Breadcrumbs/back buttons navigate correctly

#### Loading States
- [ ] Loading spinners display during data fetch
- [ ] No infinite loading states (all queries have error handling)
- [ ] Skeleton loaders or placeholders for slow-loading content

#### Error Handling
- [ ] Network errors display user-friendly messages
- [ ] Permission errors show Access Denied screen with clear messaging
- [ ] Form validation errors display inline
- [ ] Toast notifications for success/error actions

#### Responsive Design
- [ ] All pages render correctly on mobile (320px+)
- [ ] All pages render correctly on tablet (768px+)
- [ ] All pages render correctly on desktop (1024px+)
- [ ] Navigation collapses appropriately on mobile

### Data Integrity

#### Cross-Account Isolation
- [ ] Hotel owner A cannot see/edit hotel owner B's data
- [ ] Guest A cannot see guest B's bookings
- [ ] Admin can see all data across all accounts

#### Concurrent Updates
- [ ] Multiple users editing different rooms → no conflicts
- [ ] Multiple guests booking same room → handled correctly
- [ ] Admin actions (activate/deactivate) reflect immediately for affected users

### Performance

#### Query Optimization
- [ ] No unnecessary refetches on every render
- [ ] Queries use appropriate staleTime/cacheTime
- [ ] Mutations invalidate only relevant queries

#### Image Loading
- [ ] Room photos load progressively (thumbnails first)
- [ ] Failed images don't block page render
- [ ] Large images don't cause layout shift

### Build & Deployment

#### Build Verification
- [ ] Build version displays in footer (v24-restored)
- [ ] No console errors in production build
- [ ] All assets load correctly (images, fonts, icons)

#### Post-Deployment Smoke Test
- [ ] Login works in production
- [ ] Admin account can access admin panel
- [ ] Hotel account can access hotel area
- [ ] Guest can browse and book hotels
- [ ] All critical user flows complete successfully

---

## How to Use This Checklist

1. **Before Release**: Run through all items manually or via automated tests
2. **After V24 Restore**: Focus on Authentication & Authorization section first
3. **Mark Items**: Check off items as you verify them
4. **Document Issues**: Note any failures with steps to reproduce
5. **Retest Fixes**: After fixing issues, retest affected items

## Critical V24 Verification Steps

After deploying V24 restore, verify these scenarios in order:

1. **Admin Account Test**:
   - Login with admin principal
   - Verify "Is Admin: Yes" in Account Status
   - Navigate to /admin → should see Admin Panel
   - Navigate to /hotel → should see Hotel Management
   - Logout

2. **Hotel Account Test**:
   - Login with hotel owner principal
   - Verify role shows "Hotel" in Account Status
   - Navigate to /hotel → should see Hotel Management with all tabs
   - Verify TopNav shows "Hotel Area" link
   - Logout

3. **Guest Account Test**:
   - Login with guest principal (or stay logged out)
   - Verify role shows "Guest" in Account Status
   - Try to navigate to /admin → should see Access Denied
   - Try to navigate to /hotel → should see Access Denied
   - Verify TopNav does NOT show admin/hotel links

4. **Cross-Session Cache Test**:
   - Login as Admin → verify admin access
   - Logout (verify queryClient.clear() called)
   - Login as Guest → verify NO admin access (no stale cache)
   - Logout
   - Login as Hotel → verify hotel access only

If all 4 scenarios pass, V24 role-based access is correctly restored.
