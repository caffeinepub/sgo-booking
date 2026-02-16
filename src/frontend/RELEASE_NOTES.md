# Release Notes

## V44 Rollback (February 10, 2026)

### Summary
Emergency rollback to Version 44 to restore critical functionality that was degraded in V47. This rollback addresses admin panel errors, invite token generation issues, and hotel activation detection problems.

### What Was Restored
- **Admin Panel**: Fixed runtime errors and blank screen issues on /admin route
- **Invite Token Generation**: Restored working token generation (no longer stuck in "Generating..." state)
- **Token Visibility**: Existing tokens are now visible and listed again for admins
- **Hotel Activation**: Removed "restoration in progress" blocking messages
- **Activation Detection**: Restored v44 role-based hotel activation detection (not based on null hotelProfile stub)
- **Navigation**: Hotel Area access works again for previously-activated hotel accounts

### Technical Changes
- `useQueries.ts`: Rolled back v47 compatibility stubs to v44 behavior
  - `useConsumeInviteToken`: Now uses `submitRSVP` backend method for activation
  - `useCreateInviteToken`: Properly handles token generation without getting stuck
  - `useIsCallerHotelActivated`: New hook using role-based activation check (v44 behavior)
  - Removed v47-only error-throwing stubs that blocked functionality
- `InviteTokensPanel.tsx`: Removed "functionality being restored" warning, restored v44 UI
- `HotelActivationForm.tsx`: Removed "currently being restored" blocking message
- `RequireRole.tsx`: Uses `useIsCallerHotelActivated` hook instead of null hotelProfile check
- `MainMenuPage.tsx`: Uses `useIsCallerHotelActivated` for correct status display
- `AccountStatusPage.tsx`: Uses `useIsCallerHotelActivated` for activation status
- `buildInfo.ts`: Set BUILD_VERSION to 'v44'

### Regression Verification
- [x] Admin Panel loads without errors
- [x] Invite token generation works
- [x] Existing tokens visible to admins
- [x] Hotel activation works
- [x] Previously-active hotels can access Hotel Area
- [x] Build version displays as v44

### Known Limitations (Unchanged from V44)
- Hotel profile management not yet implemented (backend limitation)
- Booking system not yet implemented (backend limitation)
- Payment method management not yet implemented (backend limitation)
- Room deletion not yet implemented (backend limitation)

### Migration Notes
- No data migration required for rollback
- Existing invite tokens preserved
- Previously activated hotel accounts remain active
- User profiles preserved

---

## V47 - Backend Compatibility Restoration (Previous)

### Summary
Restored frontend compatibility with simplified backend after blob storage migration. Implemented graceful degradation for unavailable features and improved error handling.

### What Changed
- **Blob Storage Migration**: Migrated room photo uploads from data URLs to blob storage system
- **Backend Compatibility**: Added runtime method availability checks to prevent crashes
- **Graceful Degradation**: Unavailable features now show clear messages instead of crashing
- **Error Handling**: Improved error messages and loading states across the app

### Technical Changes
- `useQueries.ts`: Added `hasMethod` helper and compatibility layer for missing backend methods
- `RoomsPanel.tsx`: Migrated to blob storage for photo uploads with progress tracking
- `InviteTokensPanel.tsx`: Added informational alert about functionality restoration
- `HotelActivationForm.tsx`: Added clear notice about activation being restored
- `REGRESSION_CHECKLIST.md`: Added V47 section for compatibility verification
- `buildInfo.ts`: Set BUILD_VERSION to 'v47'

### Regression Verification
- [x] Blob storage uploads work
- [x] Existing data URLs continue to display
- [x] Missing backend methods don't crash the app
- [x] Error messages are clear and actionable

### Known Issues
- Some features temporarily unavailable pending backend implementation
- Hotel activation functionality being restored
- Invite token system in compatibility mode

---

## Previous Versions
[Previous release notes preserved for reference...]
