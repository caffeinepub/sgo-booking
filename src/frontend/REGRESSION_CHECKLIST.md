# Regression Testing Checklist

## V44 Rollback Verification (February 10, 2026)

### Critical Rollback Items
- [x] Admin Panel loads without runtime errors (no blank screen) on /admin
- [x] Invite token generation works (no infinite "Generating…" state)
- [x] Existing tokens are visible/listed again for admins
- [x] Hotels that were previously active in v44 appear active again
- [x] Hotel Area access works for previously-activated hotel accounts
- [x] V47-only "restoration in progress / unavailable" degradation behavior removed
- [x] Hotel activation detection uses v44 role-based logic (not null hotelProfile stub)
- [x] Build version displays as v44 in app shell/footer

### Authentication & Authorization
- [ ] Internet Identity login flow works correctly
- [ ] User profile creation/editing works
- [ ] Admin role assignment works (makeMeAdmin for hardcoded admin)
- [ ] Role-based access control enforces correctly (guest/user/admin)
- [ ] Logout clears all cached data

### Admin Panel
- [ ] Admin panel accessible only to admins
- [ ] Invite token generation creates valid tokens
- [ ] Generated tokens appear in "Active Invite Codes" list
- [ ] Token copy-to-clipboard works
- [ ] Used tokens move to "Used Invite Codes" section
- [ ] Hotel visibility controls work (if backend supports)
- [ ] Bookings overview displays correctly (if backend supports)
- [ ] Principal purge panel works (if backend supports)
- [ ] Data cleanup utilities work (if backend supports)

### Hotel Activation
- [ ] Hotel activation form displays for non-activated users
- [ ] Token validation provides feedback
- [ ] Token consumption activates hotel account
- [ ] Activated hotels can access Hotel Area
- [ ] Hotel activation status updates immediately after activation
- [ ] Main menu shows correct activation status

### Hotel Management
- [ ] Hotel Area accessible to activated hotels and admins
- [ ] Room creation works with photo upload
- [ ] Room editing preserves existing data
- [ ] Room deletion works (if backend supports)
- [ ] Payment methods can be added/removed (if backend supports)
- [ ] Hotel profile editing works (if backend supports)
- [ ] Bookings panel displays hotel bookings (if backend supports)

### Guest Features
- [ ] Browse Hotels page displays available hotels
- [ ] Hotel detail page shows room information
- [ ] Booking form calculates prices correctly
- [ ] Booking creation works (if backend supports)
- [ ] My Bookings page displays user bookings (if backend supports)
- [ ] Booking cancellation works (if backend supports)

### UI/UX
- [ ] No blank screens or infinite loading states
- [ ] Error messages are clear and actionable
- [ ] Loading states display appropriately
- [ ] Navigation works correctly across all routes
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Dark mode works correctly (if implemented)

### Data Integrity
- [ ] Existing invite tokens preserved after rollback
- [ ] Previously activated hotel accounts remain active
- [ ] User profiles preserved
- [ ] No data loss during rollback

### Performance
- [ ] Page load times acceptable
- [ ] Query invalidation works correctly
- [ ] No unnecessary re-renders
- [ ] Image loading optimized

## V47 Compatibility Restoration (Previous)

### Blob Storage Migration
- [x] Room photo uploads work with blob storage
- [x] Existing data URLs continue to display
- [x] Upload progress tracking works
- [x] Error handling for failed uploads

### Graceful Degradation
- [x] Missing backend methods don't crash the app
- [x] Unavailable features show clear messages
- [x] Error boundaries catch and display errors
- [x] Loading states prevent blank screens

### Error Messages
- [x] Backend errors display user-friendly messages
- [x] Network errors handled gracefully
- [x] Validation errors clear and actionable
- [x] Toast notifications work correctly

## Notes
- Test with both hardcoded admin and regular users
- Verify on multiple browsers (Chrome, Firefox, Safari)
- Test with slow network conditions
- Check console for errors/warnings
- Verify all routes are accessible
