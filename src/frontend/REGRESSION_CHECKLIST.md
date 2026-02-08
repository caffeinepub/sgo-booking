# Pre-Release Regression Checklist

This checklist must be completed before deploying any new version to production.

## Authentication & Authorization

### V24 Verification Steps (Critical)
- [ ] **Admin Role Detection**
  - [ ] Log in as admin principal (ayatf-afj3q-z5wvo-4ocoi-x7lve-uel5k-yhe6p-ahp57-ww5ch-bc72g-wae)
  - [ ] Verify Account Status page shows `Is Admin: Yes` (not "No" or "Unknown")
  - [ ] Verify Account Status page shows correct Role (not "Unknown")
  - [ ] Verify "Admin Panel" link appears in TopNav
  - [ ] Verify "Hotel Area" link appears in TopNav
  - [ ] Verify /admin route is accessible without AccessDenied screen
  - [ ] Verify /hotel route is accessible without AccessDenied screen

- [ ] **Hotel Role Detection**
  - [ ] Log in as activated hotel owner
  - [ ] Verify Account Status page shows `Role: Hotel`
  - [ ] Verify Account Status page shows `Hotel Activated: Yes`
  - [ ] Verify "Hotel Area" link appears in TopNav (but not "Admin Panel")
  - [ ] Verify /hotel route is accessible
  - [ ] Verify /admin route shows AccessDenied screen

- [ ] **Guest Role Detection**
  - [ ] Log in as guest user (no hotel activation)
  - [ ] Verify Account Status page shows `Role: Guest`
  - [ ] Verify Account Status page shows `Hotel Activated: No`
  - [ ] Verify neither "Admin Panel" nor "Hotel Area" links appear in TopNav
  - [ ] Verify /admin route shows AccessDenied screen
  - [ ] Verify /hotel route shows AccessDenied screen

### Cross-Session Cache Isolation
- [ ] Log in as admin, verify admin access
- [ ] Log out, log in as guest, verify guest restrictions (no cached admin access)
- [ ] Log out, log in as hotel owner, verify hotel access (no cached guest/admin state)

### Post-Rollback Critical Tests
- [ ] After any rollback/restore operation:
  - [ ] Clear browser cache and localStorage
  - [ ] Log in as admin and verify all admin panels load
  - [ ] Verify no "Unknown" role states persist
  - [ ] Verify no infinite "Checking permissions..." spinners

## Core Functionality

### Hotel Browsing (Guest Flow)
- [ ] Browse Hotels page loads and displays hotel cards
- [ ] Hotel cards show representative room photos (not "No photos available" when photos exist)
- [ ] Click on hotel card navigates to hotel detail page
- [ ] Hotel detail page shows room photos and booking form
- [ ] Booking form allows date selection and guest count input
- [ ] Booking form calculates total price correctly
- [ ] Booking submission succeeds and shows confirmation

### Hotel Management (Hotel Owner Flow)
- [ ] Hotel Area page loads with all tabs (Profile, Rooms, Payments, Bookings, Stays, Subscription)
- [ ] Profile tab allows editing hotel name, location, address, map link, WhatsApp, email
- [ ] Rooms tab shows existing rooms with photos
- [ ] Rooms tab allows adding new rooms with photo upload
- [ ] Rooms tab allows editing existing rooms
- [ ] Room photo upload handles multiple images correctly
- [ ] Payments tab shows payment methods list
- [ ] Payments tab allows adding/removing payment methods
- [ ] Bookings tab shows bookings filtered to hotel owner's property
- [ ] Stays tab allows marking eligible bookings as completed
- [ ] Subscription tab shows subscription status

### Admin Panel (Admin Flow)
- [ ] Admin Panel page loads with all sections
- [ ] Invite Tokens section allows generating new tokens with bound principal
- [ ] Invite Tokens section validates principal format
- [ ] Invite Tokens table displays all tokens with bound principal
- [ ] Hotel Visibility section shows all hotels
- [ ] Hotel Visibility section allows toggling hotel active status
- [ ] Hotel Visibility section allows changing subscription status
- [ ] Bookings Overview section shows all bookings across all hotels

### Guest Account (Authenticated Guest Flow)
- [ ] My Account page loads
- [ ] My Bookings section shows user's bookings
- [ ] Booking details dialog opens when clicking on booking
- [ ] Booking status badges display correctly
- [ ] Payment proof upload works (if applicable)

## UI/UX

### Navigation
- [ ] TopNav shows correct links based on user role
- [ ] Language selector works (if multiple languages)
- [ ] Logout button works and clears session
- [ ] All navigation links lead to correct pages

### Responsive Design
- [ ] Test on mobile viewport (375px width)
- [ ] Test on tablet viewport (768px width)
- [ ] Test on desktop viewport (1920px width)
- [ ] All pages are readable and functional on all viewports

### Loading States
- [ ] All data fetching shows appropriate loading indicators
- [ ] No infinite loading spinners
- [ ] No blank screens during data loading

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Permission errors show AccessDenied screen with context
- [ ] Form validation errors are clear and actionable
- [ ] Failed image uploads show error messages

## Data Integrity

### Profile Management
- [ ] User profile creation works on first login
- [ ] User profile updates persist correctly
- [ ] Profile completion gate blocks access until profile is complete

### Hotel Activation
- [ ] Invite token validation works correctly
- [ ] Invite token consumption activates hotel owner
- [ ] Hotel profile is created after activation
- [ ] Hotel owner can access Hotel Area after activation

### Booking Flow
- [ ] Booking creation stores correct data
- [ ] Booking status updates work
- [ ] Payment proof upload and storage work
- [ ] Stay completion records correctly

### Room Management
- [ ] Room creation stores all fields correctly
- [ ] Room updates persist correctly
- [ ] Room photos upload and display correctly
- [ ] Room deletion works (if implemented)

## Performance

- [ ] Initial page load is under 3 seconds
- [ ] Hotel browsing page loads all hotels efficiently
- [ ] Room photos load without blocking UI
- [ ] No unnecessary re-renders or query refetches

## Security

- [ ] Unauthenticated users cannot access protected routes
- [ ] Guest users cannot access admin or hotel routes
- [ ] Hotel owners can only see their own hotel data
- [ ] Admins can see all data but cannot impersonate users

## Build & Deployment

- [ ] Build completes without errors
- [ ] Build version is correctly displayed in footer
- [ ] No console errors in production build
- [ ] All assets load correctly from CDN/static paths

---

**Tester Name:** _______________  
**Date:** _______________  
**Version Tested:** _______________  
**Result:** [ ] PASS [ ] FAIL  
**Notes:**
